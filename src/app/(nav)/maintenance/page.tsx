import { Wrench } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function MaintenancePage() {
  return (
    <PlaceholderModule
      icon={Wrench}
      name="Maintenance"
      description="Schedule and track preventive maintenance programmes across all assets, ensuring compliance with OEM and regulatory requirements."
      widgets={[
        { label: 'PM tasks due this week', metric: '—', description: 'Scheduled preventive maintenance visits' },
        { label: 'Overdue tasks', metric: '—', description: 'Preventive maintenance past due date' },
        { label: 'Asset health score', metric: '—', description: 'Weighted average across all tracked assets' },
        { label: 'Mean time between failures', metric: '—', description: 'Rolling 12-month average per asset class' },
      ]}
    />
  )
}
