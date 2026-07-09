'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentEmployeeId, getOrganisationId } from '@/lib/session'
import type { RecruitmentStage } from '@/types/recruitment'

interface TransitionResult {
  ok: boolean
  message?: string
}

// The single write path for stage changes. The Kanban board never updates
// `current_stage` directly — it always calls this, which calls
// fs_recruitment_transition_stage() in the database. That function enforces
// the legality of the transition and the contract-generation gate; this
// action's only job is to translate its response into something an operator
// can act on, per the "never expose raw technical errors" convention.
export async function transitionCandidateStage(
  candidateId: string,
  newStage: RecruitmentStage,
  notes?: string
): Promise<TransitionResult> {
  const supabase = await createServerSupabaseClient()
  const actorEmployeeId = await getCurrentEmployeeId()

  if (!actorEmployeeId) {
    return {
      ok: false,
      message:
        'Your account isn’t linked to an employee record yet, so this action can’t be attributed to anyone. Ask an admin to link your profile to your employee record.',
    }
  }

  const { error } = await supabase.rpc('fs_recruitment_transition_stage', {
    p_candidate_id: candidateId,
    p_new_stage: newStage,
    p_actor_employee_id: actorEmployeeId,
    p_notes: notes ?? null,
  })

  if (error) {
    // The database function raises plain-language exceptions
    // (e.g. "Contract can't be generated yet — ..."). Pass that straight
    // through rather than showing a Postgres error code.
    return { ok: false, message: error.message }
  }

  revalidatePath('/hr/recruitment')
  return { ok: true }
}

interface CreateVacancyInput {
  siteId: string
  departmentId: string
  roleId: string | null
  positionTitle: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  hireTypeId: string | null
  contractTypeId: string | null
  hiringManagerId: string | null
  targetStartDate: string | null
}

export async function createVacancy(input: CreateVacancyInput): Promise<TransitionResult> {
  const supabase = await createServerSupabaseClient()
  const orgId = await getOrganisationId()
  const actorEmployeeId = await getCurrentEmployeeId()

  if (!input.positionTitle.trim()) {
    return { ok: false, message: 'Position title is required.' }
  }
  if (!input.siteId || !input.departmentId) {
    return { ok: false, message: 'Site (Portfolio/Business Unit) and Department are required.' }
  }

  const { error } = await supabase.from('vacancies').insert({
    organisation_id: orgId,
    site_id: input.siteId,
    department_id: input.departmentId,
    role_id: input.roleId,
    position_title: input.positionTitle.trim(),
    priority: input.priority,
    hire_type_id: input.hireTypeId,
    contract_type_id: input.contractTypeId,
    hiring_manager_id: input.hiringManagerId,
    target_start_date: input.targetStartDate,
    created_by: actorEmployeeId,
  })

  if (error) {
    // RLS denials surface as a generic Postgres permission error — translate
    // it rather than showing the raw message, per the "never expose raw
    // technical errors" convention.
    if (error.code === '42501' || /row-level security/i.test(error.message)) {
      return {
        ok: false,
        message: 'You don’t have permission to create vacancies. This requires the HR admin, manager, MD, or super admin role.',
      }
    }
    return { ok: false, message: error.message }
  }

  revalidatePath('/hr/recruitment')
  return { ok: true }
}

interface CreateCandidateInput {
  vacancyId: string
  firstName: string
  surname: string
  email: string | null
  phone: string | null
  source: string | null
}

export async function createCandidate(input: CreateCandidateInput): Promise<TransitionResult> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.rpc('fs_recruitment_create_candidate', {
    p_vacancy_id: input.vacancyId,
    p_first_name: input.firstName,
    p_surname: input.surname,
    p_email: input.email,
    p_phone: input.phone,
    p_source: input.source,
  })

  if (error) {
    // fs_recruitment_create_candidate raises plain-language exceptions itself.
    return { ok: false, message: error.message }
  }

  revalidatePath('/hr/recruitment')
  return { ok: true }
}

interface UpdateStageDetailsInput {
  workflowId: string
  interviewDate?: string | null
  interviewerId?: string | null
  score?: number | null
  recommendation?: 'proceed' | 'reject' | 'hold' | null
  approvedBy?: string | null
  approvalDate?: string | null
  offerGeneratedDate?: string | null
  offerAmount?: number | null
  offerOwnerId?: string | null
  offerVersion?: number | null
  notes?: string | null
}

/** Saves the structured capture fields (interview score, approval sign-off, offer details) for the candidate's currently-open stage. */
export async function updateWorkflowStageDetails(input: UpdateStageDetailsInput): Promise<TransitionResult> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.rpc('fs_update_workflow_stage_details', {
    p_workflow_id: input.workflowId,
    p_interview_date: input.interviewDate ?? null,
    p_interviewer_id: input.interviewerId ?? null,
    p_score: input.score ?? null,
    p_recommendation: input.recommendation ?? null,
    p_approved_by: input.approvedBy ?? null,
    p_approval_date: input.approvalDate ?? null,
    p_offer_generated_date: input.offerGeneratedDate ?? null,
    p_offer_amount: input.offerAmount ?? null,
    p_offer_owner_id: input.offerOwnerId ?? null,
    p_offer_version: input.offerVersion ?? null,
    p_notes: input.notes ?? null,
  })

  if (error) return { ok: false, message: error.message }

  revalidatePath('/hr/recruitment')
  return { ok: true }
}

/** Ticks or unticks a recruitment checklist item (annexure, signature, medical, etc.). */
export async function completeRecruitmentTask(taskId: string, completed: boolean): Promise<TransitionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.rpc('fs_complete_recruitment_task', {
    p_task_id: taskId,
    p_completed: completed,
  })

  if (error) return { ok: false, message: error.message }

  revalidatePath('/hr/recruitment')
  return { ok: true }
}

/** Marks a required onboarding document (ID, banking details, police clearance, etc.) as uploaded or not. */
export async function markCandidateDocument(documentId: string, uploaded: boolean): Promise<TransitionResult> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.rpc('fs_mark_candidate_document', {
    p_document_id: documentId,
    p_uploaded: uploaded,
  })

  if (error) return { ok: false, message: error.message }

  revalidatePath('/hr/recruitment')
  return { ok: true }
}

/** Fetches the candidate's currently-open workflow stage detail (typed fields + checklist), for the detail panel. */
export async function getCandidateStageDetail(candidateId: string) {
  const { getWorkflowDetail } = await import('@/lib/db/workflow-detail')
  return getWorkflowDetail(candidateId)
}
