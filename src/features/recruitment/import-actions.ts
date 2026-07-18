'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentEmployeeId, getCurrentRoles, getOrganisationId } from '@/lib/session'
import { getSites, getDepartments, getHiringManagers, getContractTypes, getHireTypes } from '@/lib/db/reference-data'
import { parseVacancyImportWorkbook, type ParsedImportRow } from '@/lib/recruitment/vacancy-import'

interface ActionResult {
  ok: boolean
  message?: string
  batchId?: string
}

const AUTHORISED_ROLES = ['super_admin', 'hr_admin']

async function requireImportAccess(): Promise<{ ok: true } | { ok: false; message: string }> {
  const roles = await getCurrentRoles()
  if (!roles.some((r) => AUTHORISED_ROLES.includes(r))) {
    return {
      ok: false,
      message: 'Vacancy import is restricted to HR Admin and Super Admin roles. Ask an admin to run this, or to grant you the HR Admin role.',
    }
  }
  return { ok: true }
}

/**
 * Uploads a spreadsheet, matches every row against live master codes, and
 * stores the result as a review batch. Nothing is written to `vacancies`
 * here — see commitImportRow / commitAllMatchedRows for that.
 */
export async function uploadVacancyImportFile(formData: FormData): Promise<ActionResult> {
  const access = await requireImportAccess()
  if (!access.ok) return access

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { ok: false, message: 'Choose a spreadsheet file to upload.' }
  }
  if (!/\.xlsx?$/i.test(file.name)) {
    return { ok: false, message: 'Only .xlsx or .xls files are supported.' }
  }
  // 10MB is generous for a spreadsheet of vacancy rows; guards against an
  // accidental (or malicious) oversized upload tying up the server.
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, message: 'File is larger than 10MB — that\'s too large for a vacancy listing import. Check the file.' }
  }

  const orgId = await getOrganisationId()
  const actorEmployeeId = await getCurrentEmployeeId()
  const supabase = await createServerSupabaseClient()

  const [sites, departments, hiringManagers, contractTypes, hireTypes] = await Promise.all([
    getSites(orgId),
    getDepartments(orgId),
    getHiringManagers(orgId),
    getContractTypes(orgId),
    getHireTypes(orgId),
  ])

  let rows: ParsedImportRow[]
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    rows = await parseVacancyImportWorkbook(buffer, {
      departments,
      sites,
      hireTypes,
      contractTypes,
      hiringManagers,
    })
  } catch (err) {
    return {
      ok: false,
      message: `Couldn't read this file as a vacancy listing: ${err instanceof Error ? err.message : 'unknown error'}`,
    }
  }

  if (rows.length === 0) {
    return { ok: false, message: 'No vacancy rows found in this file — check it has a sheet with Job title, Department, and Portfolio columns.' }
  }

  const matchedCount = rows.filter((r) => r.status === 'matched').length

  const { data: batch, error: batchError } = await supabase
    .from('vacancy_import_batches')
    .insert({
      organisation_id: orgId,
      uploaded_by: actorEmployeeId,
      filename: file.name,
      row_count: rows.length,
      matched_count: matchedCount,
    })
    .select('id')
    .single()

  if (batchError || !batch) {
    if (batchError && (batchError.code === '42501' || /row-level security/i.test(batchError.message))) {
      return { ok: false, message: 'You don\'t have permission to start a vacancy import.' }
    }
    return { ok: false, message: batchError?.message ?? 'Could not create the import batch.' }
  }

  const { error: rowsError } = await supabase.from('vacancy_import_rows').insert(
    rows.map((r) => ({
      batch_id: batch.id,
      organisation_id: orgId,
      row_number: r.rowNumber,
      raw_data: r.raw,
      position_title: r.positionTitle,
      department_id: r.departmentId,
      site_id: r.siteId,
      hire_type_id: r.hireTypeId,
      contract_type_id: r.contractTypeId,
      hiring_manager_id: r.hiringManagerId,
      priority: r.priority,
      target_start_date: r.targetStartDate,
      status: r.status,
      issues: r.issues,
    }))
  )

  if (rowsError) {
    return { ok: false, message: rowsError.message }
  }

  revalidatePath('/hr/recruitment/import')
  return { ok: true, batchId: batch.id }
}

