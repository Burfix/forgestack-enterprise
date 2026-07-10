import { GraduationCap, BookOpen, Award, BarChart3 } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function TrainingPage() {
  return (
    <PlaceholderModule
      icon={GraduationCap}
      name="Training"
      description="Schedule, track, and record all technical and compliance training across your workforce — linked directly to the qualification tracker and skills gap analysis."
      features={[
        {
          icon: BookOpen,
          title: 'Training scheduler',
          description: 'Plan and publish internal and external training sessions, assign attendees by role or site, send calendar invites, and capture attendance records on completion.',
        },
        {
          icon: Award,
          title: 'Certification registry',
          description: 'Record every qualification earned through training — SAQCC gas, electrical CoC, HVAC certification — and link it directly to the employee qualification profile.',
        },
        {
          icon: GraduationCap,
          title: 'Mandatory training tracker',
          description: 'Define which training programmes are mandatory per role. Automatically flag employees who are overdue and lock job card assignment for safety-critical tasks.',
        },
        {
          icon: BarChart3,
          title: 'Skills gap dashboard',
          description: 'Compare the training record of each employee against their role requirements to quantify skills gaps and build targeted development plans.',
        },
      ]}
    />
  )
}
