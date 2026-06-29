import { GitBranch } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function OrgChartPage() {
  return (
    <PlaceholderModule
      icon={GitBranch}
      name="Organisation chart"
      description="Visualise your reporting hierarchy across departments, sites, and roles with an interactive org chart."
      widgets={[
        { label: 'Reporting depth', metric: '—', description: 'Levels from CEO to field staff' },
        { label: 'Span of control', metric: '—', description: 'Average direct reports per manager' },
        { label: 'Open positions', metric: '—', description: 'Vacancies in the structure' },
        { label: 'Recent changes', metric: '—', description: 'Role and reporting changes this month' },
      ]}
    />
  )
}
