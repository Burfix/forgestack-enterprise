import { Users } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function CustomersPage() {
  return (
    <PlaceholderModule
      icon={Users}
      name="Customers"
      description="Manage client accounts, contacts, contracts, and satisfaction scores across your entire customer portfolio."
      widgets={[
        { label: 'Active customers', metric: '—', description: 'Clients with current service agreements' },
        { label: 'Customer satisfaction', metric: '—', description: 'Average NPS from last 90 days' },
        { label: 'Contracts up for renewal', metric: '—', description: 'Agreements due within 6 months' },
        { label: 'Escalated complaints', metric: '—', description: 'Open complaints beyond SLA response time' },
      ]}
    />
  )
}
