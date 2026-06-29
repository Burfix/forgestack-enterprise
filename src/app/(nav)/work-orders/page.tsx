export const dynamic = 'force-dynamic'

import { getOrganisationId } from '@/lib/session'
import { getWorkOrders, computeSlaStatus } from '@/lib/db/work-orders'
import { WorkOrdersTable } from '@/features/work-orders/components/work-orders-table'

export default async function WorkOrdersPage() {
  const orgId = await getOrganisationId()
  const workOrders = await getWorkOrders(orgId)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const enriched = workOrders.map((wo) => ({
    ...wo,
    slaStatus: computeSlaStatus(wo.sla_due_at, wo.status),
  }))

  const OPEN_STATUSES = ['received', 'dispatched', 'on_site', 'completed_awaiting_approval', 'manager_approved', 'sent_to_accounts']

  const kpi = {
    open: enriched.filter((wo) => OPEN_STATUSES.includes(wo.status)).length,
    pendingApproval: enriched.filter((wo) => wo.status === 'completed_awaiting_approval').length,
    pendingInvoice: enriched.filter((wo) => wo.status === 'sent_to_accounts').length,
    completedThisMonth: enriched.filter(
      (wo) => (wo.status === 'invoiced' || wo.status === 'closed') &&
        new Date(wo.updated_at) >= startOfMonth
    ).length,
  }

  return (
    <div className="min-h-full bg-slate-50 pb-10">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-medium text-slate-900">Work orders</h1>
        <p className="text-sm text-slate-500 mt-0.5">Technisoft Service Manager → ForgeStack approval → ERP invoicing</p>
      </div>
      <WorkOrdersTable workOrders={enriched} kpi={kpi} />
    </div>
  )
}
