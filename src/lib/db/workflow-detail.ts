import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface WorkflowTask {
  id: string
  task_name: string
  completed: boolean
  due_date: string | null
}

export interface CandidateDocument {
  id: string
  document_type: string
  required: boolean
  uploaded: boolean
}

export interface WorkflowDetail {
  id: string
  stage: string
  interview_date: string | null
  interviewer_id: string | null
  score: number | null
  recommendation: string | null
  approved_by: string | null
  approval_date: string | null
  offer_generated_date: string | null
  offer_amount: number | null
  offer_owner_id: string | null
  offer_version: number | null
  notes: string | null
  tasks: WorkflowTask[]
  documents: CandidateDocument[]
}

// DOCUMENT_LABELS lives in @/lib/recruitment/document-labels — a plain
// constant file with no server-only imports, so client components can use
// it without accidentally bundling this module's Supabase server client.

/** The candidate's currently-open workflow row, with its checklist tasks and document requirements. */
export async function getWorkflowDetail(candidateId: string): Promise<WorkflowDetail | null> {
  const supabase = await createServerSupabaseClient()

  const { data: workflow, error } = await supabase
    .from('recruitment_workflows')
    .select(
      'id, stage, interview_date, interviewer_id, score, recommendation, approved_by, approval_date, offer_generated_date, offer_amount, offer_owner_id, offer_version, notes'
    )
    .eq('candidate_id', candidateId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to load workflow detail: ${error.message}`)
  if (!workflow) return null

  const [{ data: tasks }, { data: documents }] = await Promise.all([
    supabase
      .from('recruitment_tasks')
      .select('id, task_name, completed, due_date')
      .eq('workflow_id', workflow.id)
      .order('created_at'),
    supabase
      .from('candidate_documents')
      .select('id, document_type, required, uploaded')
      .eq('candidate_id', candidateId)
      .order('created_at'),
  ])

  return {
    ...workflow,
    tasks: tasks ?? [],
    documents: documents ?? [],
  }
}
