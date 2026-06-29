import { UserCog } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function HrOverviewPage() {
  return (
    <PlaceholderModule
      icon={UserCog}
      name="HR & workforce"
      description="Manage your workforce from hire to retire — employee records, qualifications, leave, medicals, and compliance in one place."
      widgets={[
        { label: 'Total headcount', metric: '—', description: 'Active employees across all sites' },
        { label: 'Qualification compliance', metric: '—', description: 'Percentage of employees fully compliant' },
        { label: 'Leave requests pending', metric: '—', description: 'Awaiting manager approval' },
        { label: 'Medicals due this month', metric: '—', description: 'Scheduled occupational health checks' },
      ]}
    />
  )
}
