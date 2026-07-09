import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface ImportBatch {
  id: string
  filename: string
  status: 'pending_review' | 'committed' | 'discarded'
  row_count: number
  matched_count: number
  created_at: string
  committed_at: string | null
}

export interface ImportRow {
  id: string
  batch_id: string
  row_number: number
  raw_data: Record<string, string>
  position_title: string | null
  department_id: string | null
  site_id: string | null
  hire_type_id: string | null
  contract_type_id: string | null
  hiring_manager_id: string | null
  priority: 'low' | 'normal' | 'high' | 'critical'
  target_start_date: string | null
  status: 'matched' | 'needs_review' | 'rejected' | 'committed'
  issues: string[]
  committed_vacancy_id: string | null
}

export async function getImportBatches(organisationId: string): Promise<ImportBatch[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('vacancy_import_batches')
    .select('id, filename, status, row_count, matched_count, created_at, committed_at')
    .eq('organisation_id', organisationId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load import batches: ${error.message}`)
  return data ?? []
}

export async function getImportRows(batchId: string): Promise<ImportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('vacancy_import_rows')
    .select(
      'id, batch_id, row_number, raw_data, position_title, department_id, site_id, hire_type_id, contract_type_id, hiring_manager_id, priority, target_start_date, status, issues, committed_vacancy_id'
    )
    .eq('batch_id', batchId)
    .order('row_number')

  if (error) throw new Error(`Failed to load import rows: ${error.message}`)
  return data ?? []
}
