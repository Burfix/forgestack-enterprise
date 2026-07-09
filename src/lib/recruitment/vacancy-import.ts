// Historical migration path: parses a spreadsheet of legacy vacancies and
// matches each row against the live HR master-code tables (departments,
// sites, hr_hire_types, hr_contract_types, employees-as-hiring-managers).
//
// This never writes to `vacancies` itself — it only produces a judgement per
// row (matched / needs_review) with reasons, which the review UI shows to a
// human before anything is committed. See fs_commit_vacancy_import_row() for
// the actual write path.

import ExcelJS from 'exceljs'

export interface ParsedImportRow {
  rowNumber: number
  raw: Record<string, string>

  positionTitle: string | null
  departmentId: string | null
  departmentRaw: string | null
  siteId: string | null
  siteRaw: string | null
  hireTypeId: string | null
  hireTypeRaw: string | null
  contractTypeId: string | null
  contractTypeRaw: string | null
  hiringManagerId: string | null
  hiringManagerRaw: string | null
  priority: 'low' | 'normal' | 'high' | 'critical'
  targetStartDate: string | null

  status: 'matched' | 'needs_review'
  issues: string[]
}

interface MasterCodes {
  departments: { id: string; name: string }[]
  sites: { id: string; name: string }[]
  hireTypes: { id: string; name: string }[]
  contractTypes: { id: string; name: string }[]
  hiringManagers: { id: string; first_name: string; last_name: string }[]
}

// Column headers we recognise on the "vacancy listing" style sheet. A row is
// a candidate header row if it contains at least these three — everything
// else in the file (dashboards, formula summaries) will not match.
const REQUIRED_HEADERS = ['job title', 'department', 'portfolio']

// Legacy "Listing Reason" values don't line up 1:1 with the hr_hire_types
// master list. Known aliases are translated; anything else is flagged for a
// human to resolve rather than silently guessed at.
const HIRE_TYPE_ALIASES: Record<string, string> = {
  'new vacancy': 'New Position',
  'new position': 'New Position',
  replacement: 'Replacement',
  unscheduled: 'Unscheduled',
}

function normalise(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value).trim()
}

function findByName<T extends { name: string }>(list: T[], raw: string): T | null {
  const target = raw.trim().toLowerCase()
  if (!target) return null
  return list.find((item) => item.name.trim().toLowerCase() === target) ?? null
}

/** Locates the header row within a worksheet by looking for the required column names. */
function findHeaderRow(worksheet: ExcelJS.Worksheet): { rowNumber: number; columns: Map<string, number> } | null {
  for (let r = 1; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r)
    const columns = new Map<string, number>()
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const header = normalise(cell.value).toLowerCase()
      if (header) columns.set(header, colNumber)
    })
    if (REQUIRED_HEADERS.every((h) => columns.has(h))) {
      return { rowNumber: r, columns }
    }
  }
  return null
}

/**
 * Parses the first worksheet that looks like a vacancy listing (i.e. has the
 * required headers) and matches each data row against the master codes
 * already loaded in the organisation's database.
 */
