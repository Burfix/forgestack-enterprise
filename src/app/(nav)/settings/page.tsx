import { SlidersHorizontal, Bell, Timer, TableProperties, HardDriveDownload } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function SettingsPage() {
  return (
    <PlaceholderModule
      icon={SlidersHorizontal}
      name="Settings"
      description="Notification preferences, SLA templates, custom field configuration, and data retention policies — tuned to your organisation without custom development."
      features={[
        {
          icon: Bell,
          title: 'Notification preferences',
          description: 'Choose which system events trigger email, SMS, or push notifications per role. Set quiet-hour windows so on-call staff are not disturbed outside critical thresholds.',
        },
        {
          icon: Timer,
          title: 'SLA templates',
          description: 'Define standard P1–P4 response and resolution tiers and map them to contract types, so new sites inherit the correct SLA schedule automatically on creation.',
        },
        {
          icon: TableProperties,
          title: 'Custom field builder',
          description: 'Add organisation-specific fields to work orders, site records, and employee profiles — text, number, date, or dropdown — without raising a development ticket.',
        },
        {
          icon: HardDriveDownload,
          title: 'Data export & retention',
          description: 'Configure automated exports to your cloud storage and set data retention periods aligned with POPIA obligations and your company records management policy.',
        },
      ]}
    />
  )
}
