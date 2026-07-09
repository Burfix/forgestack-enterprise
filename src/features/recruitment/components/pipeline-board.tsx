'use client'

import { useState, useTransition } from 'react'
import { EmployeeAvatar } from '@/features/employees/components/employee-avatar'
import { transitionCandidateStage } from '@/features/recruitment/actions'
import type { CandidatePipelineRow, RecruitmentStage } from '@/types/recruitment'
import { PIPELINE_COLUMNS, STAGE_COLUMN, STAGE_LABEL } from '@/types/recruitment'

// Mirrors public.recruitment_stage_order — the DB is the source of truth for
// legality; this is only used to label the button with the correct next
// stage. If it ever drifts from the DB, the transition simply gets rejected
// with the DB's own plain-language error, so nothing can silently misfire.
const STAGE_SEQUENCE: RecruitmentStage[] = [
  'vacancy_created',
  'interview',
  'awaiting_feedback',
  'head_approval',
  'annexure',
  'offer_of_employment',
  'md_signature_pending',
  'sent_to_candidate',
  'document_collection',
  'police_clearance',
  'medical_booking',
  'contract_generation',
  'manager_approval',
  'final_md_signature',
  'employee_active',
]

function nextStage(current: RecruitmentStage): RecruitmentStage | null {
  const idx = STAGE_SEQUENCE.indexOf(current)
  if (idx === -1 || idx === STAGE_SEQUENCE.length - 1) return null
  return STAGE_SEQUENCE[idx + 1]
}

interface Props {
  candidates: CandidatePipelineRow[]
}

export function PipelineBoard({ candidates }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const byColumn = new Map<string, CandidatePipelineRow[]>()
  for (const col of PIPELINE_COLUMNS) byColumn.set(col, [])
  for (const c of candidates) {
    const stage = c.activeWorkflow?.stage ?? 'interview'
    const col = STAGE_COLUMN[stage]
    byColumn.get(col)?.push(c)
  }

  function handleAdvance(candidateId: string, current: RecruitmentStage) {
    const target = nextStage(current)
    if (!target) return
    setErrors((prev) => ({ ...prev, [candidateId]: '' }))
    startTransition(async () => {
      const result = await transitionCandidateStage(candidateId, target)
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [candidateId]: result.message ?? 'That transition was blocked.' }))
      }
    })
  }

  function handleDrop(candidateId: string, current: RecruitmentStage) {
    setDraggingId(null)
    handleAdvance(candidateId, current)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline board</h2>
        <p className="text-xs text-slate-400">Drag a card forward one step, or use the Advance button</p>
      </div>

      <div className="grid grid-cols-8 gap-3 overflow-x-auto">
        {PIPELINE_COLUMNS.map((col) => {
          const items = byColumn.get(col) ?? []
          return (
            <div
              key={col}
              className="min-w-[140px] bg-slate-50 rounded-lg p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const candidateId = e.dataTransfer.getData('text/candidate-id')
                const stage = e.dataTransfer.getData('text/stage') as RecruitmentStage
                if (candidateId && stage) handleDrop(candidateId, stage)
              }}
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-medium text-slate-600">{col}</span>
                <span className="text-xs text-slate-400 tabular-nums">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((c) => {
                  const stage = c.activeWorkflow?.stage ?? 'interview'
                  const target = nextStage(stage)
                  const error = errors[c.id]
                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingId(c.id)
                        e.dataTransfer.setData('text/candidate-id', c.id)
                        e.dataTransfer.setData('text/stage', stage)
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={`bg-white rounded-lg border p-2.5 cursor-grab active:cursor-grabbing transition-opacity ${
                        draggingId === c.id ? 'opacity-40' : 'opacity-100'
                      } ${
                        c.risk === 'red'
                          ? 'border-red-200'
                          : c.risk === 'amber'
                            ? 'border-amber-200'
                            : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <EmployeeAvatar firstName={c.first_name} lastName={c.surname} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {c.first_name} {c.surname}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{STAGE_LABEL[stage]}</p>
                        </div>
                      </div>

                      {target && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleAdvance(c.id, stage)}
                          className="w-full text-[10px] font-medium text-[#1A3A5C] bg-slate-50 hover:bg-slate-100 rounded px-2 py-1 transition-colors disabled:opacity-50"
                        >
                          Advance → {STAGE_LABEL[target]}
                        </button>
                      )}

                      {error && (
                        <p className="mt-1.5 text-[10px] text-red-600 leading-snug">{error}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
