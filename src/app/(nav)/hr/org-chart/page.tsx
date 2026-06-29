import { GitBranch, Network, UserPlus, ArrowLeftRight } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function OrgChartPage() {
  return (
    <PlaceholderModule
      icon={GitBranch}
      name="Organisation chart"
      description="Interactive visualisation of your reporting hierarchy — from executive leadership to field technicians — with drill-down by department, region, or site."
      features={[
        {
          icon: Network,
          title: 'Interactive hierarchy viewer',
          description: 'Explore the full reporting structure across departments and sites. Click any node to see direct reports, role details, contact information, and open positions.',
        },
        {
          icon: GitBranch,
          title: 'Span-of-control analysis',
          description: 'Identify managers with too many or too few direct reports and surface structural imbalances that affect operational responsiveness across sites.',
        },
        {
          icon: UserPlus,
          title: 'Vacancy mapping',
          description: 'Show approved but unfilled positions in the structure so resourcing decisions are made with full visibility of where headcount gaps sit.',
        },
        {
          icon: ArrowLeftRight,
          title: 'Reporting-line change log',
          description: 'Track every structural change — transfers, promotions, and reorganisations — with effective dates and approval history for HR audits.',
        },
      ]}
    />
  )
}
