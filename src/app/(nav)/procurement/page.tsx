import { ShoppingCart } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function ProcurementPage() {
  return (
    <PlaceholderModule
      icon={ShoppingCart}
      name="Procurement"
      description="Manage purchase requisitions, supplier relationships, parts inventory, and spend analytics in one controlled workflow."
      widgets={[
        { label: 'Open purchase orders', metric: '—', description: 'POs awaiting delivery or approval' },
        { label: 'Spend this month', metric: '—', description: 'Against approved procurement budget' },
        { label: 'Low stock alerts', metric: '—', description: 'Parts below minimum reorder level' },
        { label: 'Supplier on-time delivery', metric: '—', description: 'Rolling 90-day supplier performance' },
      ]}
    />
  )
}
