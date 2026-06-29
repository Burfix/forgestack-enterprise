import { Sparkles } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function AiCopilotPage() {
  return (
    <PlaceholderModule
      icon={Sparkles}
      name="AI copilot"
      description="Your intelligent operations assistant — ask questions, generate reports, diagnose faults, and get recommendations across every module."
      widgets={[
        { label: 'Queries this week', metric: '—', description: 'AI-assisted decisions and lookups' },
        { label: 'Report drafts generated', metric: '—', description: 'Automated summaries and narratives' },
        { label: 'Fault diagnoses assisted', metric: '—', description: 'Technician AI support sessions' },
        { label: 'Time saved estimate', metric: '—', description: 'Hours reclaimed from manual reporting' },
      ]}
    />
  )
}
