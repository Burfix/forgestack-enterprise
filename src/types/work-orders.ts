export type WorkOrderStatus =
  | 'received'
  | 'dispatched'
  | 'on_site'
  | 'quote_pending'
  | 'awaiting_po'
  | 'completed_awaiting_approval'
  | 'manager_approved'
  | 'sent_to_accounts'
  | 'invoiced'
  | 'closed'

export type WorkOrderPriority = 'P1' | 'P2' | 'P3' | 'P4'

export interface WorkOrderEmployeeRef {
  id: string
  first_name: string
  last_name: string
}

export interface WorkOrderEvent {
  id: string
  from_status: WorkOrderStatus | null
  to_status: WorkOrderStatus
  notes: string | null
  created_at: string
  actor: WorkOrderEmployeeRef | null
}

export interface WorkOrderRow {
  id: string
  organisation_id: string
  job_number: string
  client_name: string
  site_name: string
  site_id: string | null
  asset_description: string | null
  fault_description: string
  priority: WorkOrderPriority
  status: WorkOrderStatus
  sla_due_at: string | null
  technician: WorkOrderEmployeeRef | null
  technician_notes: string | null
  client_signature_captured: boolean
  client_signature_at: string | null
  requires_quote: boolean
  quote_requested_at: string | null
  quote_amount: number | null
  quote_sent_at: string | null
  po_number: string | null
  po_received_at: string | null
  manager_approved_by: WorkOrderEmployeeRef | null
  manager_approved_at: string | null
  manager_approval_notes: string | null
  invoice_number: string | null
  invoice_amount: number | null
  invoice_posted_at: string | null
  technisoft_job_id: string | null
  technisoft_last_sync: string | null
  created_at: string
  updated_at: string
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  received: 'Received',
  dispatched: 'Dispatched',
  on_site: 'On site',
  quote_pending: 'Quote pending',
  awaiting_po: 'Awaiting client PO',
  completed_awaiting_approval: 'Awaiting manager approval',
  manager_approved: 'Manager approved',
  sent_to_accounts: 'Sent to accounts',
  invoiced: 'Invoiced',
  closed: 'Closed',
}

// Legal next steps per status — mirrors fs_work_order_transition's state
// machine on the database side. Kept in sync manually since Postgres check
// constraints aren't introspectable into a clean TS union at build time.
export const WORK_ORDER_NEXT_STATUSES: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  received: ['dispatched'],
  dispatched: ['on_site'],
  on_site: ['completed_awaiting_approval', 'quote_pending'],
  quote_pending: ['awaiting_po'],
  awaiting_po: ['dispatched'],
  completed_awaiting_approval: ['manager_approved', 'dispatched'],
  manager_approved: ['sent_to_accounts'],
  sent_to_accounts: ['invoiced'],
  invoiced: ['closed'],
  closed: [],
}
