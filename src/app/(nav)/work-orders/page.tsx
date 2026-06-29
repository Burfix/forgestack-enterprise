import { ClipboardList } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function WorkOrdersPage() {
  return (
    <PlaceholderModule
      icon={ClipboardList}
      name="Work orders"
      description="Create, assign, track, and close work orders from reactive breakdown calls to planned project work."
      widgets={[
        { label: 'Open work orders', metric: '—', description: 'Across all statuses and priorities' },
        { label: 'Average resolution time', metric: '—', description: 'Hours from creation to close this month' },
        { label: 'Emergency callouts', metric: '—', description: 'P1 and P2 work orders this week' },
        { label: 'Billable hours logged', metric: '—', description: 'Technician hours awaiting invoicing' },
      ]}
    />
  )
}
