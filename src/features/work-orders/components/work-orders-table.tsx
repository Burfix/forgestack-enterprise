'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmployeeAvatar } from '@/features/employees/components/employee-avatar'
import { WoStatusBadge } from './wo-status-badge'
import { SlaIndicator } from './sla-indicator'
import type { WorkOrder, WorkOrderStatus, SlaStatus } from '@/types/work-orders'
import { format } from 'date-fns'

interface WorkOrderRow extends WorkOrder {
  slaStatus: SlaStatus
}

interface KpiData {
  open: number
  pendingApproval: number
  pendingInvoice: number
  completedThisMonth: number
}

interface WorkOrdersTableProps {
  workOrders: WorkOrderRow[]
  kpi: KpiData
}

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  received:                    'Received',
  dispatched:                  'Dispatched',
  on_site:                     'On site',
  completed_awaiting_approval: 'Awaiting approval',
  manager_approved:            'Manager approved',
  sent_to_accounts:            'Sent to accounts',
  invoiced:                    'Invoiced',
  closed:                      'Closed',
}

const KPI_CARD_COLOURS = [
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-orange-500',
  'border-l-green-500',
]

export function WorkOrdersTable({ workOrders, kpi }: WorkOrdersTableProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return workOrders.filter((wo) => {
      if (statusFilter !== 'all' && wo.status !== statusFilter) return false
      if (q) {
        const combined = [
          wo.job_number,
          wo.client_name,
          wo.site_name,
          wo.fault_description,
          wo.technician ? `${wo.technician.first_name} ${wo.technician.last_name}` : '',
        ].join(' ').toLowerCase()
        if (!combined.includes(q)) return false
      }
      return true
    })
  }, [workOrders, query, statusFilter])

  return (
    <div>
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 px-8 py-6">
        {[
          { label: 'Open work orders',      value: kpi.open,               colour: KPI_CARD_COLOURS[0] },
          { label: 'Pending approval',       value: kpi.pendingApproval,    colour: KPI_CARD_COLOURS[1] },
          { label: 'Pending invoice',        value: kpi.pendingInvoice,     colour: KPI_CARD_COLOURS[2] },
          { label: 'Completed this month',   value: kpi.completedThisMonth, colour: KPI_CARD_COLOURS[3] },
        ].map(({ label, value, colour }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border border-slate-200 border-l-4 ${colour} px-5 py-4`}
          >
            <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-semibold text-slate-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-8 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-slate-900">All work orders</h2>
          <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search job, client, technician…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 text-sm border-slate-200 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-9 text-sm border-slate-200 bg-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.entries(STATUS_LABELS) as [WorkOrderStatus, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="px-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job #</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Site</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Technician</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Created</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SLA</th>
                <th className="px-3 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((wo) => (
                <tr
                  key={wo.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  onClick={() => router.push(`/work-orders/${wo.id}`)}
                >
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-medium text-[#1A3A5C]">{wo.job_number}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{wo.client_name}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs whitespace-nowrap max-w-[140px] truncate">{wo.site_name}</td>
                  <td className="px-3 py-3 text-slate-600 max-w-[200px]">
                    <span className="line-clamp-1">{wo.fault_description}</span>
                  </td>
                  <td className="px-3 py-3">
                    {wo.technician ? (
                      <div className="flex items-center gap-2">
                        <EmployeeAvatar
                          firstName={wo.technician.first_name}
                          lastName={wo.technician.last_name}
                          photoUrl={wo.technician.photo_url}
                          size="sm"
                        />
                        <span className="text-slate-700 whitespace-nowrap">
                          {wo.technician.first_name} {wo.technician.last_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <WoStatusBadge status={wo.status} />
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {format(new Date(wo.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-3 py-3">
                    <SlaIndicator status={wo.slaStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm">No work orders match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
