import { CalendarDays, CalendarCheck, TrendingDown, Clock } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function LeaveCalendarPage() {
  return (
    <PlaceholderModule
      icon={CalendarDays}
      name="Leave calendar"
      description="Manage annual, sick, and family responsibility leave with automated accrual calculations, multi-level approval workflows, and absenteeism reporting."
      features={[
        {
          icon: CalendarCheck,
          title: 'Leave request & approval',
          description: 'Employees submit leave requests via mobile or desktop. Line managers approve or decline with a single action, triggering automatic calendar updates and payroll feeds.',
        },
        {
          icon: CalendarDays,
          title: 'Leave balance tracking',
          description: 'Real-time accrual balances per leave type — annual, sick, family responsibility, and study leave — with automatic carry-over rules at financial year end.',
        },
        {
          icon: TrendingDown,
          title: 'Absenteeism analytics',
          description: 'Track Bradford Factor scores, unplanned absence patterns, and leave frequency by department to identify employees at risk of excessive absenteeism.',
        },
        {
          icon: Clock,
          title: 'Leave forecasting',
          description: 'Visualise peak leave periods across teams and sites so operations managers can maintain minimum staffing thresholds before approving future requests.',
        },
      ]}
    />
  )
}
