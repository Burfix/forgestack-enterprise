import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  EmployeeRow,
  ReadinessScore,
  CategoryIconStatus,
  CategoryQualStatus,
  QualificationCategory,
  QualificationSummary,
} from '@/types/hr'

export async function getEmployees(organisationId: string): Promise<EmployeeRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employees')
    .select(`
      id, organisation_id, employee_number,
      first_name, last_name, email, phone, photo_url,
      employment_status, employment_type,
      start_date, end_date, site_id, id_number,
      role:employee_roles(id, title, level),
      department:departments(id, name),
      site:site_id(id, name),
      manager:manager_id(id, first_name, last_name),
      qualifications:employee_qualifications(
        id, status, expiry_date, issue_date,
        qualification_type:qualification_types(id, name, category, is_mandatory)
      )
    `)
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('employee_number')

  if (error) throw new Error(`Failed to load employees: ${error.message}`)

  return (data ?? []).map(normaliseEmployee)
}

export async function getEmployee(
  organisationId: string,
  employeeId: string
): Promise<EmployeeRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employees')
    .select(`
      id, organisation_id, employee_number,
      first_name, last_name, email, phone, photo_url,
      employment_status, employment_type,
      start_date, end_date, site_id, id_number,
      role:employee_roles(id, title, level),
      department:departments(id, name),
      site:site_id(id, name),
      manager:manager_id(id, first_name, last_name),
      qualifications:employee_qualifications(
        id, status, expiry_date, issue_date,
        qualification_type:qualification_types(id, name, category, is_mandatory)
      )
    `)
    .eq('organisation_id', organisationId)
    .eq('id', employeeId)
    .is('deleted_at', null)
    .single()

  if (error) return null
  return normaliseEmployee(data)
}

// Supabase returns arrays or single objects for relations depending on cardinality.
// Normalise to the EmployeeRow shape regardless.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseEmployee(raw: any): EmployeeRow {
  const role = Array.isArray(raw.role) ? raw.role[0] ?? null : raw.role ?? null
  const department = Array.isArray(raw.department)
    ? raw.department[0] ?? null
    : raw.department ?? null
  const site = Array.isArray(raw.site) ? raw.site[0] ?? null : raw.site ?? null
  const manager = Array.isArray(raw.manager) ? raw.manager[0] ?? null : raw.manager ?? null
  const qualifications: QualificationSummary[] = (
    Array.isArray(raw.qualifications) ? raw.qualifications : []
  )
    .filter((q: QualificationSummary) => q != null)
    .map((q: QualificationSummary & { qualification_type: unknown }) => ({
      ...q,
      qualification_type: Array.isArray(q.qualification_type)
        ? (q.qualification_type[0] ?? null)
        : (q.qualification_type ?? null),
    }))

  return {
    id: raw.id,
    organisation_id: raw.organisation_id,
    employee_number: raw.employee_number,
    first_name: raw.first_name,
    last_name: raw.last_name,
    email: raw.email,
    phone: raw.phone,
    photo_url: raw.photo_url,
    employment_status: raw.employment_status,
    employment_type: raw.employment_type,
    start_date: raw.start_date,
    end_date: raw.end_date,
    site_id: raw.site_id,
    id_number: raw.id_number,
    role,
    department,
    site,
    manager,
    qualifications,
  }
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export function computeReadiness(employee: EmployeeRow): ReadinessScore {
  const qualsWithType = employee.qualifications.filter((q) => q.qualification_type != null)
  const now = Date.now()

  const hasValid = qualsWithType.some((q) => {
    if (q.status !== 'completed') return false
    if (!q.expiry_date) return true // no expiry = perpetual (e.g. Red Seal)
    return new Date(q.expiry_date).getTime() > now
  })

  const hasExpired = qualsWithType.some((q) => {
    if (q.status === 'expired') return true
    if (q.status === 'completed' && q.expiry_date) {
      return new Date(q.expiry_date).getTime() <= now
    }
    return false
  })

  const validQuals = hasValid ? 40 : 0
  const noExpired = hasExpired ? 0 : 20
  const medicalValid = 20 // Phase 1 placeholder
  const noWarnings = 20  // Phase 1 placeholder
  const total = validQuals + noExpired + medicalValid + noWarnings

  return { total, validQuals, noExpired, medicalValid, noWarnings }
}

export function computeCategoryIconStatuses(employee: EmployeeRow): CategoryIconStatus[] {
  const now = Date.now()
  const categoryMap = new Map<QualificationCategory, CategoryQualStatus>()

  for (const q of employee.qualifications) {
    const cat = q.qualification_type?.category
    if (!cat) continue

    let status: CategoryQualStatus
    if (q.status === 'expired') {
      status = 'expired'
    } else if (q.status === 'completed') {
      if (!q.expiry_date) {
        status = 'valid'
      } else {
        const expiryMs = new Date(q.expiry_date).getTime()
        const remaining = expiryMs - now
        if (remaining <= 0) status = 'expired'
        else if (remaining <= THIRTY_DAYS_MS) status = 'expiring'
        else if (remaining <= NINETY_DAYS_MS) status = 'expiring'
        else status = 'valid'
      }
    } else if (q.status === 'in_progress') {
      status = 'in_progress'
    } else {
      status = 'missing'
    }

    // Worst status wins for the category
    const existing = categoryMap.get(cat)
    if (!existing || statusSeverity(status) > statusSeverity(existing)) {
      categoryMap.set(cat, status)
    }
  }

  return Array.from(categoryMap.entries()).map(([category, status]) => ({
    category,
    status,
  }))
}

function statusSeverity(s: CategoryQualStatus): number {
  const order: Record<CategoryQualStatus, number> = {
    valid: 0,
    in_progress: 1,
    expiring: 2,
    missing: 3,
    expired: 4,
  }
  return order[s]
}
