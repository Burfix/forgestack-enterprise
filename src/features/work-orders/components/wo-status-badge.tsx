import type { WorkOrderStatus } from '@/types/work-orders'

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; className: string }> = {
  received:                    { label: 'Received',              className: 'bg-slate-100  text-slate-600  ring-slate-200'  },
  dispatched:                  { label: 'Dispatched',            className: 'bg-blue-100   text-blue-700   ring-blue-200'   },
  on_site:                     { label: 'On site',               className: 'bg-amber-100  text-amber-700  ring-amber-200'  },
  completed_awaiting_approval: { label: 'Awaiting approval',     className: 'bg-purple-100 text-purple-700 ring-purple-200' },
  manager_approved:            { label: 'Manager approved',      className: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  sent_to_accounts:            { label: 'Sent to accounts',      className: 'bg-orange-100 text-orange-700 ring-orange-200' },
  invoiced:                    { label: 'Invoiced',              className: 'bg-green-100  text-green-700  ring-green-200'  },
  closed:                      { label: 'Closed',                className: 'bg-slate-100  text-slate-400  ring-slate-200'  },
}

interface WoStatusBadgeProps {
  status: WorkOrderStatus
  size?: 'sm' | 'lg'
}

export function WoStatusBadge({ status, size = 'sm' }: WoStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClass = size === 'lg'
    ? 'px-3 py-1 text-sm font-semibold'
    : 'px-2.5 py-0.5 text-xs font-medium'
  return (
    <span className={`inline-flex items-center rounded-full ring-1 ring-inset ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  )
}
