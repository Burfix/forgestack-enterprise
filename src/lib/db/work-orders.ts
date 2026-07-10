import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { WorkOrderRow, WorkOrderEvent } from '@/types/work-orders'

const WORK_ORDER_SELECT = `
  id, organisation_id, job_number, client_name, site_name, site_id,
  asset_description, fault_description, priority, status, sla_due_at,
  technician:technician_id(id, first_name, last_name),
  technician_notes, client_signature_captured, client_signature_at,
  requires_quote, quote_requested_at, quote_amount, quote_sent_at,
  po_number, po_received_at,
  manager_approved_by_employee:manager_approved_by(id, first_name, last_name),
  manager_approved_at, manager_approval_notes,
  invoice_number, invoice_amount, invoice_posted_at,
  technisoft_job_id, technisoft_last_sync,
  created_at, updated_at
`

export async function getWorkOrders(organisationId: string): Promise<WorkOrderRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load work orders: ${error.message}`)

  return (data ?? []).map(normaliseWorkOrder)
}

export async function getWorkOrder(
  organisationId: string,
  workOrderId: string
): Promise<WorkOrderRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .eq('organisation_id', organisationId)
    .eq('id', workOrderId)
    .is('deleted_at', null)
    .single()

  if (error) return null
  return normaliseWorkOrder(data)
}

export async function getWorkOrderEvents(workOrderId: string): Promise<WorkOrderEvent[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('work_order_events')
    .select('id, from_status, to_status, notes, created_at, actor:actor_employee_id(id, first_name, last_name)')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to load work order history: ${error.message}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((raw: any) => ({
    id: raw.id,
    from_status: raw.from_status,
    to_status: raw.to_status,
    notes: raw.notes,
    created_at: raw.created_at,
    actor: Array.isArray(raw.actor) ? (raw.actor[0] ?? null) : (raw.actor ?? null),
  }))
}

// Supabase returns arrays or single objects for relations depending on
// cardinality — same normalisation pattern used across the codebase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseWorkOrder(raw: any): WorkOrderRow {
  const technician = Array.isArray(raw.technician) ? (raw.technician[0] ?? null) : (raw.technician ?? null)
  const managerApprovedBy = Array.isArray(raw.manager_approved_by_employee)
    ? (raw.manager_approved_by_employee[0] ?? null)
    : (raw.manager_approved_by_employee ?? null)

  return {
    id: raw.id,
    organisation_id: raw.organisation_id,
    job_number: raw.job_number,
    client_name: raw.client_name,
    site_name: raw.site_name,
    site_id: raw.site_id,
    asset_description: raw.asset_description,
    fault_description: raw.fault_description,
    priority: raw.priority,
    status: raw.status,
    sla_due_at: raw.sla_due_at,
    technician,
    technician_notes: raw.technician_notes,
    client_signature_captured: raw.client_signature_captured,
    client_signature_at: raw.client_signature_at,
    requires_quote: raw.requires_quote,
    quote_requested_at: raw.quote_requested_at,
    quote_amount: raw.quote_amount,
    quote_sent_at: raw.quote_sent_at,
    po_number: raw.po_number,
    po_received_at: raw.po_received_at,
    manager_approved_by: managerApprovedBy,
    manager_approved_at: raw.manager_approved_at,
    manager_approval_notes: raw.manager_approval_notes,
    invoice_number: raw.invoice_number,
    invoice_amount: raw.invoice_amount,
    invoice_posted_at: raw.invoice_posted_at,
    technisoft_job_id: raw.technisoft_job_id,
    technisoft_last_sync: raw.technisoft_last_sync,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}
