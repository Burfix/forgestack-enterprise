import { ShieldCheck, FileCheck2, AlertTriangle, UserCog, ClipboardList } from 'lucide-react'
import { PlaceholderModule } from '@/components/placeholder-module'

export default function CompliancePage() {
  return (
    <PlaceholderModule
      icon={ShieldCheck}
      name="Compliance"
      description="Statutory certificate management, safety incident logging, contractor induction tracking, and internal audit workflows — all in one auditable register."
      features={[
        {
          icon: FileCheck2,
          title: 'Statutory certificate register',
          description: 'Track Certificates of Compliance, OHS Act reports, lift inspection certificates, and SANS 10400 records with automated expiry alerts and responsible-person assignment.',
        },
        {
          icon: AlertTriangle,
          title: 'Incident & near-miss log',
          description: 'Capture, investigate, and close out safety incidents with root-cause classification, corrective action tracking, and COIDA reporting support.',
        },
        {
          icon: UserCog,
          title: 'Contractor induction tracker',
          description: 'Verify that every sub-contractor and visiting technician has completed site-specific safety inductions before they are permitted to commence work.',
        },
        {
          icon: ClipboardList,
          title: 'Audit management',
          description: 'Plan and execute internal compliance audits, assign corrective actions with due dates, and track close-out status through to verified completion.',
        },
      ]}
    />
  )
}
