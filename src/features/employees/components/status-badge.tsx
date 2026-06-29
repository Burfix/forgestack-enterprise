import type { EmploymentStatus } from '@/types/hr'

const STATUS_CONFIG: Record<
  EmploymentStatus,
  { label: string; className: string }
> = {
  active:     { label: 'Active',     className: 'bg-green-100 text-green-700 ring-green-200' },
  on_leave:   { label: 'On leave',   className: 'bg-amber-100 text-amber-700 ring-amber-200' },
  inactive:   { label: 'Inactive',   className: 'bg-slate-100 text-slate-500 ring-slate-200' },
  suspended:  { label: 'Suspended',  className: 'bg-red-100   text-red-700   ring-red-200'   },
  terminated: { label: 'Terminated', className: 'bg-slate-100 text-slate-400 ring-slate-200' },
}

interface StatusBadgeProps {
  status: EmploymentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
