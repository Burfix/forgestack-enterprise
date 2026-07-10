'use client'

import { useMemo, useState } from 'react'
import type { WorkOrderRow, WorkOrderStatus } from '@/types/work-orders'
import { WORK_ORDER_STATUS_LABELS } from '@/types/work-orders'
import { WorkOrderStatusBadge, WorkOrderPriorityBadge } from './badges'
import { WorkOrderDetail } from './work-order-detail'
import { NewWorkOrderForm } from './new-work-order-form'

interface Props {
  workOrders: WorkOrderRow[]
  openCount: number
  avgResolutionHours: number | null
  emergencyCount: number
  billableHoursAwaitingInvoice: number
}

export function WorkOrdersBoard({
  workOrders,
  openCount,
  avgResolutionHours,
  emergencyCount,
  billableHoursAwaitingInvoice,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<WorkOrderRow | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const filtered = useMemo(
    () => (statusFilter === 'all' ? workOrders : workOrders.filter((w) => w.status === statusFilter)),
    [workOrders, statusFilter]
  )

  const dateLabel = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Work orders</h1>
          <p className="text-xs text-slate-400">As of {dateLabel}</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-[#1A3A5C] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#15304c]"
        >
          + Log work order
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Open work orders" metric={String(openCount)} sub="Across all statuses and priorities" />
        <KpiCard
          label="Average resolution time"
          metric={avgResolutionHours !== null ? `${avgResolutionHours}h` : '\u2014'}
          sub="Hours from creation to close this month"
        />
        <KpiCard
          label="Emergency callouts"
          metric={String(emergencyCount)}
          metricColour={emergencyCount > 0 ? 'text-red-600' : undefined}
          sub="P1 and P2 work orders this week"
        />
        <KpiCard
          label="Billable hours logged"
          metric={String(billableHoursAwaitingInvoice)}
          sub="Work orders awaiting invoicing"
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <FilterPill label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        {(Object.keys(WORK_ORDER_STATUS_LABELS) as WorkOrderStatus[]).map((status) => (
          <FilterPill
            key={status}
            label={WORK_ORDER_STATUS_LABELS[status]}
            active={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Job</th>
              <th className="px-5 py-3 font-medium">Client / site</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Technician</th>
              <th className="px-5 py-3 font-medium">SLA due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">
                  No work orders match this filter.
                </td>
              </tr>
            )}
            {filtered.map((wo) => (
              <tr
                key={wo.id}
                onClick={() => setSelected(wo)}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-5 py-3 font-medium text-slate-700">{wo.job_number}</td>
                <td className="px-5 py-3">
                  <p className="text-slate-700">{wo.client_name}</p>
                  <p className="text-xs text-slate-400">{wo.site_name}</p>
                </td>
                <td className="px-5 py-3">
                  <WorkOrderPriorityBadge priority={wo.priority} />
                </td>
                <td className="px-5 py-3">
                  <WorkOrderStatusBadge status={wo.status} />
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {wo.technician ? `${wo.technician.first_name} ${wo.technician.last_name}` : '\u2014'}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {wo.sla_due_at ? formatSlaDue(wo.sla_due_at, wo.status) : '\u2014'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <WorkOrderDetail workOrder={selected} onClose={() => setSelected(null)} />}
      {showNewForm && <NewWorkOrderForm onClose={() => setShowNewForm(false)} />}
    </div>
  )
}

function formatSlaDue(slaDueAt: string, status: WorkOrderStatus) {
  if (status === 'closed') return '\u2014'
  const due = new Date(slaDueAt).getTime()
  const now = Date.now()
  const hoursLeft = Math.round((due - now) / (1000 * 60 * 60))
  if (hoursLeft < 0) return <span className="text-red-600 font-medium">Overdue by {Math.abs(hoursLeft)}h</span>
  return `${hoursLeft}h left`
}

function KpiCard({
  label,
  metric,
  metricColour,
  sub,
}: {
  label: string
  metric: string
  metricColour?: string
  sub: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">{label}</p>
      <p className={`text-3xl font-bold tabular-nums leading-none mb-1 ${metricColour ?? 'text-[#1A3A5C]'}`}>
        {metric}
      </p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium rounded-full px-3 py-1.5 ring-1 ring-inset whitespace-nowrap ${
        active
          ? 'bg-[#1A3A5C] text-white ring-[#1A3A5C]'
          : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}
