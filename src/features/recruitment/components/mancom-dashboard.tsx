'use client'

// ManCom / Executive Recruitment Dashboard — read-only, metrics only, no
// candidate names anywhere on this page by design.
//
// All figures below are mock data hardcoded to match "HR Infrastructure.xlsx"
// (Recruitment tab, filter snapshot: Year 2026 / Month July / Department "All
// Dapartments" / Region WC) exactly, with three interpretive decisions
// confirmed with Thami before building:
//   1. "Vacancy by Position" fill rate = Filled ÷ (Filled + Vacant), i.e. the
//      normal fill-rate definition — NOT the spreadsheet's raw "Delta"
//      column, which is actually Vacant ÷ Filled (the opposite direction;
//      using it directly would have colored HVAC Technician red instead of
//      green).
//   2. Recruitment Source "Other" = 0%, since SimplifyHR + Agency + Internal
//      Referral + External Referral already sum to exactly 100% — the
//      sheet's "Other" cell (1.00) reads as a checksum total, not a fifth
//      slice.
//   3. Interview funnel: the sheet only has one real number (HVAC Assistant,
//      CV Received = 400). Every other stage/position is genuinely blank in
//      the source — shown here as an explicit "No data yet" rather than an
//      invented drop-off curve.
//
// The Year/Month/Department/Region dropdown values come from Sheet5 in the
// same workbook. Changing them does not yet refetch different numbers —
// there is only one data snapshot this session — so a small note under the
// filter bar says so rather than implying live filtering that isn't real.

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DEPARTMENTS = [
  'All Dapartments', 'Administration', 'Finance', 'Health and Safety', 'Helpdesk',
  'Human Resources', 'Logistics and Fleet', 'Management', 'Operations', 'Projects',
  'Quality Assurance',
]
const REGIONS = ['WC', 'GP', 'KZN']

const METRICS: { label: string; value: string; sub: string; colour?: string }[] = [
  { label: 'Planned headcount', value: '48', sub: 'Budgeted roles, all positions' },
  { label: 'Hired', value: '12', sub: 'Filled year to date' },
  { label: 'Position delta', value: '-36', sub: 'Hired vs. planned', colour: 'text-red-600' },
  { label: 'Unplanned hires', value: '5', sub: 'Outside the headcount plan' },
  { label: 'Replacement hires', value: '5', sub: 'Backfilling departures' },
  { label: 'New hires', value: '12', sub: 'Net-new positions' },
  { label: 'Avg. hiring rate', value: '5d', sub: 'Days, offer to acceptance' },
  { label: 'Critical vacancies', value: '2', sub: 'Open more than 30 days', colour: 'text-red-600' },
]

const POSITIONS = [
  { title: 'HVAC Assistant', filled: 5, vacant: 3 },
  { title: 'HVAC Operator', filled: 5, vacant: 3 },
  { title: 'HVAC Technician', filled: 12, vacant: 2 },
  { title: 'HVAC Supervisor', filled: 3, vacant: 1 },
]

const PORTFOLIO = [
  { code: 'WCED', count: 1 },
  { code: 'WCC', count: 2 },
  { code: 'WCA', count: 1 },
  { code: 'KZP', count: 5 },
]

const SOURCES: { label: string; pct: number; colour: string }[] = [
  { label: 'SimplifyHR', pct: 72, colour: '#1A3A5C' },
  { label: 'Recruitment Agency', pct: 4, colour: '#F59E0B' },
  { label: 'Internal Referral', pct: 13, colour: '#22C55E' },
  { label: 'External Referral', pct: 11, colour: '#8B5CF6' },
  { label: 'Other', pct: 0, colour: '#CBD5E1' },
]

const CRITICAL_VACANCIES = [
  { role: 'HVAC Operator', days: 300 },
  { role: 'Commissioning Technician', days: 40 },
]

const INTERVIEWED = [
  { name: 'David van Vuuren', count: 3 },
  { name: 'Clinton Louw', count: 4 },
]

const SCHEDULED = [
  { name: 'David van Vuuren', count: 2 },
  { name: 'Clinton Louw', count: 1 },
]

const FUNNEL_STAGES = ['CV Received', 'Longlisted', 'Shortlisted', 'Appointed'] as const

const FUNNEL_ROWS: { position: string; values: (number | null)[] }[] = [
  { position: 'HVAC Assistant', values: [400, null, null, null] },
]

function fillRatePct(filled: number, vacant: number) {
  return (filled / (filled + vacant)) * 100
}

function fillRateColour(pct: number) {
  if (pct > 80) return 'bg-green-50 text-green-700 ring-green-200'
  if (pct >= 50) return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-red-50 text-red-600 ring-red-200'
}

interface Props {
  showInterviewFunnel: boolean
}

