import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { WorkOrder } from '@/types/work-orders'

export async function getWorkOrders(organisationId: string): Promise<WorkOrder[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      id, organisation_id, job_number, client_name, site_name, site_id,
      asset_description, fault_description, technician_id, status, sla_due_at,
      technician_notes, client_signature_captured, client_signature_at,
      manager_approved_by, manager_approved_at, manager_approval_notes,
      invoice_number, invoice_amount, invoice_posted_at,
      technisoft_job_id, technisoft_last_sync,
      created_at, updated_at,
      technician:employees!technician_id(id, first_name, last_name, photo_url),
      approver:employees!manager_approved_by(id, first_name, last_name)
    `)
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load work orders: ${error.message}`)
  return (data ?? []).map(normalise)
}

export async function getWorkOrder(
  organisationId: string,
  id: string
): Promise<WorkOrder | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      id, organisation_id, job_number, client_name, site_name, site_id,
      asset_description, fault_description, technician_id, status, sla_due_at,
      technician_notes, client_signature_captured, client_signature_at,
      manager_approved_by, manager_approved_at, manager_approval_notes,
      invoice_number, invoice_amount, invoice_posted_at,
      technisoft_job_id, technisoft_last_sync,
      created_at, updated_at,
      technician:employees!technician_id(id, first_name, last_name, photo_url),
      approver:employees!manager_approved_by(id, first_name, last_name)
    `)
    .eq('organisation_id', organisationId)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  return normalise(data)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalise(raw: any): WorkOrder {
  return {
    ...raw,
    technician: Array.isArray(raw.technician) ? (raw.technician[0] ?? null) : (raw.technician ?? null),
    approver: Array.isArray(raw.approver) ? (raw.approver[0] ?? null) : (raw.approver ?? null),
  }
}

export function computeSlaStatus(
  slaAt: string | null,
  status: WorkOrder['status']
): import('@/types/work-orders').SlaStatus {
  if (!slaAt) return 'none'
  if (status === 'invoiced' || status === 'closed') return 'none'
  const due = new Date(slaAt).getTime()
  const now = Date.now()
  const remaining = due - now
  if (remaining < 0) return 'breached'
  if (remaining < 4 * 60 * 60 * 1000) return 'at_risk'
  return 'on_track'
}
