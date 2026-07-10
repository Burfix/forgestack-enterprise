import { Users, FileText, Globe, Star } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function CustomersPage() {
  return (
    <PlaceholderModule
      icon={Users}
      name="Customers"
      description="Full lifecycle management of client accounts — from contract and SLA records through to client portal access and satisfaction tracking."
      features={[
        {
          icon: Users,
          title: 'Client account directory',
          description: 'Complete profile for every managed client: billing contacts, contract tier, sites under management, account health score, and relationship owner.',
        },
        {
          icon: FileText,
          title: 'Contract management',
          description: 'Upload and version-control client service agreements, attach SLA schedules, and set automated renewal reminders so no contract lapses unnoticed.',
        },
        {
          icon: Globe,
          title: 'Client portal',
          description: 'Grant clients a read-only view of their active work orders, invoice history, upcoming PPM visits, and compliance certificate statuses without a phone call.',
        },
        {
          icon: Star,
          title: 'Satisfaction & retention tracking',
          description: 'Net Promoter Score surveys sent automatically after job closure, with trend analysis by client and churn-risk flagging for accounts falling below threshold.',
        },
      ]}
    />
  )
}
