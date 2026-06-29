import { Building2 } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function AdminPage() {
  return (
    <PlaceholderModule
      icon={Building2}
      name="Administration"
      description="Manage users, roles, permissions, integrations, and organisation-wide configuration for your ForgeStack platform."
      widgets={[
        { label: 'Platform users', metric: '—', description: 'Active accounts with system access' },
        { label: 'Permission groups', metric: '—', description: 'Configured roles and access levels' },
        { label: 'Integrations active', metric: '—', description: 'Connected third-party systems' },
        { label: 'Audit events today', metric: '—', description: 'System actions logged in the last 24 hours' },
      ]}
    />
  )
}
