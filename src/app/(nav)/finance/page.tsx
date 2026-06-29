import { DollarSign } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function FinancePage() {
  return (
    <PlaceholderModule
      icon={DollarSign}
      name="Finance"
      description="Track revenue, costs, and margins per site, contract, and service line — with direct integration to billing and payroll."
      widgets={[
        { label: 'Revenue month to date', metric: '—', description: 'Invoiced and accrued' },
        { label: 'Gross margin', metric: '—', description: 'After direct labour and materials' },
        { label: 'Outstanding debtors', metric: '—', description: 'Invoices past due date' },
        { label: 'Cost per work order', metric: '—', description: 'Average fully-loaded cost this quarter' },
      ]}
    />
  )
}
