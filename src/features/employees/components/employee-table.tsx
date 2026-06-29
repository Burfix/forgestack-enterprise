'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmployeeAvatar } from './employee-avatar'
import { StatusBadge } from './status-badge'
import { ReadinessPill } from './readiness-pill'
import { QualIconCluster } from './qual-icon-cluster'
import { EmptyState } from './empty-state'
import type { EmployeeRow, ReadinessScore, CategoryIconStatus, RoleLevel } from '@/types/hr'

interface EnrichedEmployee extends EmployeeRow {
  readiness: ReadinessScore
  categoryStatuses: CategoryIconStatus[]
}

interface EmployeeTableProps {
  employees: EnrichedEmployee[]
  departments: { id: string; name: string }[]
}

const LEVEL_LABELS: Record<RoleLevel, string> = {
  assistant:        'Assistant',
  operator:         'Operator',
  technician:       'Technician',
  senior_technician:'Senior technician',
  artisan:          'Artisan',
  red_seal:         'Red Seal',
  supervisor:       'Supervisor',
  manager:          'Manager',
  executive:        'Executive',
}

export function EmployeeTable({ employees, departments }: EmployeeTableProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return employees.filter((emp) => {
      if (q) {
        const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
        const matchesName = fullName.includes(q)
        const matchesNumber = emp.employee_number.toLowerCase().includes(q)
        const matchesRole = emp.role?.title.toLowerCase().includes(q) ?? false
        if (!matchesName && !matchesNumber && !matchesRole) return false
      }
      if (deptFilter !== 'all' && emp.department?.id !== deptFilter) return false
      if (statusFilter !== 'all' && emp.employment_status !== statusFilter) return false
      if (levelFilter !== 'all' && emp.role?.level !== levelFilter) return false
      return true
    })
  }, [employees, query, deptFilter, statusFilter, levelFilter])

  const uniqueLevels = useMemo(() => {
    const levels = new Set(employees.map((e) => e.role?.level).filter(Boolean) as RoleLevel[])
    return Array.from(levels)
  }, [employees])

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-8 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-slate-900">Employee directory</h1>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {employees.length}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search name, number, role…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 text-sm border-slate-200 bg-white"
            />
          </div>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40 h-9 text-sm border-slate-200 bg-white">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm border-slate-200 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-40 h-9 text-sm border-slate-200 bg-white">
              <SelectValue placeholder="Role level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {uniqueLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {LEVEL_LABELS[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => {/* TODO: open add-employee modal */}}
            className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium text-white bg-[#1A3A5C] hover:bg-[#15304f] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10"></th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Emp #</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Manager</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Readiness</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qualifications</th>
              <th className="px-3 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
                onClick={() => router.push(`/hr/employees/${emp.id}`)}
              >
                <td className="px-6 py-3">
                  <EmployeeAvatar
                    firstName={emp.first_name}
                    lastName={emp.last_name}
                    photoUrl={emp.photo_url}
                  />
                </td>
                <td className="px-3 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                  {emp.employee_number}
                </td>
                <td className="px-3 py-3 font-medium text-slate-900 whitespace-nowrap">
                  {emp.first_name} {emp.last_name}
                </td>
                <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                  {emp.role?.title ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                  {emp.department?.name ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                  {emp.manager
                    ? `${emp.manager.first_name} ${emp.manager.last_name}`
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={emp.employment_status} />
                </td>
                <td className="px-3 py-3">
                  <ReadinessPill score={emp.readiness.total} />
                </td>
                <td className="px-3 py-3">
                  <QualIconCluster statuses={emp.categoryStatuses} />
                </td>
                <td className="px-3 py-3">
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <EmptyState query={query || undefined} />
        )}
      </div>
    </div>
  )
}
