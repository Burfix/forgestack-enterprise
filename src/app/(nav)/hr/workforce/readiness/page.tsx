// Feature 3: Workforce Readiness — built in the next phase.
import { BarChart3 } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function WorkforceReadinessPage() {
  return (
    <PlaceholderModule
      icon={BarChart3}
      name="Workforce readiness"
      description="See every technician's qualification progression across the HVAC pathway at a glance — eligibility, expiry alerts, and Red Seal status in one view."
      widgets={[
        { label: 'Fully eligible technicians', metric: '—', description: 'All mandatory qualifications current' },
        { label: 'Conditionally eligible', metric: '—', description: 'Eligible with conditions or near-expiry' },
        { label: 'Not eligible', metric: '—', description: 'Expired or missing mandatory qualifications' },
        { label: 'Red Seal holders', metric: '—', description: 'Fully qualified refrigeration mechanics' },
      ]}
    />
  )
}