export async function parseVacancyImportWorkbook(
  buffer: Buffer,
  masterCodes: MasterCodes
): Promise<ParsedImportRow[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer)

  let header: { rowNumber: number; columns: Map<string, number>; sheetName: string } | null = null
  for (const worksheet of workbook.worksheets) {
    const found = findHeaderRow(worksheet)
    if (found) {
      header = { ...found, sheetName: worksheet.name }
      break
    }
  }

  if (!header) {
    throw new Error(
      `No recognisable vacancy listing sheet found. Expected a sheet with columns for Job title, Department, and Portfolio.`
    )
  }

  const worksheet = workbook.getWorksheet(header.sheetName)!
  const col = (name: string) => header!.columns.get(name)

  const results: ParsedImportRow[] = []
  let outputRowNumber = 0

  for (let r = header.rowNumber + 1; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r)
    const jobTitleCol = col('job title')
    const jobTitle = jobTitleCol ? normalise(row.getCell(jobTitleCol).value) : ''

    // Blank rows (common padding in exported sheets) are skipped, not flagged.
    if (!jobTitle) continue

    outputRowNumber += 1
    const issues: string[] = []

    const get = (name: string): string => {
      const c = col(name)
      return c ? normalise(row.getCell(c).value) : ''
    }

    const raw: Record<string, string> = {}
    header.columns.forEach((colNumber, name) => {
      raw[name] = normalise(row.getCell(colNumber).value)
    })

    const departmentRaw = get('department')
    const department = findByName(masterCodes.departments, departmentRaw)
    if (!department) issues.push(`Department "${departmentRaw || '(blank)'}" doesn't match any active department.`)

    const siteRaw = get('portfolio')
    const site = findByName(masterCodes.sites, siteRaw)
    if (!site) issues.push(`Portfolio/Business unit "${siteRaw || '(blank)'}" doesn't match any active site.`)

    const contractTypeRaw = get('contract type')
    const contractType = contractTypeRaw ? findByName(masterCodes.contractTypes, contractTypeRaw) : null
    if (contractTypeRaw && !contractType) {
      issues.push(`Contract type "${contractTypeRaw}" doesn't match Permanent, Contract, or Learning program.`)
    }

    const listingReasonRaw = get('listing reason')
    let hireType: { id: string; name: string } | null = null
    if (listingReasonRaw) {
      const alias = HIRE_TYPE_ALIASES[listingReasonRaw.trim().toLowerCase()]
      hireType = alias ? findByName(masterCodes.hireTypes, alias) : null
      if (!hireType) {
        issues.push(
          `Listing reason "${listingReasonRaw}" doesn't map to a known Hire Type (New Position, Replacement, Unscheduled) — resolve manually.`
        )
      }
    }

    const hiringManagerRaw = get('hiring manager')
    const hiringManager = hiringManagerRaw
      ? masterCodes.hiringManagers.find(
          (m) => `${m.first_name} ${m.last_name}`.trim().toLowerCase() === hiringManagerRaw.trim().toLowerCase()
        ) ?? null
      : null
    if (hiringManagerRaw && !hiringManager) {
      issues.push(`Hiring manager "${hiringManagerRaw}" doesn't match any manager-level employee record.`)
    }

    const jobIdRaw = get('job id')
    // A known real-world quirk: some legacy rows have a Hire Type value
    // ("Unscheduled") sitting in the Job ID column instead of a real ID.
    // Not fatal on its own, but worth surfacing since it usually signals
    // the row was hand-edited and other fields may be unreliable too.
    if (jobIdRaw && ['unscheduled', 'new position', 'replacement'].includes(jobIdRaw.trim().toLowerCase())) {
      issues.push(`Job ID column contains "${jobIdRaw}" — looks like a Hire Type value was entered in the wrong column. Check this row's data carefully.`)
    }

    const startDateRaw = get('start date')
    let targetStartDate: string | null = null
    if (startDateRaw) {
      const parsed = new Date(startDateRaw)
      targetStartDate = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
    }

    results.push({
      rowNumber: outputRowNumber,
      raw,
      positionTitle: jobTitle,
      departmentId: department?.id ?? null,
      departmentRaw,
      siteId: site?.id ?? null,
      siteRaw,
      hireTypeId: hireType?.id ?? null,
      hireTypeRaw: listingReasonRaw || null,
      contractTypeId: contractType?.id ?? null,
      contractTypeRaw: contractTypeRaw || null,
      hiringManagerId: hiringManager?.id ?? null,
      hiringManagerRaw: hiringManagerRaw || null,
      priority: 'normal',
      targetStartDate,
      status: issues.length === 0 ? 'matched' : 'needs_review',
      issues,
    })
  }

  return results
}
