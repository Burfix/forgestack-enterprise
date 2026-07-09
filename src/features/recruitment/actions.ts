'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentEmployeeId } from '@/lib/session'
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
