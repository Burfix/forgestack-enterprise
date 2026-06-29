import { Users, UserCheck, GraduationCap, Stethoscope } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function HrOverviewPage() {
  return (
    <PlaceholderModule
      icon={Users}
      name="HR & workforce"
      description="A single system of record for your entire workforce — employee profiles, qualifications, leave, medicals, and compliance — from hire to retire."
      features={[
        {
          icon: UserCheck,
          title: 'Employee directory',
          description: 'Searchable register of all active employees with status badges, readiness scores, site assignments, and full profile access — live now.',
        },
        {
          icon: GraduationCap,
          title: 'Qualification & skills management',
          description: 'Track every trade certificate, safety competency, and professional registration per employee with expiry alerts and gap analysis against role requirements.',
        },
        {
          icon: Stethoscope,
          title: 'Medicals & fitness tracking',
          description: 'Schedule occupational health examinations, maintain fitness certificate registers, and manage medical restrictions across the field workforce.',
        },
        {
          icon: Users,
          title: 'Workforce readiness dashboard',
          description: 'Aggregate readiness scores by department and site — live now — so operations management can see resourcing risk at a glance.',
        },
      ]}
    />
  )
}
