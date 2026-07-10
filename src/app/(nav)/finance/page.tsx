import { DollarSign, Receipt, PieChart, RefreshCw } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function FinancePage() {
  return (
    <PlaceholderModule
      icon={DollarSign}
      name="Finance"
      description="End-to-end revenue management from approved work order through to tax invoice, payment receipt, and ERP reconciliation — with full cost centre reporting."
      features={[
        {
          icon: Receipt,
          title: 'Invoice pipeline',
          description: 'Track every approved work order from accounts notification through to tax invoice posting, payment receipt, and debtor reconciliation in one view.',
        },
        {
          icon: DollarSign,
          title: 'Revenue recognition',
          description: 'Recognise contract revenue over the service period using straight-line or milestone methods, with automated period-end journal generation.',
        },
        {
          icon: PieChart,
          title: 'Cost centre reporting',
          description: 'Allocate labour, materials, and overhead to client sites and service lines for granular gross margin reporting by contract and region.',
        },
        {
          icon: RefreshCw,
          title: 'ERP sync monitor',
          description: 'Live feed of invoice posting status from Sage Evolution, AccPac, or Pastel — with reconciliation exceptions flagged automatically for accounts review.',
        },
      ]}
    />
  )
}
