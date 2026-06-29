import { TriangleAlert, BookOpen, Shield, Siren } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function RiskPage() {
  return (
    <PlaceholderModule
      icon={TriangleAlert}
      name="Risk"
      description="Operational, contractual, and financial risk management — risk register, contract exposure flagging, insurance tracking, and business continuity planning."
      features={[
        {
          icon: BookOpen,
          title: 'Risk register',
          description: 'Log and score operational, financial, and safety risks by likelihood and impact. Assign owners, set review schedules, and track mitigation actions to closure.',
        },
        {
          icon: TriangleAlert,
          title: 'Contract risk flags',
          description: 'Automatically surface clauses in client service agreements that create financial exposure: unlimited liability, aggressive SLA penalties, and problematic indemnity terms.',
        },
        {
          icon: Shield,
          title: 'Insurance coverage tracker',
          description: 'Record policy details, coverage limits, and renewal dates for all liability, plant, motor, and professional indemnity insurance policies with expiry alerts.',
        },
        {
          icon: Siren,
          title: 'Business continuity planner',
          description: 'Document backup technician pools, approved subcontractor emergency contacts, and escalation procedures per site for rapid response to unplanned outages.',
        },
      ]}
    />
  )
}
