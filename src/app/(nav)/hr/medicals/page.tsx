import { Stethoscope, CalendarClock, FileCheck2, AlertCircle } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function MedicalsPage() {
  return (
    <PlaceholderModule
      icon={Stethoscope}
      name="Medicals"
      description="Schedule occupational health examinations, track fitness certificate validity, manage medical restrictions, and maintain COIDA-ready records for every employee."
      features={[
        {
          icon: CalendarClock,
          title: 'Examination scheduler',
          description: 'Automatically schedule pre-employment, periodic, and exit occupational health examinations based on role risk category and certificate expiry dates.',
        },
        {
          icon: FileCheck2,
          title: 'Fitness certificate register',
          description: 'Centralised store of medical fitness certificates per employee with expiry tracking and automatic 60-day and 30-day renewal alerts to HR and line managers.',
        },
        {
          icon: AlertCircle,
          title: 'Medical restriction management',
          description: 'Record duty restrictions from the occupational health practitioner and automatically block assignment of restricted employees to contraindicated tasks.',
        },
        {
          icon: Stethoscope,
          title: 'Incapacity case tracking',
          description: 'Manage temporary and permanent incapacity processes with structured documentation, timeline tracking, and CCMA-ready case notes.',
        },
      ]}
    />
  )
}
