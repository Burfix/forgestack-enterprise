import { Settings2, CalendarDays, Navigation, UserCheck, AlarmClock } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function OperationsPage() {
  return (
    <PlaceholderModule
      icon={Settings2}
      name="Operations"
      description="End-to-end coordination of field teams and sub-contractors — from shift rostering and mobile dispatch through to SLA escalation and subcontractor compliance."
      features={[
        {
          icon: CalendarDays,
          title: 'Shift scheduling',
          description: 'Drag-and-drop roster builder for technicians and supervisors with automatic overtime calculation, leave integration, and availability conflict detection.',
        },
        {
          icon: Navigation,
          title: 'Mobile dispatch',
          description: 'Push job cards to technician PDAs the moment a work order is raised. Track GPS arrival, on-site confirmation, and job completion in real time.',
        },
        {
          icon: UserCheck,
          title: 'Subcontractor management',
          description: 'On-board and manage sub-contractors with CIPC registration, liability insurance, valid tax clearance, and rolling performance scorecards.',
        },
        {
          icon: AlarmClock,
          title: 'SLA breach prevention',
          description: 'Automated escalation rules that reassign or escalate jobs approaching their SLA deadline — no manual monitoring required.',
        },
      ]}
    />
  )
}
