import { CalendarDays } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function LeaveCalendarPage() {
  return (
    <PlaceholderModule
      icon={CalendarDays}
      name="Leave calendar"
      description="Manage annual, sick, and family responsibility leave with automated accrual calculations and approval workflows."
      widgets={[
        { label: 'Leave requests this month', metric: '—', description: 'Pending and approved' },
        { label: 'Average leave days taken', metric: '—', description: 'Per employee year to date' },
        { label: 'Absenteeism rate', metric: '—', description: 'Unplanned leave as percentage of working days' },
        { label: 'Leave balance alerts', metric: '—', description: 'Employees with negative or excess leave balances' },
      ]}
    />
  )
}
