import { GraduationCap } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function TrainingPage() {
  return (
    <PlaceholderModule
      icon={GraduationCap}
      name="Training"
      description="Schedule, track, and record all technical and compliance training. Linked directly to the qualification tracker."
      widgets={[
        { label: 'Training sessions this quarter', metric: '—', description: 'Scheduled and completed' },
        { label: 'Certifications issued', metric: '—', description: 'New qualifications recorded year to date' },
        { label: 'Training budget utilised', metric: '—', description: 'Spend against annual budget' },
        { label: 'Skills gap index', metric: '—', description: 'Missing mandatory qualifications across the workforce' },
      ]}
    />
  )
}
