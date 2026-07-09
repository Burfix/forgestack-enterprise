'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCandidateStageDetail,
  updateWorkflowStageDetails,
  completeRecruitmentTask,
  markCandidateDocument,
} from '@/features/recruitment/actions'
import type { WorkflowDetail } from '@/lib/db/workflow-detail'
import { DOCUMENT_LABELS } from '@/lib/recruitment/document-labels'
import type { RecruitmentStage } from '@/types/recruitment'
import type { HiringManagerOption } from '@/lib/db/reference-data'

// Stages that capture the structured fields added alongside the pipeline
// board spec. Every other stage only shows its checklist (if any) — nothing
// to force-fill for stages that are pure hand-offs (e.g. contract_generation
// is gated by the database itself, not by this panel).
const CAPTURE_FIELDS: Partial<Record<RecruitmentStage, 'interview' | 'approval' | 'offer'>> = {
  interview: 'interview',
  head_approval: 'approval',
  offer_of_employment: 'offer',
}

interface Props {
  candidateId: string
  stage: RecruitmentStage
  hiringManagers: HiringManagerOption[]
  onRequiredFieldsChange: (candidateId: string, satisfied: boolean) => void
}

function requiredFieldsSatisfied(stage: RecruitmentStage, detail: WorkflowDetail | null): boolean {
  const kind = CAPTURE_FIELDS[stage]
  if (!kind || !detail) return true
  if (kind === 'interview') return detail.score !== null && !!detail.recommendation
  if (kind === 'approval') return !!detail.approved_by
  if (kind === 'offer') return detail.offer_amount !== null
  return true
}

