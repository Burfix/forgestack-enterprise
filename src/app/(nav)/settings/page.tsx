import { Settings } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function SettingsPage() {
  return (
    <PlaceholderModule
      icon={Settings}
      name="Settings"
      description="Configure your organisation profile, notification preferences, branding, and system behaviour across ForgeStack."
      widgets={[
        { label: 'Organisation profile', metric: '—', description: 'Company details, logo, and contact information' },
        { label: 'Notification rules', metric: '—', description: 'Active alert and escalation configurations' },
        { label: 'Data retention', metric: '—', description: 'Archive and deletion policy settings' },
        { label: 'API integrations', metric: '—', description: 'Connected webhooks and API keys' },
      ]}
    />
  )
}
