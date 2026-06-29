import { MapPin, Building2, CalendarClock, ClipboardCheck } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function SitesPage() {
  return (
    <PlaceholderModule
      icon={MapPin}
      name="Sites"
      description="Centralised management of every managed property — from site register and asset inventory through to PPM schedules and statutory compliance records."
      features={[
        {
          icon: Building2,
          title: 'Site register',
          description: 'Full profile for every managed property: physical address, client account, contract tier, SLA schedule, key contacts, and floor plan attachments.',
        },
        {
          icon: ClipboardCheck,
          title: 'Asset register',
          description: 'Track every critical asset per site — HVAC units, lifts, generators, fire systems — with make, model, install date, warranty expiry, and last service record.',
        },
        {
          icon: CalendarClock,
          title: 'Preventive maintenance schedules',
          description: 'Auto-generate PPM visit calendars from asset age, manufacturer intervals, and contract frequency. Assign technicians and issue job cards automatically.',
        },
        {
          icon: ClipboardCheck,
          title: 'Site compliance checklist',
          description: 'Log OHS walk findings, statutory inspection outcomes, and Certificates of Compliance per site with expiry alerts and responsible-person assignment.',
        },
      ]}
    />
  )
}
