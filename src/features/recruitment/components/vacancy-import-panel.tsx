'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  uploadVacancyImportFile,
  resolveImportRow,
  commitImportRow,
  commitAllMatchedRows,
  discardImportBatch,
} from '@/features/recruitment/import-actions'
import type { ImportBatch, ImportRow } from '@/lib/db/vacancy-import'
import type {
  SiteOption,
  DepartmentOption,
  HiringManagerOption,
  ContractTypeOption,
  HireTypeOption,
} from '@/lib/db/reference-data'

interface Props {
  batches: ImportBatch[]
  rowsByBatch: Record<string, ImportRow[]>
  sites: SiteOption[]
  departments: DepartmentOption[]
  hiringManagers: HiringManagerOption[]
  contractTypes: ContractTypeOption[]
  hireTypes: HireTypeOption[]
}

const STATUS_STYLE: Record<ImportRow['status'], string> = {
  matched: 'bg-green-50 text-green-700 ring-green-200',
  needs_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  rejected: 'bg-slate-100 text-slate-500 ring-slate-200',
  committed: 'bg-blue-50 text-blue-700 ring-blue-200',
}

export function VacancyImportPanel({ batches, rowsByBatch, sites, departments, hiringManagers, contractTypes, hireTypes }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleUpload(formData: FormData) {
    setError(null)
    setNotice(null)
    startTransition(async () => {
      const result = await uploadVacancyImportFile(formData)
      if (!result.ok) {
        setError(result.message ?? 'Upload failed.')
      } else {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Import historical vacancies</h2>
        <p className="text-sm text-slate-500 mb-4">
          Upload a spreadsheet of legacy vacancies. Every row is matched against the live Department, Portfolio,
          Region, Hire Type, Contract Type, and Hiring Manager lists — nothing is written to the platform until you
          review and confirm it below. This is a one-time migration path, not a recurring sync: all new vacancies
          should be created from the Recruitment screen.
        </p>
        <form action={handleUpload} className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept=".xlsx,.xls"
            required
            className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? 'Uploading…' : 'Upload & validate'}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {notice && <p className="mt-3 text-sm text-green-700">{notice}</p>}
      </div>

      {batches.map((batch) => (
        <BatchReview
          key={batch.id}
          batch={batch}
          rows={rowsByBatch[batch.id] ?? []}
          sites={sites}
          departments={departments}
          hiringManagers={hiringManagers}
          contractTypes={contractTypes}
          hireTypes={hireTypes}
          onNotice={setNotice}
          onError={setError}
        />
      ))}
    </div>
  )
}

function BatchReview({
  batch,
  rows,
  sites,
  departments,
  hiringManagers,
  contractTypes,
  hireTypes,
  onNotice,
  onError,
}: {
  batch: ImportBatch
  rows: ImportRow[]
  sites: SiteOption[]
  departments: DepartmentOption[]
  hiringManagers: HiringManagerOption[]
  contractTypes: ContractTypeOption[]
  hireTypes: HireTypeOption[]
  onNotice: (msg: string | null) => void
  onError: (msg: string | null) => void
}) {
  const [isPending, startTransition] = useTransition()
  const matchedCount = rows.filter((r) => r.status === 'matched').length
  const needsReviewCount = rows.filter((r) => r.status === 'needs_review').length
  const committedCount = rows.filter((r) => r.status === 'committed').length

  function handleCommitAll() {
    onError(null)
    onNotice(null)
    startTransition(async () => {
      const result = await commitAllMatchedRows(batch.id)
      if (!result.ok) onError(result.message ?? 'Commit failed.')
      else onNotice(result.message ?? 'Committed.')
    })
  }

  function handleDiscard() {
    onError(null)
    startTransition(async () => {
      const result = await discardImportBatch(batch.id)
      if (!result.ok) onError(result.message ?? 'Could not discard batch.')
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">{batch.filename}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {batch.row_count} rows · {matchedCount} ready · {needsReviewCount} need review · {committedCount} committed
            {batch.status === 'discarded' && ' · discarded'}
            {batch.status === 'committed' && ' · fully committed'}
          </p>
        </div>
        {batch.status === 'pending_review' && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDiscard} disabled={isPending}>
              Discard batch
            </Button>
            <Button size="sm" onClick={handleCommitAll} disabled={isPending || matchedCount === 0}>
              Commit {matchedCount} matched row{matchedCount === 1 ? '' : 's'}
            </Button>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <ImportRowCard
            key={row.id}
            row={row}
            sites={sites}
            departments={departments}
            hiringManagers={hiringManagers}
            contractTypes={contractTypes}
            hireTypes={hireTypes}
            onNotice={onNotice}
            onError={onError}
          />
        ))}
      </div>
    </div>
  )
}

function ImportRowCard({
  row,
  sites,
  departments,
  hiringManagers,
  contractTypes,
  hireTypes,
  onNotice,
  onError,
}: {
  row: ImportRow
  sites: SiteOption[]
  departments: DepartmentOption[]
  hiringManagers: HiringManagerOption[]
  contractTypes: ContractTypeOption[]
  hireTypes: HireTypeOption[]
  onNotice: (msg: string | null) => void
  onError: (msg: string | null) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(row.status === 'needs_review')
  const [positionTitle, setPositionTitle] = useState(row.position_title ?? '')
  const [departmentId, setDepartmentId] = useState(row.department_id ?? '')
  const [siteId, setSiteId] = useState(row.site_id ?? '')
  const [hireTypeId, setHireTypeId] = useState(row.hire_type_id ?? '')
  const [contractTypeId, setContractTypeId] = useState(row.contract_type_id ?? '')
  const [hiringManagerId, setHiringManagerId] = useState(row.hiring_manager_id ?? '')

  function handleResolve() {
    onError(null)
    startTransition(async () => {
      const result = await resolveImportRow({
        rowId: row.id,
        positionTitle,
        departmentId: departmentId || null,
        siteId: siteId || null,
        hireTypeId: hireTypeId || null,
        contractTypeId: contractTypeId || null,
        hiringManagerId: hiringManagerId || null,
        priority: row.priority,
      })
      if (!result.ok) onError(result.message ?? 'Could not resolve row.')
      else setEditing(false)
    })
  }

  function handleCommitOne() {
    onError(null)
    onNotice(null)
    startTransition(async () => {
      const result = await commitImportRow(row.id)
      if (!result.ok) onError(result.message ?? 'Commit failed.')
      else onNotice(`Vacancy created for row ${row.row_number}.`)
    })
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[row.status]}`}>
            {row.status.replace('_', ' ')}
          </span>
          <span className="ml-2 text-sm font-medium text-slate-700">{row.position_title || '(no title)'}</span>
          <span className="ml-2 text-xs text-slate-400">row {row.row_number}</span>
        </div>
        <div className="flex items-center gap-2">
          {row.status === 'matched' && (
            <Button size="sm" onClick={handleCommitOne} disabled={isPending}>
              Commit
            </Button>
          )}
          {row.status !== 'committed' && (
            <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Hide' : 'Review'}
            </Button>
          )}
        </div>
      </div>

      {row.issues.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {row.issues.map((issue, i) => (
            <li key={i} className="text-xs text-amber-700">
              {issue}
            </li>
          ))}
        </ul>
      )}

      {editing && row.status !== 'committed' && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 bg-slate-50 rounded-lg p-3">
          <Input
            placeholder="Position title"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            className="bg-white"
          />
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger className="w-full bg-white"><SelectValue placeholder={`Department (was "${row.raw_data['department'] ?? ''}")`} /></SelectTrigger>
            <SelectContent>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={siteId} onValueChange={setSiteId}>
            <SelectTrigger className="w-full bg-white"><SelectValue placeholder={`Portfolio (was "${row.raw_data['portfolio'] ?? ''}")`} /></SelectTrigger>
            <SelectContent>
              {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={hireTypeId} onValueChange={setHireTypeId}>
            <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Hire type" /></SelectTrigger>
            <SelectContent>
              {hireTypes.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={contractTypeId} onValueChange={setContractTypeId}>
            <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Contract type" /></SelectTrigger>
            <SelectContent>
              {contractTypes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={hiringManagerId} onValueChange={setHiringManagerId}>
            <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Hiring manager" /></SelectTrigger>
            <SelectContent>
              {hiringManagers.map((m) => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="col-span-2 md:col-span-3">
            <Button size="sm" onClick={handleResolve} disabled={isPending}>
              Save as ready to commit
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
