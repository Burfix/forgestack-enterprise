export type WorkOrderStatus =
  | 'received'
  | 'dispatched'
  | 'on_site'
  | 'completed_awaiting_approval'
  | 'manager_approved'
  | 'sent_to_accounts'
  | 'invoiced'
  | 'closed'

export type SlaStatus = 'on_track' | 'at_risk' | 'breached' | 'none'

export interface WorkOrder {
  id: string
  organisation_id: string
  job_number: string
  client_name: string
  site_name: string
  site_id: string | null
  asset_description: string | null
  fault_description: string
  technician_id: string | null
  status: WorkOrderStatus
  sla_due_at: string | null
  technician_notes: string | null
  client_signature_captured: boolean
  client_signature_at: string | null
  manager_approved_by: string | null
  manager_approved_at: string | null
  manager_approval_notes: string | null
  invoice_number: string | null
  invoice_amount: number | null
  invoice_posted_at: string | null
  technisoft_job_id: string | null
  technisoft_last_sync: string | null
  created_at: string
  updated_at: string
  // relations
  technician: {
    id: string
    first_name: string
    last_name: string
    photo_url: string | null
  } | null
  approver: {
    id: string
    first_name: string
    last_name: string
  } | null
}
