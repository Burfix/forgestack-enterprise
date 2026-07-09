'use client'

import { Fragment, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createVacancy, createCandidate } from '@/features/recruitment/actions'
import type { VacancyRow, VacancyPriority } from '@/types/recruitment'
import type { SiteOption, DepartmentOption, EmployeeRoleOption } from '@/lib/db/reference-data'

interface Props {
  vacancies: VacancyRow[]
  sites: SiteOption[]
  departments: DepartmentOption[]
  roles: EmployeeRoleOption[]
}

const STATUS_STYLE: Record<VacancyRow['status'], string> = {
  open: 'bg-green-50 text-green-700 ring-green-200',
  on_hold: 'bg-amber-50 text-amber-700 ring-amber-200',
  filled: 'bg-slate-100 text-slate-500 ring-slate-200',
  cancelled: 'bg-slate-100 text-slate-400 ring-slate-200',
}

export function VacanciesPanel({ vacancies, sites, departments, roles }: Props) {
  const [showNewVacancy, setShowNewVacancy] = useState(false)
  const [candidateFormFor, setCandidateFormFor] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Vacancies</h2>
        <Button size="sm" variant="outline" onClick={() => setShowNewVacancy((v) => !v)}>
          {showNewVacancy ? 'Cancel' : '+ New vacancy'}
        </Button>
      </div>

      {showNewVacancy && (
        <NewVacancyForm
          sites={sites}
          departments={departments}
          roles={roles}
          onDone={() => setShowNewVacancy(false)}
        />
      )}

      {vacancies.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-slate-700">No vacancies yet</p>
          <p className="text-xs text-slate-400 mt-1">Create one to start bringing candidates into the pipeline</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Site / Dept</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidates</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vacancies.map((v) => (
              <Fragment key={v.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{v.position_title}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {v.site?.name ?? '—'} · {v.department?.name ?? '—'}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[v.status]}`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 tabular-nums">{v.candidateCount}</td>
                  <td className="px-3 py-3 text-right">
                    {(v.status === 'open' || v.status === 'on_hold') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCandidateFormFor(candidateFormFor === v.id ? null : v.id)}
                      >
                        {candidateFormFor === v.id ? 'Cancel' : '+ Add candidate'}
                      </Button>
                    )}
                  </td>
                </tr>
                {candidateFormFor === v.id && (
                  <tr>
                    <td colSpan={5} className="bg-slate-50 px-5 py-4">
                      <NewCandidateForm vacancyId={v.id} onDone={() => setCandidateFormFor(null)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function NewVacancyForm({
  sites,
  departments,
  roles,
  onDone,
}: {
  sites: SiteOption[]
  departments: DepartmentOption[]
  roles: EmployeeRoleOption[]
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [positionTitle, setPositionTitle] = useState('')
  const [siteId, setSiteId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [priority, setPriority] = useState<VacancyPriority>('normal')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createVacancy({
        siteId,
        departmentId,
        roleId: roleId || null,
        positionTitle,
        priority,
        targetStartDate: null,
      })
      if (!result.ok) {
        setError(result.message ?? 'Could not create the vacancy.')
        return
      }
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 border-b border-slate-100 bg-slate-50 space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <Input
          placeholder="Position title"
          value={positionTitle}
          onChange={(e) => setPositionTitle(e.target.value)}
          required
          className="col-span-2 bg-white"
        />
        <Select value={siteId} onValueChange={setSiteId}>
          <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Site" /></SelectTrigger>
          <SelectContent>
            {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Role (optional)" /></SelectTrigger>
          <SelectContent>
            {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setPriority(v as VacancyPriority)}>
          <SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low priority</SelectItem>
            <SelectItem value="normal">Normal priority</SelectItem>
            <SelectItem value="high">High priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create vacancy'}</Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  )
}

function NewCandidateForm({ vacancyId, onDone }: { vacancyId: string; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createCandidate({
        vacancyId,
        firstName,
        surname,
        email: email || null,
        phone: phone || null,
        source: source || null,
      })
      if (!result.ok) {
        setError(result.message ?? 'Could not add the candidate.')
        return
      }
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-5 gap-3">
        <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="bg-white" />
        <Input placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} required className="bg-white" />
        <Input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" />
        <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white" />
        <Input placeholder="Source (optional)" value={source} onChange={(e) => setSource(e.target.value)} className="bg-white" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>{pending ? 'Adding…' : 'Add candidate'}</Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  )
}
