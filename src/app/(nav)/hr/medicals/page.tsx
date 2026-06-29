import { Stethoscope } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function MedicalsPage() {
  return (
    <PlaceholderModule
      icon={Stethoscope}
      name="Medicals"
      description="Schedule occupational health examinations, track medical fitness certificates, and manage incapacity cases."
      widgets={[
        { label: 'Medicals due this month', metric: '—', description: 'Scheduled occupational health checks' },
        { label: 'Fitness certificates expiring', metric: '—', description: 'Certificates expiring within 60 days' },
        { label: 'Restricted employees', metric: '—', description: 'Medical restrictions on current duties' },
        { label: 'Medical compliance rate', metric: '—', description: 'Percentage of employees with current certificates' },
      ]}
    />
  )
}
