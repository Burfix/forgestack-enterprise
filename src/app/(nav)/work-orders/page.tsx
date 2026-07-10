export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getOrganisationId } from '@/lib/session'
import { getWorkOrders } from '@/lib/db/work-orders'
import { WorkOrdersBoard } from '@/features/work-orders/components/work-orders-board'

async function WorkOrdersData() {
  const orgId = await getOrganisationId()
  const workOrders = await getWorkOrders(orgId)

  const openCount = workOrders.filter((w) => w.status !== 'closed').length

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const emergencyCount = workOrders.filter(
    (w) => (w.priority === 'P1' || w.priority === 'P2') && new Date(w.created_at).getTime() >= sevenDaysAgo
  ).length

  const closedThisMonth = workOrders.filter((w) => {
    if (w.status !== 'closed') return false
    const closedAt = new Date(w.updated_at)
    const now = new Date()
    return closedAt.getMonth() === now.getMonth() && closedAt.getFullYear() === now.getFullYear()
  })
  const avgResolutionHours =
    closedThisMonth.length > 0
      ? Math.round(
          closedThisMonth.reduce((sum, w) => {
            const hours = (new Date(w.updated_at).getTime() - new Date(w.created_at).getTime()) / (1000 * 60 * 60)
            return sum + hours
          }, 0) / closedThisMonth.length
        )
      : null

  const billableHoursAwaitingInvoice = workOrders.filter(
    (w) => w.status === 'manager_approved' || w.status === 'sent_to_accounts'
  ).length

  return (
    <WorkOrdersBoard
      workOrders={workOrders}
      openCount={openCount}
      avgResolutionHours={avgResolutionHours}
      emergencyCount={emergencyCount}
      billableHoursAwaitingInvoice={billableHoursAwaitingInvoice}
    />
  )
}

function WorkOrdersSkeleton() {
  return (
    <div className="px-8 py-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 h-96" />
    </div>
  )
}

export default function WorkOrdersPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <Suspense fallback={<WorkOrdersSkeleton />}>
        <WorkOrdersData />
      </Suspense>
    </div>
  )
}
