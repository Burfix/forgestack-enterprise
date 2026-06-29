import { ShieldCheck } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function CompliancePage() {
  return (
    <PlaceholderModule
      icon={ShieldCheck}
      name="Compliance"
      description="Track statutory inspections, regulatory submissions, and compliance certificates across all sites and asset classes."
      widgets={[
        { label: 'Compliance items due', metric: '—', description: 'Regulatory deadlines in the next 30 days' },
        { label: 'Open NCRs', metric: '—', description: 'Non-conformance reports under investigation' },
        { label: 'Certificate expiry alerts', metric: '—', description: 'Site and asset certificates expiring soon' },
        { label: 'Overall compliance score', metric: '—', description: 'Weighted across all regulatory frameworks' },
      ]}
    />
  )
}
