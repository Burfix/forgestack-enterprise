import { FileBarChart } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function HrReportsPage() {
  return (
    <PlaceholderModule
      icon={FileBarChart}
      name="Reports"
      description="Generate statutory, operational, and executive HR reports — from Employment Equity returns to technician readiness summaries."
      widgets={[
        { label: 'Reports generated this month', metric: '—', description: 'Across all report types' },
        { label: 'EE report status', metric: '—', description: 'Employment Equity submission readiness' },
        { label: 'Workforce analytics', metric: '—', description: 'Turnover, tenure, and productivity metrics' },
        { label: 'Scheduled exports', metric: '—', description: 'Automated reports sent to stakeholders' },
      ]}
    />
  )
}
