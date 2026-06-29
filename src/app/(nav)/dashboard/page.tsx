import { LayoutDashboard } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function DashboardPage() {
  return (
    <PlaceholderModule
      icon={LayoutDashboard}
      name="Executive dashboard"
      description="A real-time command centre for facilities operations — KPIs, alerts, site status, and workforce readiness at a single glance."
      widgets={[
        { label: 'Active work orders', metric: '—', description: 'Open across all sites right now' },
        { label: 'SLA compliance rate', metric: '—', description: 'Response and resolution within contract terms' },
        { label: 'Asset uptime', metric: '—', description: 'Critical HVAC assets operational this month' },
        { label: 'Revenue this month', metric: '—', description: 'Billable work completed and invoiced' },
      ]}
    />
  )
}
