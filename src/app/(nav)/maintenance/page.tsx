import { Wrench, CalendarRange, Package, History } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function MaintenancePage() {
  return (
    <PlaceholderModule
      icon={Wrench}
      name="Maintenance"
      description="Structured management of planned and reactive maintenance — PPM programmes, breakdown logging, spares tracking, and full asset service history."
      features={[
        {
          icon: CalendarRange,
          title: 'PPM planner',
          description: 'Build preventive maintenance programmes by site and asset class: define service frequencies, assign technicians, attach task checklists, and link required spares kits.',
        },
        {
          icon: Wrench,
          title: 'Breakdown log',
          description: 'Structured reactive fault capture with equipment type, symptom code, root-cause analysis, and automatic repeat-failure detection across assets.',
        },
        {
          icon: Package,
          title: 'Spares & consumables tracker',
          description: 'Link parts usage to job cards, maintain stock levels per depot or van, and trigger reorder alerts when quantities fall below defined minimums.',
        },
        {
          icon: History,
          title: 'Asset service history',
          description: 'Complete chronological audit trail of every intervention on every asset — searchable by technician, fault code, cost centre, or date range.',
        },
      ]}
    />
  )
}
