import { LayoutDashboard, Map, BellRing, TrendingUp } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function DashboardPage() {
  return (
    <PlaceholderModule
      icon={LayoutDashboard}
      name="Executive dashboard"
      description="A real-time command centre for facilities operations — open work orders, SLA attainment, asset uptime, and revenue at a single glance across every managed site."
      features={[
        {
          icon: LayoutDashboard,
          title: 'Live operational KPIs',
          description: 'Monitor open work orders, first-time fix rate, mean time to repair, and technician utilisation refreshed every five minutes across all sites.',
        },
        {
          icon: Map,
          title: 'Site health heatmap',
          description: 'Interactive map showing the operational status of every managed site — green for on track, amber for at-risk SLAs, red for active breaches.',
        },
        {
          icon: BellRing,
          title: 'Executive alerts',
          description: 'Configurable thresholds for SLA breach risk, unplanned asset downtime, and critical headcount gaps, delivered via push notification or email digest.',
        },
        {
          icon: TrendingUp,
          title: 'Period-over-period benchmarking',
          description: 'Compare operational and financial performance month-on-month or year-on-year across cost centres, service lines, and managed client portfolios.',
        },
      ]}
    />
  )
}
