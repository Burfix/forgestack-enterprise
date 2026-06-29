'use client'

import { useState } from 'react'
import { ChevronLeft, Download, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { EmployeeAvatar } from '@/features/employees/components/employee-avatar'
import { WoStatusBadge } from './wo-status-badge'
import { WorkflowStepper } from './workflow-stepper'
import { SlaIndicator } from './sla-indicator'
import { computeSlaStatus } from '@/lib/db/work-orders'
import type { WorkOrder, WorkOrderStatus } from '@/types/work-orders'

interface WorkOrderDetailProps {
  workOrder: WorkOrder
}

export function WorkOrderDetail({ workOrder }: WorkOrderDetailProps) {
  const [status, setStatus] = useState<WorkOrderStatus>(workOrder.status)
  const [approvedAt, setApprovedAt] = useState<string | null>(workOrder.manager_approved_at)

  function handleStatusChange(newStatus: WorkOrderStatus, newApprovedAt: string) {
    setStatus(newStatus)
    setApprovedAt(newApprovedAt)
  }

  const slaStatus = computeSlaStatus(workOrder.sla_due_at, status)
  const syncTime = workOrder.technisoft_last_sync
    ? format(new Date(workOrder.technisoft_last_sync), 'HH:mm dd MMM')
    : null

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 pt-4 pb-0">
          <Link
            href="/work-orders"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Work orders
          </Link>
        </div>
        <div className="px-8 pb-5 flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm font-semibold text-[#1A3A5C]">{workOrder.job_number}</span>
              <WoStatusBadge status={status} size="lg" />
              <SlaIndicator status={slaStatus} />
            </div>
            <h1 className="text-xl font-medium text-slate-900 mb-2">{workOrder.fault_description}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{workOrder.client_name}</span>
              <span className="text-slate-300">·</span>
              <span>{workOrder.site_name}</span>
              <span className="text-slate-300">·</span>
              <span>Created {format(new Date(workOrder.created_at), 'dd MMM yyyy')}</span>
              {workOrder.sla_due_at && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>SLA due {format(new Date(workOrder.sla_due_at), 'dd MMM yyyy HH:mm')}</span>
                </>
              )}
            </div>
          </div>
          {workOrder.technician && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <EmployeeAvatar
                firstName={workOrder.technician.first_name}
                lastName={workOrder.technician.last_name}
                photoUrl={workOrder.technician.photo_url}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {workOrder.technician.first_name} {workOrder.technician.last_name}
                </p>
                <p className="text-xs text-slate-400">Assigned technician</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body — 2/3 + 1/3 layout */}
      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        {/* Left: job details */}
        <div className="col-span-2 space-y-5">

          {/* Job details card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Job details</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-5">
              {[
                { label: 'Client',      value: workOrder.client_name },
                { label: 'Site',        value: workOrder.site_name },
                { label: 'Asset',       value: workOrder.asset_description ?? '—' },
                { label: 'Technisoft ID', value: workOrder.technisoft_job_id ?? '—' },
                { label: 'Invoice #',   value: workOrder.invoice_number ?? '—' },
                { label: 'Invoice amount', value: workOrder.invoice_amount != null
                  ? `R ${workOrder.invoice_amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                  : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-slate-700 font-mono text-xs">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Fault description</p>
              <p className="text-sm text-slate-700">{workOrder.fault_description}</p>
            </div>
            {workOrder.technician_notes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Technician notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{workOrder.technician_notes}</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Parts used</p>
              <p className="text-sm text-slate-400 italic">Parts list will be populated from Technisoft job card.</p>
            </div>
          </div>

          {/* Job card document */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Job card</h2>
              <button
                disabled
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-md px-3 py-1.5 cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg h-40 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 bg-slate-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-slate-400 text-xs font-bold">PDF</span>
                </div>
                <p className="text-xs text-slate-400">Job card document — synced from Technisoft</p>
                <p className="text-xs text-slate-300 mt-0.5">{workOrder.job_number}.pdf</p>
              </div>
            </div>
          </div>

          {/* Signature + photos row */}
          <div className="grid grid-cols-2 gap-5">
            {/* Client signature */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Client signature</h2>
              {workOrder.client_signature_captured ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700 font-medium">Signature captured</p>
                    {workOrder.client_signature_at && (
                      <p className="text-xs text-slate-400">
                        {format(new Date(workOrder.client_signature_at), 'dd MMM yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Awaiting client signature on PDA.</p>
              )}
            </div>

            {/* Photos */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Evidence photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-100 rounded-lg border border-slate-200 border-dashed flex items-center justify-center"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-300" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Photos attached via PDA — sync pending.</p>
            </div>
          </div>

          {/* Technisoft sync status */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-500">Technisoft Service Manager</span>
              {syncTime && (
                <span className="ml-2 text-xs text-slate-400">Last sync: {syncTime}</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Connected
            </span>
          </div>
        </div>

        {/* Right: workflow stepper */}
        <div className="col-span-1">
          <WorkflowStepper
            workOrderId={workOrder.id}
            initialStatus={status}
            initialApprovedAt={approvedAt}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  )
}
