import { CheckCircle2, AlertTriangle, XCircle, Clock, MinusCircle } from 'lucide-react'
import type { CategoryIconStatus, CategoryQualStatus, QualificationCategory } from '@/types/hr'

const CATEGORY_LABEL: Record<QualificationCategory, string> = {
  trade:       'Trade',
  safety:      'Safety',
  compliance:  'Compliance',
  health:      'Health',
  technical:   'Technical',
  regulatory:  'Regulatory',
  internal:    'Internal',
}

function Icon({ status }: { status: CategoryQualStatus }) {
  switch (status) {
    case 'valid':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />
    case 'expiring':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />
    case 'expired':
      return <XCircle className="w-4 h-4 text-red-600" />
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-500" />
    case 'missing':
      return <MinusCircle className="w-4 h-4 text-slate-300" />
  }
}

interface QualIconClusterProps {
  statuses: CategoryIconStatus[]
}

export function QualIconCluster({ statuses }: QualIconClusterProps) {
  if (statuses.length === 0) {
    return <span className="text-xs text-slate-400">No records</span>
  }
  return (
    <div className="flex items-center gap-1">
      {statuses.map(({ category, status }) => (
        <span
          key={category}
          title={`${CATEGORY_LABEL[category]}: ${status.replace('_', ' ')}`}
        >
          <Icon status={status} />
        </span>
      ))}
    </div>
  )
}
