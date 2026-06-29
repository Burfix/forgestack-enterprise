import { MapPin } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function SitesPage() {
  return (
    <PlaceholderModule
      icon={MapPin}
      name="Sites"
      description="Manage every client facility — locations, assets, service contracts, and on-site personnel in one place."
      widgets={[
        { label: 'Active sites', metric: '—', description: 'Facilities under management' },
        { label: 'Assets registered', metric: '—', description: 'Tracked HVAC and refrigeration units' },
        { label: 'Contracts expiring', metric: '—', description: 'Service agreements due for renewal in 90 days' },
        { label: 'Site visits this month', metric: '—', description: 'Planned maintenance and emergency calls' },
      ]}
    />
  )
}
