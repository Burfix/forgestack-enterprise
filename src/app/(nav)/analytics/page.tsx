import { BarChart3 } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function AnalyticsPage() {
  return (
    <PlaceholderModule
      icon={BarChart3}
      name="Analytics"
      description="Deep operational intelligence — trend analysis, predictive maintenance signals, workforce productivity, and executive reporting."
      widgets={[
        { label: 'Asset failure predictions', metric: '—', description: 'Units flagged for likely failure in 30 days' },
        { label: 'Technician utilisation', metric: '—', description: 'Productive hours as percentage of capacity' },
        { label: 'Energy anomalies', metric: '—', description: 'Sites with abnormal consumption patterns' },
        { label: 'Report exports this month', metric: '—', description: 'Scheduled and on-demand reports generated' },
      ]}
    />
  )
}
