// Read-only executive view for ManCom and Executive roles only. No
// candidate names, no drag-to-advance, no write actions of any kind — this
// is a reporting surface, not an operational one. Anyone without the
// mancom/executive role is bounced back through the /hr/recruitment
// redirector, which sends them to the operational pipeline instead.
import { redirect } from 'next/navigation'
import { getCurrentRoles } from '@/lib/session'
import { ManComRecruitmentDashboard } from '@/features/recruitment/components/mancom-dashboard'

const EXECUTIVE_ROLES = ['mancom', 'executive']

export default async function RecruitmentDashboardPage() {
  const roles = await getCurrentRoles()

  if (!roles.some((r) => EXECUTIVE_ROLES.includes(r))) {
    redirect('/hr/recruitment')
  }

  return (
    <div className="min-h-full bg-slate-50 px-8 py-6">
      <ManComRecruitmentDashboard showInterviewFunnel={roles.includes('mancom')} />
    </div>
  )
}
