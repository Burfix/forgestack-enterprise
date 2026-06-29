import { ShieldHalf, Users2, Plug, ScrollText } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function AdminPage() {
  return (
    <PlaceholderModule
      icon={ShieldHalf}
      name="Administration"
      description="User and role management, organisation settings, third-party integration configuration, and an immutable audit log — the control centre for your ForgeStack account."
      features={[
        {
          icon: Users2,
          title: 'User & role management',
          description: 'Invite team members, assign roles (Technician, Operations Manager, Accounts, Admin), and control module-level permissions without engineering involvement.',
        },
        {
          icon: ShieldHalf,
          title: 'Organisation settings',
          description: 'Configure company name, logo, operating regions, financial year, default currency, VAT number, and SLA escalation contacts for your organisation.',
        },
        {
          icon: Plug,
          title: 'Integration hub',
          description: 'Connect Technisoft Service Manager, Sage Evolution, AccPac, and other ERP or field service platforms via pre-built, zero-code connectors.',
        },
        {
          icon: ScrollText,
          title: 'Audit log',
          description: 'Immutable record of every user action across the platform — data changes, approvals, exports, and configuration edits — for compliance and forensic review.',
        },
      ]}
    />
  )
}