export function ManComRecruitmentDashboard({ showInterviewFunnel }: Props) {
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('July')
  const [department, setDepartment] = useState('All Dapartments')
  const [region, setRegion] = useState('WC')

  const dateLabel = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const totalFilled = POSITIONS.reduce((sum, p) => sum + p.filled, 0)
  const totalVacant = POSITIONS.reduce((sum, p) => sum + p.vacant, 0)
  const totalPortfolio = PORTFOLIO.reduce((sum, p) => sum + p.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Recruitment Dashboard</h1>
          <p className="text-xs text-slate-400">ManCom / Executive view — read only, metrics only</p>
        </div>
        <p className="text-xs text-slate-400">As of {dateLabel}</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="Year" value={year} onChange={setYear} options={YEARS.map(String)} />
          <FilterSelect label="Month" value={month} onChange={setMonth} options={MONTHS} />
          <FilterSelect label="Department" value={department} onChange={setDepartment} options={DEPARTMENTS} />
          <FilterSelect label="Region" value={region} onChange={setRegion} options={REGIONS} />
        </div>
        <p className="text-[11px] text-slate-400 mt-3">
          Filters are shown for layout — this dashboard runs on a single mock data snapshot this
          release and does not yet refetch on selection.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">{m.label}</p>
            <p className={`text-3xl font-bold tabular-nums leading-none mb-1 ${m.colour ?? 'text-[#1A3A5C]'}`}>
              {m.value}
            </p>
            <p className="text-xs text-slate-400">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Vacancy by position */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Vacancy by position</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Filled</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Vacant</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Fill rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {POSITIONS.map((p) => {
              const pct = fillRatePct(p.filled, p.vacant)
              return (
                <tr key={p.title}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.title}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">{p.filled}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">{p.vacant}</td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${fillRateColour(pct)}`}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )
            })}
            <tr className="bg-slate-50 font-semibold">
              <td className="px-5 py-3 text-slate-900">Total</td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-700">{totalFilled}</td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-700">{totalVacant}</td>
              <td className="px-3 py-3 text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${fillRateColour(fillRatePct(totalFilled, totalVacant))}`}
                >
                  {fillRatePct(totalFilled, totalVacant).toFixed(1)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Portfolio + Source + Critical vacancies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Vacancy by portfolio</h2>
          <div className="space-y-2">
            {PORTFOLIO.map((p) => (
              <div key={p.code} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{p.code}</span>
                <span className="font-medium tabular-nums text-slate-900">{p.count}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 font-semibold">
              <span className="text-slate-700">Total</span>
              <span className="tabular-nums text-slate-900">{totalPortfolio}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Recruitment source</h2>
          <div className="flex items-center gap-4">
            <DonutChart data={SOURCES} />
            <div className="flex-1 space-y-1.5">
              {SOURCES.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.colour }} />
                    {s.label}
                  </span>
                  <span className="font-medium tabular-nums text-slate-900">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical vacancies</h2>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200">
              {CRITICAL_VACANCIES.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Open more than 30 days, sorted by longest-open first</p>
          <div className="space-y-2">
            {CRITICAL_VACANCIES.map((v) => (
              <div
                key={v.role}
                className="flex items-center justify-between rounded-lg bg-red-50 ring-1 ring-inset ring-red-200 px-3 py-2"
              >
                <span className="text-sm font-medium text-red-800">{v.role}</span>
                <span className="text-xs font-semibold text-red-600 tabular-nums">{v.days}d open</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interview activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Interviews conducted</h2>
          <div className="space-y-2">
            {INTERVIEWED.map((i) => (
              <div key={i.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{i.name}</span>
                <span className="font-medium tabular-nums text-slate-900">{i.count}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 font-semibold">
              <span className="text-slate-700">Total interviewed</span>
              <span className="tabular-nums text-slate-900">
                {INTERVIEWED.reduce((sum, i) => sum + i.count, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Interviews scheduled</h2>
          <div className="space-y-2">
            {SCHEDULED.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{s.name}</span>
                <span className="font-medium tabular-nums text-slate-900">{s.count}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 font-semibold">
              <span className="text-slate-700">Total scheduled</span>
              <span className="tabular-nums text-slate-900">
                {SCHEDULED.reduce((sum, s) => sum + s.count, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interview funnel — ManCom only, per the source sheet's own "(MANCOM
          VIEW ONLY)" label. Executive-only users never see this section,
          even though they can see the rest of this dashboard. */}
      {showInterviewFunnel && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Interview funnel</h2>
            <span className="text-xs text-slate-400">ManCom view only</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                {FUNNEL_STAGES.map((stage) => (
                  <th key={stage} className="px-3 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FUNNEL_ROWS.map((row) => (
                <tr key={row.position}>
                  <td className="px-5 py-3 font-medium text-slate-900">{row.position}</td>
                  {row.values.map((v, i) => (
                    <td key={FUNNEL_STAGES[i]} className="px-3 py-3 text-right tabular-nums">
                      {v == null ? (
                        <span className="text-xs text-slate-400 italic">No data yet</span>
                      ) : (
                        <span className="text-slate-700">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-2.5 text-[11px] text-slate-400 border-t border-slate-100">
            Only CV Received is on record for HVAC Assistant. Longlisted, Shortlisted, and Appointed
            counts — and every other position — are not yet tracked in the source data.
          </p>
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[170px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Small hand-rolled SVG donut — no charting library needed for one chart. */
function DonutChart({ data }: { data: { label: string; pct: number; colour: string }[] }) {
  const radius = 40
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  // Precompute each slice's dash length and running start-offset purely
  // (no mutation during render) before mapping to SVG circles.
  const slices = data
    .filter((d) => d.pct > 0)
    .reduce<{ label: string; colour: string; dash: number; offset: number }[]>((acc, d) => {
      const dash = (d.pct / 100) * circumference
      const priorOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0
      acc.push({ label: d.label, colour: d.colour, dash, offset: priorOffset })
      return acc
    }, [])

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <g transform="translate(48, 48) rotate(-90)">
        <circle cx="0" cy="0" r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
        {slices.map((s) => (
          <circle
            key={s.label}
            cx="0"
            cy="0"
            r={radius}
            fill="none"
            stroke={s.colour}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </g>
    </svg>
  )
}
