import type { SlaStatus } from '@/types/work-orders'

const SLA_CONFIG: Record<SlaStatus, { label: string; className: string } | null> = {
  on_track: { label: 'On track',  className: 'bg-green-100 text-green-700 ring-green-200'  },
  at_risk:  { label: 'At risk',   className: 'bg-amber-100 text-amber-700 ring-amber-200'  },
  breached: { label: 'Breached',  className: 'bg-red-100   text-red-700   ring-red-200'    },
  none:     null,
}

export function SlaIndicator({ status }: { status: SlaStatus }) {
  const config = SLA_CONFIG[status]
  if (!config) return <span className="text-slate-300 text-xs">—</span>
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}>
      {config.label}
    </span>
  )
}
