import type { WorkOrderPriority, WorkOrderStatus } from '@/types/work-orders'
import { WORK_ORDER_STATUS_LABELS } from '@/types/work-orders'

const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  received: 'bg-slate-100 text-slate-600 ring-slate-200',
  dispatched: 'bg-blue-50 text-blue-600 ring-blue-200',
  on_site: 'bg-blue-50 text-blue-700 ring-blue-200',
  quote_pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  awaiting_po: 'bg-amber-50 text-amber-700 ring-amber-200',
  completed_awaiting_approval: 'bg-violet-50 text-violet-700 ring-violet-200',
  manager_approved: 'bg-teal-50 text-teal-700 ring-teal-200',
  sent_to_accounts: 'bg-teal-50 text-teal-700 ring-teal-200',
  invoiced: 'bg-green-50 text-green-700 ring-green-200',
  closed: 'bg-slate-100 text-slate-500 ring-slate-200',
}

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {WORK_ORDER_STATUS_LABELS[status]}
    </span>
  )
}

const PRIORITY_STYLES: Record<WorkOrderPriority, string> = {
  P1: 'bg-red-50 text-red-700 ring-red-200',
  P2: 'bg-orange-50 text-orange-700 ring-orange-200',
  P3: 'bg-slate-100 text-slate-600 ring-slate-200',
  P4: 'bg-slate-50 text-slate-400 ring-slate-200',
}

const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  P1: 'P1 \u2014 Emergency',
  P2: 'P2 \u2014 Urgent',
  P3: 'P3 \u2014 Standard',
  P4: 'P4 \u2014 Planned',
}

export function WorkOrderPriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${PRIORITY_STYLES[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
