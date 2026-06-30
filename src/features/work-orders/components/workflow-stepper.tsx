'use client'

import { useTransition } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { approveWorkOrder } from '@/actions/work-orders'
import type { WorkOrderStatus } from '@/types/work-orders'
import { format } from 'date-fns'

type StepState = 'complete' | 'active' | 'locked'

interface WorkflowStep {
  number: number
  title: string
  subtitle: string
  source: string
  isForgeStack: boolean
}

const STEPS: WorkflowStep[] = [
  { number: 1, title: 'Job received',        subtitle: 'Helpdesk logs call, assigns technician. PDA notification sent.',         source: 'Technisoft',  isForgeStack: false },
  { number: 2, title: 'Technician dispatched', subtitle: 'Technician accepts on PDA. ETA confirmed. Client notified by email.',   source: 'Technisoft',  isForgeStack: false },
  { number: 3, title: 'On site',             subtitle: 'Technician marks arrival on PDA.',                                        source: 'Technisoft',  isForgeStack: false },
  { number: 4, title: 'Job completed',       subtitle: 'Technician completes work. Client signs on glass. Job card saved.',       source: 'Technisoft',  isForgeStack: false },
  { number: 5, title: 'Manager approval',    subtitle: 'Technical manager reviews job card in ForgeStack.',                       source: 'ForgeStack',  isForgeStack: true  },
  { number: 6, title: 'Sent to accounts',    subtitle: 'Helpdesk receives approval notification and forwards job pack to Accounts.', source: 'ForgeStack',  isForgeStack: true  },
  { number: 7, title: 'Tax invoice posted',  subtitle: 'Accounts posts tax invoice in Sage Accpac. Invoice number recorded.',      source: 'Sage Accpac', isForgeStack: false },
  { number: 8, title: 'Invoice sent',        subtitle: 'Accounts emails tax invoice and job card bundle to client.',               source: 'Sage Accpac', isForgeStack: false },
  { number: 9, title: 'Closed',              subtitle: 'Job closed. Client satisfaction prompt sent.',                            source: 'ForgeStack',  isForgeStack: true  },
]

function statusToStep(status: WorkOrderStatus): number {
  const map: Record<WorkOrderStatus, number> = {
    received:                    1,
    dispatched:                  2,
    on_site:                     3,
    completed_awaiting_approval: 5, // step 4 done, step 5 is active
    manager_approved:            6, // step 5 done, step 6 is active (Helpdesk forwarding to Accounts)
    sent_to_accounts:            7, // step 6 done, step 7 is active (Accounts posting invoice)
    invoiced:                    8,
    closed:                      9,
  }
  return map[status]
}

function getStepState(stepNumber: number, activeStep: number, status: WorkOrderStatus): StepState {
  if (stepNumber < activeStep) return 'complete'
  if (stepNumber === activeStep) {
    // closed means step 9 is also complete
    if (status === 'closed' && stepNumber === 9) return 'complete'
    return 'active'
  }
  return 'locked'
}

interface WorkflowStepperProps {
  workOrderId: string
  initialStatus: WorkOrderStatus
  initialApprovedAt: string | null
  onStatusChange: (status: WorkOrderStatus, approvedAt: string) => void
}

export function WorkflowStepper({
  workOrderId,
  initialStatus,
  initialApprovedAt,
  onStatusChange,
}: WorkflowStepperProps) {
  const [isPending, startTransition] = useTransition()
  const activeStep = statusToStep(initialStatus)

  function handleApprove() {
    startTransition(async () => {
      const result = await approveWorkOrder(workOrderId)
      if (result.success) {
        onStatusChange('manager_approved', result.approvedAt)
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-900">Workflow</h3>
        <span className="text-xs text-slate-400">Step {activeStep} of 9</span>
      </div>

      <div className="space-y-0">
        {STEPS.map((step, index) => {
          const state = getStepState(step.number, activeStep, initialStatus)
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.number} className="flex gap-3">
              {/* Icon column */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-colors ${
                    state === 'complete'
                      ? 'bg-green-600 text-white'
                      : state === 'active'
                        ? step.isForgeStack
                          ? 'bg-[#1A3A5C] text-white ring-4 ring-[#1A3A5C]/15'
                          : 'bg-[#1A3A5C] text-white ring-4 ring-[#1A3A5C]/15'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {state === 'complete' ? <Check className="w-3.5 h-3.5" /> : step.number}
                </div>
                {!isLast && (
                  <div className={`w-px flex-1 my-1 ${state === 'complete' ? 'bg-green-300' : 'bg-slate-200'}`} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 flex-1 min-w-0 ${isLast ? '' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium leading-tight ${
                      state === 'locked' ? 'text-slate-400' : 'text-slate-900'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs mt-0.5 leading-snug ${
                      state === 'locked' ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {step.subtitle}
                    </p>
                    <span className={`inline-block mt-1 text-[10px] font-medium rounded px-1.5 py-0.5 ${
                      step.isForgeStack
                        ? 'bg-[#1A3A5C]/8 text-[#1A3A5C]'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step.source}
                    </span>
                  </div>
                </div>

                {/* Step 5 — approval action */}
                {step.number === 5 && state === 'active' && (
                  <div className="mt-3 p-3 bg-[#1A3A5C]/4 rounded-lg border border-[#1A3A5C]/12">
                    <p className="text-xs text-slate-600 mb-3 font-medium">
                      Review the job card on the left, then approve or reject.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApprove}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors"
                      >
                        {isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        {isPending ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        disabled
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 ring-1 ring-red-200 opacity-50 cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5 — approved state */}
                {step.number === 5 && state === 'complete' && initialApprovedAt && (
                  <p className="mt-1 text-xs text-green-600">
                    Approved {format(new Date(initialApprovedAt), 'dd MMM yyyy HH:mm')}
                  </p>
                )}

                {/* Step 6 — accounts placeholder */}
                {step.number === 6 && state === 'active' && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Accounts notification</span>
                      <span className="text-xs text-orange-600 font-medium">Pending</span>
                    </div>
                    <div className="h-px bg-orange-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Preview invoice</span>
                      <span className="text-xs text-slate-400">Generating…</span>
                    </div>
                  </div>
                )}

                {/* Step 7 — invoice details placeholder */}
                {step.number === 7 && state !== 'locked' && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Invoice number</span>
                      <span className="font-mono text-slate-700">—</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount</span>
                      <span className="font-mono text-slate-700">—</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posted date</span>
                      <span className="text-slate-400">—</span>
                    </div>
                  </div>
                )}

                {/* Step 8 — email recipients placeholder */}
                {step.number === 8 && state !== 'locked' && (
                  <div className="mt-3 space-y-1.5">
                    {[
                      { label: 'Client copy', addr: 'accounts@client.co.za' },
                      { label: 'Accounts copy', addr: 'accounts@sfigroup.co.za' },
                      { label: 'Site manager copy', addr: 'site.manager@client.co.za' },
                    ].map(({ label, addr }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500">{label}</span>
                          <span className="ml-1.5 text-slate-400 font-mono">{addr}</span>
                        </div>
                        <span className="text-slate-300 bg-slate-100 rounded px-1.5 py-0.5">Pending</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 9 — satisfaction */}
                {step.number === 9 && state !== 'locked' && (
                  <div className="mt-2 text-xs text-slate-400 italic">
                    Satisfaction survey pending client response.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
