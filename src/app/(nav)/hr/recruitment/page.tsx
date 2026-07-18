// /hr/recruitment is a thin role-based redirector, not a page in its own
// right. ManCom and Executive get the read-only headcount dashboard;
// everyone else (Administrator, Manager, HR Admin, MD, Super Admin) gets
// the operational pipeline they've always had, now at /hr/recruitment/pipeline.
import { redirect } from 'next/navigation'
import { getCurrentRoles } from '@/lib/session'

const EXECUTIVE_ROLES = ['mancom', 'executive']

export default async function RecruitmentEntryPoint() {
  const roles = await getCurrentRoles()

  if (roles.some((r) => EXECUTIVE_ROLES.includes(r))) {
    redirect('/hr/recruitment/dashboard')
  }

  redirect('/hr/recruitment/pipeline')
}
