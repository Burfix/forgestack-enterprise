'use client'

// Candidate List View — the scan/filter/export companion to the Kanban
// Pipeline Board. Built on the same summary-tiles + filters + status-pill
// table pattern used by banking ops queues (e.g. a payments-processing
// screen), tailored to recruitment: every candidate ever created, filterable
// by site/status/search, with the same risk semantics the Kanban board and
// the Needs Attention panel already use — this view must never disagree
// with them about what "at risk" means for a given candidate.

import { Fragment, useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { CandidateStageDetail } from '@/features/recruitment/components/candidate-stage-detail'
import type { CandidatePipelineRow, RecruitmentStage } from '@/types/recruitment'
import { STAGE_LABEL } from '@/types/recruitment'
import type { HiringManagerOption, SiteOption } from '@/lib/db/reference-data'

interface Props {
  candidates: CandidatePipelineRow[]
  sites: SiteOption[]
  hiringManagers: HiringManagerOption[]
}

type TileFilter = 'all' | 'at_risk' | 'awaiting_action' | 'in_progress' | 'completed' | 'exited'

function classify(c: CandidatePipelineRow): Exclude<TileFilter, 'all'> {
  if (c.status === 'employee_active') return 'completed'
  if (c.status === 'withdrawn' || c.status === 'rejected') return 'exited'
  if (c.risk === 'red') return 'at_risk'
  if (c.risk === 'amber') return 'awaiting_action'
  return 'in_progress'
}

const TILE_CONFIG: { key: TileFilter; label: string; sub: string }[] = [
  { key: 'all', label: 'All candidates', sub: 'Every candidate on record' },
  { key: 'at_risk', label: 'At risk', sub: 'SLA breached' },
  { key: 'awaiting_action', label: 'Awaiting action', sub: 'Warning threshold passed' },
  { key: 'in_progress', label: 'In progress', sub: 'Within SLA' },
  { key: 'completed', label: 'Completed', sub: 'Now active employees' },
  { key: 'exited', label: 'Withdrawn / rejected', sub: 'Left the pipeline' },
]

const STATUS_PILL: Record<Exclude<TileFilter, 'all'>, string> = {
  at_risk: 'bg-red-50 text-red-700 ring-red-200',
  awaiting_action: 'bg-amber-50 text-amber-700 ring-amber-200',
  in_progress: 'bg-green-50 text-green-700 ring-green-200',
  completed: 'bg-slate-100 text-slate-600 ring-slate-200',
  exited: 'bg-slate-50 text-slate-400 ring-slate-200',
}

const STATUS_TEXT: Record<Exclude<TileFilter, 'all'>, string> = {
  at_risk: 'At risk',
  awaiting_action: 'Awaiting action',
  in_progress: 'On track',
  completed: 'Active employee',
  exited: 'Exited',
}

function subStatus(c: CandidatePipelineRow, bucket: Exclude<TileFilter, 'all'>): string {
  if (bucket === 'completed') return 'Moved to Employee Module'
  if (bucket === 'exited') return c.status === 'withdrawn' ? 'Candidate withdrew' : 'Not proceeding'
  if (!c.activeWorkflow) return '—'
  const stage = STAGE_LABEL[c.activeWorkflow.stage as RecruitmentStage]
  if (bucket === 'at_risk') return `${stage} — overdue ${c.daysInStage}d`
  if (bucket === 'awaiting_action') return `${stage} — ${c.daysInStage}d in stage, approaching SLA`
  return `${stage} — day ${c.daysInStage}`
}

export function CandidateListView({ candidates, sites, hiringManagers }: Props) {
  const [tile, setTile] = useState<TileFilter>('all')
  const [siteId, setSiteId] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<TileFilter, number> = {
      all: candidates.length,
      at_risk: 0,
      awaiting_action: 0,
      in_progress: 0,
      completed: 0,
      exited: 0,
    }
    for (const cand of candidates) c[classify(cand)] += 1
    return c
  }, [candidates])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return candidates.filter((c) => {
      if (tile !== 'all' && classify(c) !== tile) return false
      if (siteId !== 'all' && c.vacancy.site?.id !== siteId) return false
      if (q) {
        const haystack = `${c.first_name} ${c.surname} ${c.vacancy.position_title}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [candidates, tile, siteId, search])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate list</h2>
        <p className="text-xs text-slate-400">Filter, scan, and drill into any candidate</p>
      </div>

      {/* Summary tiles — click to filter the table below */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {TILE_CONFIG.map((t) => {
          const active = tile === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTile(t.key)}
              className={`text-left rounded-lg border p-3 transition-colors ${
                active ? 'border-[#1A3A5C] bg-slate-50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <p className="text-lg font-semibold tabular-nums text-slate-900">{counts[t.key]}</p>
              <p className="text-xs font-medium text-slate-600">{t.label}</p>
              <p className="text-[10px] text-slate-400">{t.sub}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select value={siteId} onValueChange={setSiteId}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="All sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sites</SelectItem>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search candidate or position…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[240px] h-8 text-xs"
        />
        {(siteId !== 'all' || search || tile !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSiteId('all')
              setSearch('')
              setTile('all')
            }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Reset filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">
          Showing {filtered.length} of {candidates.length}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-medium text-slate-700">No candidates match these filters</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the site, search, or status filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Site</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sub status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const bucket = classify(c)
                const expanded = expandedId === c.id
                return (
                  <Fragment key={c.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                        {c.first_name} {c.surname}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{c.vacancy.position_title}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{c.vacancy.site?.name ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_PILL[bucket]}`}
                        >
                          {STATUS_TEXT[bucket]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{subStatus(c, bucket)}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                        {c.activeWorkflow?.owner
                          ? `${c.activeWorkflow.owner.first_name} ${c.activeWorkflow.owner.last_name}`
                          : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : c.id)}
                          className="text-xs text-[#1A3A5C] hover:underline"
                        >
                          {expanded ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expanded && c.activeWorkflow && (
                      <tr>
                        <td colSpan={7} className="px-3 pb-3 bg-slate-50">
                          <CandidateStageDetail
                            candidateId={c.id}
                            stage={c.activeWorkflow.stage}
                            hiringManagers={hiringManagers}
                            onRequiredFieldsChange={() => {}}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
