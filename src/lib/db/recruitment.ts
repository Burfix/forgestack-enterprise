import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  VacancyRow,
  CandidatePipelineRow,
  RecruitmentSlaRule,
  RiskStatus,
  RecruitmentStage,
} from '@/types/recruitment'

export async function getVacancies(organisationId: string): Promise<VacancyRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('vacancies')
    .select(`
      id, position_title, status, priority, requested_date, target_start_date,
      site:site_id(id, name),
      department:department_id(id, name),
      candidates(id)
    `)
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('requested_date', { ascending: false })

  if (error) throw new Error(`Failed to load vacancies: ${error.message}`)

  return (data ?? []).map((raw) => ({
    id: raw.id,
    position_title: raw.position_title,
    status: raw.status,
    priority: raw.priority,
    requested_date: raw.requested_date,
    target_start_date: raw.target_start_date,
    site: one(raw.site),
    department: one(raw.department),
    candidateCount: Array.isArray(raw.candidates) ? raw.candidates.length : 0,
  }))
}

export async function getSlaRules(organisationId: string): Promise<RecruitmentSlaRule[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('recruitment_sla_rules')
    .select('stage, sla_hours, warning_hours, applies_to_role_level')
    .eq('organisation_id', organisationId)

  if (error) throw new Error(`Failed to load SLA rules: ${error.message}`)
  return data ?? []
}

// Shared by getCandidatePipeline (Kanban board — active candidates only) and
// getCandidateListView (List view — every candidate regardless of outcome).
// One query, one mapping function: the Kanban board and the list view must
// never be able to disagree about what risk or days-in-stage means for the
// same candidate.
async function fetchCandidateRows(
  organisationId: string,
  { activeOnly }: { activeOnly: boolean }
): Promise<CandidatePipelineRow[]> {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('candidates')
    .select(`
      id, first_name, surname, status, created_at,
      vacancy:vacancy_id(
        id, position_title,
        site:site_id(id, name),
        department:department_id(id, name),
        role:role_id(id, title, level)
      ),
      recruitment_workflows(
        id, stage, started_at, sla_due_date, status,
        owner:owner_id(id, first_name, last_name)
      )
    `)
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (activeOnly) {
    query = query.eq('status', 'active')
  }

  const [{ data, error }, rules] = await Promise.all([query, getSlaRules(organisationId)])

  if (error) throw new Error(`Failed to load candidates: ${error.message}`)

  return (data ?? []).map((raw) => {
    const vacancy = one(raw.vacancy)
    const workflows = Array.isArray(raw.recruitment_workflows) ? raw.recruitment_workflows : []
    const active = workflows.find((w) => w.status !== 'completed' && w.status !== 'skipped') ?? null

    const roleLevel = vacancy?.role ? one(vacancy.role)?.level ?? null : null
    const risk = active ? computeRisk(active, roleLevel, rules) : 'green'
    const daysInStage = active
      ? Math.floor((Date.now() - new Date(active.started_at).getTime()) / (24 * 60 * 60 * 1000))
      : 0

    return {
      id: raw.id,
      first_name: raw.first_name,
      surname: raw.surname,
      status: raw.status,
      created_at: raw.created_at,
      vacancy: {
        id: vacancy?.id ?? '',
        position_title: vacancy?.position_title ?? '—',
        site: vacancy ? one(vacancy.site) : null,
        department: vacancy ? one(vacancy.department) : null,
        role: vacancy ? one(vacancy.role) : null,
      },
      activeWorkflow: active
        ? {
            id: active.id,
            stage: active.stage,
            started_at: active.started_at,
            sla_due_date: active.sla_due_date,
            status: active.status,
            owner: one(active.owner),
          }
        : null,
      risk,
      daysInStage,
    }
  })
}

export async function getCandidatePipeline(organisationId: string): Promise<CandidatePipelineRow[]> {
  return fetchCandidateRows(organisationId, { activeOnly: true })
}

/** Every candidate regardless of outcome — powers the List View's summary tiles and table. */
export async function getCandidateListView(organisationId: string): Promise<CandidatePipelineRow[]> {
  return fetchCandidateRows(organisationId, { activeOnly: false })
}

function computeRisk(
  workflow: { stage: RecruitmentStage; started_at: string; sla_due_date: string | null },
  roleLevel: string | null,
  rules: RecruitmentSlaRule[]
): RiskStatus {
  const rule =
    rules.find((r) => r.stage === workflow.stage && r.applies_to_role_level === roleLevel) ??
    rules.find((r) => r.stage === workflow.stage && r.applies_to_role_level === null)

  if (!rule || !workflow.sla_due_date) return 'green'

  const now = Date.now()
  const due = new Date(workflow.sla_due_date).getTime()
  if (now >= due) return 'red'

  if (rule.warning_hours != null) {
    const started = new Date(workflow.started_at).getTime()
    const warningAt = started + rule.warning_hours * 60 * 60 * 1000
    if (now >= warningAt) return 'amber'
  }

  return 'green'
}

// Supabase returns arrays or single objects for relations depending on
// cardinality. Normalise to a single object or null — same helper shape as
// lib/db/employees.ts's normaliseEmployee.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

/** Average days from vacancy_created to employee_active, across hired candidates. Null if none yet. */
export async function getAvgTimeToHireDays(organisationId: string): Promise<number | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('candidates')
    .select('id, recruitment_workflows(stage, started_at)')
    .eq('organisation_id', organisationId)
    .eq('status', 'employee_active')

  if (error || !data || data.length === 0) return null

  const durations: number[] = []
  for (const row of data) {
    const workflows = Array.isArray(row.recruitment_workflows) ? row.recruitment_workflows : []
    const created = workflows.find((w) => w.stage === 'vacancy_created')?.started_at
    const activated = workflows.find((w) => w.stage === 'employee_active')?.started_at
    if (created && activated) {
      durations.push((new Date(activated).getTime() - new Date(created).getTime()) / (24 * 60 * 60 * 1000))
    }
  }

  if (durations.length === 0) return null
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}
