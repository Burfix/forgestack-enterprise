// Shared HR domain types. All database-derived — keep in sync with schema.

export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'suspended' | 'terminated'
export type EmploymentType = 'permanent' | 'contract' | 'casual' | 'probation'
export type RoleLevel =
  | 'assistant'
  | 'operator'
  | 'technician'
  | 'senior_technician'
  | 'artisan'
  | 'red_seal'
  | 'supervisor'
  | 'manager'
  | 'executive'

export type QualificationStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'suspended'

export type QualificationCategory =
  | 'trade'
  | 'safety'
  | 'compliance'
  | 'health'
  | 'technical'
  | 'regulatory'
  | 'internal'

export type PathwayLevelKey =
  | 'assistant'
  | 'operator'
  | 'technician'
  | 'senior_technician'
  | 'artisan'
  | 'red_seal'

export interface QualificationSummary {
  id: string
  status: QualificationStatus
  expiry_date: string | null
  issue_date: string | null
  qualification_type: {
    id: string
    name: string
    category: QualificationCategory | null
    is_mandatory: boolean
  }
}

export interface EmployeeRow {
  id: string
  organisation_id: string
  employee_number: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  photo_url: string | null
  employment_status: EmploymentStatus
  employment_type: EmploymentType
  start_date: string | null
  end_date: string | null
  site_id: string | null
  id_number: string | null
  role: { id: string; title: string; level: RoleLevel | null } | null
  department: { id: string; name: string } | null
  manager: { id: string; first_name: string; last_name: string } | null
  qualifications: QualificationSummary[]
}

// Computed, not stored — derived in lib/db/employees.ts
export interface ReadinessScore {
  total: number
  validQuals: number    // 40
  noExpired: number     // 20
  medicalValid: number  // 20 (placeholder, always 20)
  noWarnings: number    // 20 (placeholder, always 20)
}

export type CategoryQualStatus = 'valid' | 'expiring' | 'expired' | 'missing' | 'in_progress'

export interface CategoryIconStatus {
  category: QualificationCategory
  status: CategoryQualStatus
}
