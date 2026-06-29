import { Cog } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function OperationsPage() {
  return (
    <PlaceholderModule
      icon={Cog}
      name="Operations"
      description="Coordinate field technician dispatch, manage work schedules, and track job completion across all service zones."
      widgets={[
        { label: 'Jobs in progress', metric: '—', description: 'Technicians currently on site' },
        { label: 'Dispatch queue', metric: '—', description: 'Jobs awaiting technician assignment' },
        { label: 'Average job duration', metric: '—', description: 'Time from dispatch to completion this week' },
        { label: 'First-time fix rate', metric: '—', description: 'Jobs resolved without a return visit' },
      ]}
    />
  )
}