interface ResolveRowInput {
  rowId: string
  departmentId: string | null
  siteId: string | null
  hireTypeId: string | null
  contractTypeId: string | null
  hiringManagerId: string | null
  positionTitle: string
  priority: 'low' | 'normal' | 'high' | 'critical'
}

/** Lets a reviewer fix a row that came back needs_review — e.g. pick the right Department from a dropdown. */
export async function resolveImportRow(input: ResolveRowInput): Promise<ActionResult> {
  const access = await requireImportAccess()
  if (!access.ok) return access

  if (!input.positionTitle.trim() || !input.departmentId || !input.siteId) {
    return { ok: false, message: 'Position title, Department, and Portfolio/Business unit are required before this row can be marked resolved.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('vacancy_import_rows')
    .update({
      position_title: input.positionTitle.trim(),
      department_id: input.departmentId,
      site_id: input.siteId,
      hire_type_id: input.hireTypeId,
      contract_type_id: input.contractTypeId,
      hiring_manager_id: input.hiringManagerId,
      priority: input.priority,
      status: 'matched',
      issues: [],
    })
    .eq('id', input.rowId)
    .eq('status', 'needs_review') // don't silently re-resolve an already-committed row

  if (error) return { ok: false, message: error.message }

  revalidatePath('/hr/recruitment/import')
  return { ok: true }
}

/** Commits a single matched row to a real vacancy via the SECURITY DEFINER function. */
export async function commitImportRow(rowId: string): Promise<ActionResult> {
  const access = await requireImportAccess()
  if (!access.ok) return access

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.rpc('fs_commit_vacancy_import_row', { p_row_id: rowId })

  if (error) return { ok: false, message: error.message }

  revalidatePath('/hr/recruitment/import')
  revalidatePath('/hr/recruitment/pipeline')
  return { ok: true }
}

/** Commits every currently-matched row in a batch. Rows still needing review are left untouched. */
export async function commitAllMatchedRows(batchId: string): Promise<ActionResult> {
  const access = await requireImportAccess()
  if (!access.ok) return access

  const supabase = await createServerSupabaseClient()
  const { data: rows, error } = await supabase
    .from('vacancy_import_rows')
    .select('id')
    .eq('batch_id', batchId)
    .eq('status', 'matched')

  if (error) return { ok: false, message: error.message }
  if (!rows || rows.length === 0) {
    return { ok: false, message: 'No matched rows are ready to commit in this batch.' }
  }

  const failures: string[] = []
  for (const row of rows) {
    const { error: commitError } = await supabase.rpc('fs_commit_vacancy_import_row', { p_row_id: row.id })
    if (commitError) failures.push(commitError.message)
  }

  await supabase
    .from('vacancy_import_batches')
    .update({ status: 'committed', committed_at: new Date().toISOString() })
    .eq('id', batchId)

  revalidatePath('/hr/recruitment/import')
  revalidatePath('/hr/recruitment/pipeline')

  if (failures.length > 0) {
    return { ok: false, message: `Committed ${rows.length - failures.length} of ${rows.length} rows. Some failed: ${failures[0]}` }
  }
  return { ok: true, message: `Committed ${rows.length} vacancies.` }
}

export async function discardImportBatch(batchId: string): Promise<ActionResult> {
  const access = await requireImportAccess()
  if (!access.ok) return access

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('vacancy_import_batches')
    .update({ status: 'discarded' })
    .eq('id', batchId)

  if (error) return { ok: false, message: error.message }

  revalidatePath('/hr/recruitment/import')
  return { ok: true }
}
