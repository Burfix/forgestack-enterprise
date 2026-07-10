import { ShoppingCart, ClipboardCheck, ReceiptText, BarChart3 } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function ProcurementPage() {
  return (
    <PlaceholderModule
      icon={ShoppingCart}
      name="Procurement"
      description="Purchase order management, preferred supplier registers, three-way invoice matching, and spend analytics — eliminating manual procurement from the operations workflow."
      features={[
        {
          icon: ShoppingCart,
          title: 'Purchase order management',
          description: 'Raise, approve, and track purchase orders for parts, consumables, and sub-contractor services with GL cost centre allocation and multi-level approval rules.',
        },
        {
          icon: ClipboardCheck,
          title: 'Preferred supplier register',
          description: 'Maintain an approved supplier list with negotiated pricing agreements, lead times, quality ratings, and BBBEE status for all commonly procured materials.',
        },
        {
          icon: ReceiptText,
          title: 'Three-way invoice matching',
          description: 'Automatically match supplier invoices against the original purchase order and goods receipt note to prevent duplicate payments and catch discrepancies.',
        },
        {
          icon: BarChart3,
          title: 'Spend analytics',
          description: 'Visualise procurement spend by category, supplier, and site to identify savings opportunities, off-contract buying, and supplier renegotiation targets.',
        },
      ]}
    />
  )
}
