'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentEmployeeId, getOrganisationId } from '@/lib/session'
import type { WorkOrderPriority, WorkOrderStatus } from '@/types/work-orders'

interface ActionResult {
  ok: boolean
  message?: string
}

function noEmployeeLinkError(): ActionResult {
  return {
    ok: false,
    message:
      'Your account isn\u2019t linked to an employee record yet, so this action can\u2019t be attributed to anyone. Ask an admin to link your profile to your employee record.',
  }
}

interface CreateWorkOrderInput {
  clientName: string
  siteName: string
  siteId: string | null
  assetDescription: string | null
  faultDescription: string
  priority: WorkOrderPriority
  slaHours: number
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const orgId = await getOrganisationId()
  const actorEmployeeId = await getCurrentEmployeeId()
  if (!actorEmployeeId) return noEmployeeLinkError()

  const { error } = await supabase.rpc('fs_work_order_create', {
    p_organisation_id: orgId,
    p_client_name: input.clientName,
    p_site_name: input.siteName,
    p_site_id: input.siteId,
    p_asset_description: input.assetDescription,
    p_fault_description: input.faultDescription,
    p_priority: input.priority,
    p_sla_hours: input.slaHours,
    p_actor_employee_id: actorEmployeeId,
  })

  // fs_work_order_create raises plain-language exceptions itself — pass
  // straight through rather than showing a raw Postgres error.
  if (error) return { ok: false, message: error.message }

  revalidatePath('/work-orders')
  return { ok: true }
}

interface TransitionWorkOrderInput {
  workOrderId: string
  newStatus: WorkOrderStatus
  notes?: string
  technicianId?: string
  clientSignatureCaptured?: boolean
  quoteAmount?: number
  poNumber?: string
  invoiceNumber?: string
  invoiceAmount?: number
}

// The single write path for status changes. The UI never updates `status`
// directly — it always calls this, which calls fs_work_order_transition()
// in the database. That function enforces the legal state machine and the
// actor's role; this action's job is to translate its response into
// something an operator can act on.
export async function transitionWorkOrder(input: TransitionWorkOrderInput): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  const actorEmployeeId = await getCurrentEmployeeId()
  if (!actorEmployeeId) return noEmployeeLinkError()

  const { error } = await supabase.rpc('fs_work_order_transition', {
    p_work_order_id: input.workOrderId,
    p_new_status: input.newStatus,
    p_actor_employee_id: actorEmployeeId,
    p_notes: input.notes ?? null,
    p_technician_id: input.technicianId ?? null,
    p_client_signature_captured: input.clientSignatureCaptured ?? null,
    p_quote_amount: input.quoteAmount ?? null,
    p_po_number: input.poNumber ?? null,
    p_invoice_number: input.invoiceNumber ?? null,
    p_invoice_amount: input.invoiceAmount ?? null,
  })

  if (error) return { ok: false, message: error.message }

  revalidatePath('/work-orders')
  return { ok: true }
}

export async function getWorkOrderHistory(workOrderId: string) {
  const { getWorkOrderEvents } = await import('@/lib/db/work-orders')
  return getWorkOrderEvents(workOrderId)
}