export function CandidateStageDetail({ candidateId, stage, hiringManagers, onRequiredFieldsChange }: Props) {
  const [detail, setDetail] = useState<WorkflowDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Local editable copies of the capture fields, so typing doesn't refetch.
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewerId, setInterviewerId] = useState('')
  const [score, setScore] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [approvedBy, setApprovedBy] = useState('')
  const [offerAmount, setOfferAmount] = useState('')
  const [offerOwnerId, setOfferOwnerId] = useState('')

  useEffect(() => {
    let cancelled = false
    getCandidateStageDetail(candidateId).then((d) => {
      if (cancelled) return
      setDetail(d)
      setLoading(false)
      onRequiredFieldsChange(candidateId, requiredFieldsSatisfied(stage, d))
      if (d) {
        setInterviewDate(d.interview_date?.slice(0, 10) ?? '')
        setInterviewerId(d.interviewer_id ?? '')
        setScore(d.score?.toString() ?? '')
        setRecommendation(d.recommendation ?? '')
        setApprovedBy(d.approved_by ?? '')
        setOfferAmount(d.offer_amount?.toString() ?? '')
        setOfferOwnerId(d.offer_owner_id ?? '')
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId])

  if (loading) return <p className="text-[10px] text-slate-400 mt-2">Loading…</p>
  if (!detail) return null

  const kind = CAPTURE_FIELDS[stage]

  function handleSaveDetails() {
    setError(null)
    startTransition(async () => {
      const result = await updateWorkflowStageDetails({
        workflowId: detail!.id,
        interviewDate: kind === 'interview' && interviewDate ? interviewDate : undefined,
        interviewerId: kind === 'interview' && interviewerId ? interviewerId : undefined,
        score: kind === 'interview' && score ? Number(score) : undefined,
        recommendation: kind === 'interview' && recommendation ? (recommendation as 'proceed' | 'reject' | 'hold') : undefined,
        approvedBy: kind === 'approval' && approvedBy ? approvedBy : undefined,
        approvalDate: kind === 'approval' ? new Date().toISOString() : undefined,
        offerAmount: kind === 'offer' && offerAmount ? Number(offerAmount) : undefined,
        offerOwnerId: kind === 'offer' && offerOwnerId ? offerOwnerId : undefined,
        offerGeneratedDate: kind === 'offer' ? new Date().toISOString() : undefined,
      })
      if (!result.ok) {
        setError(result.message ?? 'Could not save.')
        return
      }
      const updated: WorkflowDetail = {
        ...detail!,
        interview_date: kind === 'interview' ? interviewDate || detail!.interview_date : detail!.interview_date,
        interviewer_id: kind === 'interview' ? interviewerId || detail!.interviewer_id : detail!.interviewer_id,
        score: kind === 'interview' && score ? Number(score) : detail!.score,
        recommendation: kind === 'interview' ? recommendation || detail!.recommendation : detail!.recommendation,
        approved_by: kind === 'approval' ? approvedBy || detail!.approved_by : detail!.approved_by,
        offer_amount: kind === 'offer' && offerAmount ? Number(offerAmount) : detail!.offer_amount,
        offer_owner_id: kind === 'offer' ? offerOwnerId || detail!.offer_owner_id : detail!.offer_owner_id,
      }
      setDetail(updated)
      onRequiredFieldsChange(candidateId, requiredFieldsSatisfied(stage, updated))
    })
  }

  function handleToggleTask(taskId: string, completed: boolean) {
    startTransition(async () => {
      await completeRecruitmentTask(taskId, completed)
      setDetail((prev) =>
        prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)) } : prev
      )
    })
  }

  function handleToggleDocument(documentId: string, uploaded: boolean) {
    startTransition(async () => {
      await markCandidateDocument(documentId, uploaded)
      setDetail((prev) =>
        prev ? { ...prev, documents: prev.documents.map((d) => (d.id === documentId ? { ...d, uploaded } : d)) } : prev
      )
    })
  }

  return (
    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
      {kind === 'interview' && (
        <div className="space-y-1.5">
          <Input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="h-7 text-[10px]" />
          <Select value={interviewerId} onValueChange={setInterviewerId}>
            <SelectTrigger className="h-7 text-[10px] bg-white"><SelectValue placeholder="Interviewer" /></SelectTrigger>
            <SelectContent>
              {hiringManagers.map((m) => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" min="0" max="10" step="0.5" placeholder="Score (0-10)" value={score} onChange={(e) => setScore(e.target.value)} className="h-7 text-[10px]" />
          <Select value={recommendation} onValueChange={setRecommendation}>
            <SelectTrigger className="h-7 text-[10px] bg-white"><SelectValue placeholder="Recommendation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="proceed">Proceed</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="w-full h-7 text-[10px]" disabled={isPending} onClick={handleSaveDetails}>Save interview details</Button>
        </div>
      )}

      {kind === 'approval' && (
        <div className="space-y-1.5">
          <Select value={approvedBy} onValueChange={setApprovedBy}>
            <SelectTrigger className="h-7 text-[10px] bg-white"><SelectValue placeholder="Approved by" /></SelectTrigger>
            <SelectContent>
              {hiringManagers.map((m) => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="w-full h-7 text-[10px]" disabled={isPending} onClick={handleSaveDetails}>Record approval</Button>
        </div>
      )}

      {kind === 'offer' && (
        <div className="space-y-1.5">
          <Input type="number" min="0" step="0.01" placeholder="Offer amount" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} className="h-7 text-[10px]" />
          <Select value={offerOwnerId} onValueChange={setOfferOwnerId}>
            <SelectTrigger className="h-7 text-[10px] bg-white"><SelectValue placeholder="Offer owner" /></SelectTrigger>
            <SelectContent>
              {hiringManagers.map((m) => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="w-full h-7 text-[10px]" disabled={isPending} onClick={handleSaveDetails}>Save offer details</Button>
        </div>
      )}

      {detail.tasks.length > 0 && (
        <ul className="space-y-1">
          {detail.tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <input
                type="checkbox"
                checked={t.completed}
                disabled={isPending}
                onChange={(e) => handleToggleTask(t.id, e.target.checked)}
                className="h-3 w-3"
              />
              <span className={t.completed ? 'line-through text-slate-400' : ''}>{t.task_name}</span>
            </li>
          ))}
        </ul>
      )}

      {detail.documents.length > 0 && (stage === 'document_collection' || stage === 'police_clearance') && (
        <ul className="space-y-1">
          {detail.documents.map((d) => (
            <li key={d.id} className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <input
                type="checkbox"
                checked={d.uploaded}
                disabled={isPending}
                onChange={(e) => handleToggleDocument(d.id, e.target.checked)}
                className="h-3 w-3"
              />
              <span className={d.uploaded ? 'line-through text-slate-400' : ''}>{DOCUMENT_LABELS[d.document_type] ?? d.document_type}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  )
}
