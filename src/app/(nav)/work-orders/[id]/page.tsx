export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getOrganisationId } from '@/lib/session'
import { getWorkOrder } from '@/lib/db/work-orders'
import { WorkOrderDetail } from '@/features/work-orders/components/work-order-detail'

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const orgId = await getOrganisationId()
  const workOrder = await getWorkOrder(orgId, id)

  if (!workOrder) notFound()

  return <WorkOrderDetail workOrder={workOrder} />
}
