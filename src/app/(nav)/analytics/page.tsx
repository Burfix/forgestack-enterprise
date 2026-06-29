import { BarChart2, FileBarChart, BrainCircuit, Sliders } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function AnalyticsPage() {
  return (
    <PlaceholderModule
      icon={BarChart2}
      name="Analytics"
      description="Operational intelligence for facilities managers — pre-built performance reports, financial dashboards, predictive fault analysis, and a custom report builder."
      features={[
        {
          icon: FileBarChart,
          title: 'Operational performance reports',
          description: 'Pre-built reports for SLA attainment, first-time fix rate, mean time to repair, and field workforce utilisation — filterable by site, technician, and period.',
        },
        {
          icon: BarChart2,
          title: 'Financial dashboards',
          description: 'Revenue, gross margin, and outstanding debtors visualised by month, quarter, and contract — with one-click export to Excel or PDF for board packs.',
        },
        {
          icon: BrainCircuit,
          title: 'Predictive fault analysis',
          description: 'Machine-learning model trained on historical fault codes that surfaces assets with elevated failure probability before breakdown occurs.',
        },
        {
          icon: Sliders,
          title: 'Custom report builder',
          description: 'Drag-and-drop report canvas: choose dimensions, metrics, filters, and chart types. Share saved reports with your team without writing SQL.',
        },
      ]}
    />
  )
}
