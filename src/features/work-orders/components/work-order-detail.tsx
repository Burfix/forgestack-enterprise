'use client'

import { useEffect, useState, useTransition } from 'react'
import type { WorkOrderEvent, WorkOrderRow, WorkOrderStatus } from '@/types/work-orders'
import { WORK_ORDER_NEXT_STATUSES, WORK_ORDER_STATUS_LABELS } from '@/types/work-orders'
import { WorkOrderStatusBadge, WorkOrderPriorityBadge } from './badges'
import { getWorkOrderHistory, transitionWorkOrder } from '../actions'

interface Props {
  workOrder: WorkOrderRow
  onClose: () => void
}

const ACTION_LABELS: Partial<Record<WorkOrderStatus, string>> = {
  dispatched: 'Dispatch',
  on_site: 'Mark on site',
  completed_awaiting_approval: 'Mark completed',
  quote_pending: 'Requires a quote',
  awaiting_po: 'Quote sent to client',
  manager_approved: 'Approve',
  sent_to_accounts: 'Send to accounts',
  invoiced: 'Post invoice',
  closed: 'Close work order',
}

export function WorkOrderDetail({ workOrder, onClose }: Props) {
  const [history, setHistory] = useState<WorkOrderEvent[]>([])
  const [notes, setNotes] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    getWorkOrderHistory(workOrder.id).then(setHistory)
  }, [workOrder.id])

  const nextStatuses = WORK_ORDER_NEXT_STATUSES[workOrder.status]

  function handleTransition(newStatus: WorkOrderStatus) {
    setError(null)
    startTransition(async () => {
      const result = await transitionWorkOrder({
        workOrderId: workOrder.id,
        newStatus,
        notes: notes.trim() || undefined,
        invoiceNumber: newStatus === 'invoiced' ? invoiceNumber.trim() || undefined : undefined,
        invoiceAmount: newStatus === 'invoiced' && invoiceAmount ? Number(invoiceAmount) : undefined,
        poNumber: newStatus === 'dispatched' && workOrder.status === 'awaiting_po' ? poNumber.trim() || undefined : undefined,
        quoteAmount: newStatus === 'quote_pending' && quoteAmount ? Number(quoteAmount) : undefined,
      })
      if (!result.ok) {
        setError(result.message ?? 'Something went wrong.')
        return
      }
      setNotes('')
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">{workOrder.job_number}</p>
            <h2 className="text-lg font-semibold text-slate-900">{workOrder.client_name}</h2>
            <p className="text-sm text-slate-500">{workOrder.site_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-2">
            <WorkOrderStatusBadge status={workOrder.status} />
            <WorkOrderPriorityBadge priority={workOrder.priority} />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Fault / job description</p>
            <p className="text-sm text-slate-700">{workOrder.fault_description}</p>
            {workOrder.asset_description && (
              <p className="text-xs text-slate-400 mt-1">Asset: {workOrder.asset_description}</p>
            )}
          </div>

          {workOrder.technician && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Technician</p>
              <p className="text-sm text-slate-700">
                {workOrder.technician.first_name} {workOrder.technician.last_name}
              </p>
            </div>
          )}

          {workOrder.requires_quote && (
            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800 space-y-1">
              <p className="font-medium">Quote / PO branch</p>
              {workOrder.quote_amount && <p>Quote amount: R{workOrder.quote_amount.toLocaleString()}</p>}
              {workOrder.po_number && <p>Client PO: {workOrder.po_number}</p>}
            </div>
          )}

          {workOrder.manager_approval_notes && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Manager notes</p>
              <p className="text-sm text-slate-700">{workOrder.manager_approval_notes}</p>
            </div>
          )}

          {workOrder.invoice_number && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Invoice</p>
              <p className="text-sm text-slate-700">
                {workOrder.invoice_number} &middot; R{workOrder.invoice_amount?.toLocaleString()}
              </p>
            </div>
          )}

          {/* Action panel */}
          {nextStatuses.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Next step</p>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              {nextStatuses.includes('invoiced') && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Invoice number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                  />
                  <input
                    placeholder="Amount (R)"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
              )}

              {workOrder.status === 'awaiting_po' && (
                <input
                  placeholder="Client PO number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                />
              )}

              {nextStatuses.includes('quote_pending') && (
                <input
                  placeholder="Estimated quote amount (R, optional)"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                />
              )}

              <textarea
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
              />

              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <button
                    key={status}
                    disabled={pending}
                    onClick={() => handleTransition(status)}
                    className={`text-sm font-medium rounded-lg px-3 py-1.5 disabled:opacity-50 ${
                      status === 'dispatched' && workOrder.status === 'completed_awaiting_approval'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-[#1A3A5C] text-white hover:bg-[#15304c]'
                    }`}
                  >
                    {status === 'dispatched' && workOrder.status === 'completed_awaiting_approval'
                      ? 'Send back to technician'
                      : ACTION_LABELS[status] ?? WORK_ORDER_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">History</p>
            <div className="space-y-2">
              {history.map((event) => (
                <div key={event.id} className="text-xs text-slate-500 flex justify-between gap-2">
                  <span>
                    {event.from_status ? `${WORK_ORDER_STATUS_LABELS[event.from_status]} \u2192 ` : ''}
                    <span className="font-medium text-slate-700">{WORK_ORDER_STATUS_LABELS[event.to_status]}</span>
                    {event.actor && ` \u00b7 ${event.actor.first_name} ${event.actor.last_name}`}
                  </span>
                  <span className="whitespace-nowrap">{new Date(event.created_at).toLocaleString('en-ZA')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
