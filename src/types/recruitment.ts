// Recruitment -> HR Command Centre domain types.
// Mirrors src/types/hr.ts conventions. Kept in sync with the
// recruitment_command_centre_schema migration.

export type VacancyPriority = 'low' | 'normal' | 'high' | 'urgent'
export type VacancyStatus = 'open' | 'on_hold' | 'filled' | 'cancelled'

export type CandidateStatus = 'active' | 'withdrawn' | 'rejected' | 'employee_active'
export type RiskStatus = 'green' | 'amber' | 'red'

export type RecruitmentStage =
  | 'vacancy_created'
  | 'interview'
  | 'awaiting_feedback'
  | 'head_approval'
  | 'annexure'
  | 'offer_of_employment'
  | 'md_signature_pending'
  | 'sent_to_candidate'
  | 'document_collection'
  | 'police_clearance'
  | 'medical_booking'
  | 'contract_generation'
  | 'manager_approval'
  | 'final_md_signature'
  | 'employee_active'

export type WorkflowStatus = 'in_progress' | 'warning' | 'critical' | 'completed' | 'skipped'

// The 8 columns the Pipeline Board actually shows. Several fine-grained
// stages roll up into one column — vacancy_created is deliberately excluded
// (it lives in the vacancies list, not the candidate pipeline).
export const STAGE_COLUMN: Record<RecruitmentStage, string> = {
  vacancy_created: 'Interview',
  interview: 'Interview',
  awaiting_feedback: 'Feedback',
  head_approval: 'Approval',
  annexure: 'Offer',
  offer_of_employment: 'Offer',
  md_signature_pending: 'Offer',
  sent_to_candidate: 'Offer',
  document_collection: 'Documents',
  police_clearance: 'Documents',
  medical_booking: 'Medical',
  contract_generation: 'Contract',
  manager_approval: 'Contract',
  final_md_signature: 'Contract',
  employee_active: 'Active',
}

export const PIPELINE_COLUMNS = [
  'Interview',
  'Feedback',
  'Approval',
  'Offer',
  'Documents',
  'Medical',
  'Contract',
  'Active',
] as const

export const STAGE_LABEL: Record<RecruitmentStage, string> = {
  vacancy_created: 'Vacancy created',
  interview: 'Interview',
  awaiting_feedback: 'Awaiting feedback',
  head_approval: 'Head approval',
  annexure: 'Annexure',
  offer_of_employment: 'Offer of employment',
  md_signature_pending: 'MD signature pending',
  sent_to_candidate: 'Sent to candidate',
  document_collection: 'Document collection',
  police_clearance: 'Police clearance',
  medical_booking: 'Medical booking',
  contract_generation: 'Contract generation',
  manager_approval: 'Manager approval',
  final_md_signature: 'Final MD signature',
  employee_active: 'Employee active',
}

export interface RecruitmentSlaRule {
  stage: RecruitmentStage
  sla_hours: number
  warning_hours: number | null
  applies_to_role_level: string | null
}

export interface ActiveWorkflowRow {
  id: string
  stage: RecruitmentStage
  started_at: string
  sla_due_date: string | null
  status: WorkflowStatus
  owner: { id: string; first_name: string; last_name: string } | null
}

export interface CandidatePipelineRow {
  id: string
  first_name: string
  surname: string
  status: CandidateStatus
  created_at: string
  vacancy: {
    id: string
    position_title: string
    site: { id: string; name: string } | null
    department: { id: string; name: string } | null
    role: { id: string; title: string; level: string | null } | null
  }
  activeWorkflow: ActiveWorkflowRow | null
  risk: RiskStatus
  daysInStage: number
}

export interface VacancyRow {
  id: string
  position_title: string
  status: VacancyStatus
  priority: VacancyPriority
  requested_date: string
  target_start_date: string | null
  site: { id: string; name: string } | null
  department: { id: string; name: string } | null
  candidateCount: number
}
