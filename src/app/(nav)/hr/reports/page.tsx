import { FileBarChart, Scale, TrendingUp, Download } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function HrReportsPage() {
  return (
    <PlaceholderModule
      icon={FileBarChart}
      name="Reports"
      description="Statutory, operational, and executive HR reports — Employment Equity returns, skills development levies, workforce analytics, and automated stakeholder exports."
      features={[
        {
          icon: Scale,
          title: 'Employment Equity reporting',
          description: 'Generate EEA2 and EEA4 reports from live headcount data — workforce profile, income differentials, and numerical goals — ready for submission to the DoEL.',
        },
        {
          icon: FileBarChart,
          title: 'Skills Development Levy report',
          description: 'Compile WSP and ATR submissions for SETA with training spend, beneficiary demographics, and programme outcomes drawn automatically from training records.',
        },
        {
          icon: TrendingUp,
          title: 'Workforce analytics',
          description: 'Turnover rate, average tenure, vacancy fill time, and cost-per-hire — tracked by department and site to support quarterly board reporting.',
        },
        {
          icon: Download,
          title: 'Scheduled report exports',
          description: 'Configure automated report delivery to HR managers, CFOs, or board members on a daily, weekly, or monthly schedule in PDF or Excel format.',
        },
      ]}
    />
  )
}
