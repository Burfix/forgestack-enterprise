import { BotMessageSquare, Cpu, BookOpenCheck, FileEdit } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function AiPage() {
  return (
    <PlaceholderModule
      icon={BotMessageSquare}
      name="AI copilot"
      description="Intelligent assistance trained on your operations data — fault triage, contract summarisation, technician knowledge base queries, and management report drafting."
      features={[
        {
          icon: Cpu,
          title: 'Work order triage assistant',
          description: 'Describe a fault and the Copilot recommends fault code classification, required technician skill set, expected parts, and estimated resolution time.',
        },
        {
          icon: BookOpenCheck,
          title: 'Contract clause summariser',
          description: 'Upload a client service agreement and receive a plain-English summary of SLA terms, penalty clauses, coverage exclusions, and renewal conditions.',
        },
        {
          icon: BotMessageSquare,
          title: 'Technician knowledge base',
          description: 'Ask questions about equipment manuals, historical fault resolution guides, and OEM service notes using natural language — answers backed by your actual data.',
        },
        {
          icon: FileEdit,
          title: 'Management report drafting',
          description: 'Generate draft operational and board reports from live platform data, ready for review and sign-off — no copy-pasting from spreadsheets required.',
        },
      ]}
    />
  )
}
