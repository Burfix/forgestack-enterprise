import Link from 'next/link'
import { EmployeeAvatar } from '@/features/employees/components/employee-avatar'
import { ReadinessPill } from '@/features/employees/components/readiness-pill'
import type { EnrichedEmployee, DeptStat, ReadinessTier } from '@/features/workforce/types'

interface Props {
  totalEmployees: number
  avgReadiness: number
  compliantCount: number
  atRiskCount: number
  redSealCount: number
  tiers: ReadinessTier[]
  departments: DeptStat[]
  atRiskEmployees: EnrichedEmployee[]
}

export function ReadinessDashboard({
  totalEmployees,
  avgReadiness,
  compliantCount,
  atRiskCount,
  redSealCount,
  tiers,
  departments,
  atRiskEmployees,
}: Props) {
  const dateLabel = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-slate-900">Workforce readiness</h1>
        <p className="text-xs text-slate-400">As of {dateLabel}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Org readiness"
          metric={`${avgReadiness}%`}
          metricColour={
            avgReadiness >= 80 ? 'text-green-600' :
            avgReadiness >= 60 ? 'text-amber-500' : 'text-red-500'
          }
          sub={`${totalEmployees} employees`}
          barValue={avgReadiness}
          barColour={
            avgReadiness >= 80 ? 'bg-green-400' :
            avgReadiness >= 60 ? 'bg-amber-400' : 'bg-red-400'
          }
        />
        <KpiCard
          label="Fully compliant"
          metric={String(compliantCount)}
          metricColour="text-green-600"
          sub={`${pct(compliantCount, totalEmployees)}% of workforce`}
          barValue={pct(compliantCount, totalEmployees)}
          barColour="bg-green-400"
        />
        <KpiCard
          label="Needs attention"
          metric={String(atRiskCount)}
          metricColour={atRiskCount > 0 ? 'text-red-600' : 'text-slate-400'}
          sub={`${pct(atRiskCount, totalEmployees)}% of workforce`}
          barValue={pct(atRiskCount, totalEmployees)}
          barColour="bg-red-400"
        />
        <KpiCard
          label="Red Seal holders"
          metric={String(redSealCount)}
          metricColour="text-[#1A3A5C]"
          sub="Fully qualified artisans"
          barValue={pct(redSealCount, totalEmployees)}
          barColour="bg-[#1A3A5C]"
        />
      </div>

      {/* Body */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Tier distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionHeading>Readiness tiers</SectionHeading>
            <div className="space-y-4">
              {tiers.map((tier) => (
                <div key={tier.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tier.colour}`} />
                      <span className="text-sm text-slate-700">{tier.label}</span>
                      <span className="text-xs text-slate-400">{tier.range}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 tabular-nums">
                      {tier.count}
                      <span className="text-slate-300 font-normal text-xs ml-0.5">/{totalEmployees}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tier.colour}`}
                      style={{ width: `${totalEmployees > 0 ? (tier.count / totalEmployees) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionHeading>By department</SectionHeading>
            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-700 truncate">{dept.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-slate-400">{dept.count}</span>
                      <span className={`text-xs font-semibold tabular-nums ${
                        dept.avg >= 80 ? 'text-green-600' :
                        dept.avg >= 60 ? 'text-amber-500' : 'text-red-500'
                      }`}>{dept.avg}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.avg >= 80 ? 'bg-green-400' :
                        dept.avg >= 60 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${dept.avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* At-risk employees (spans 2 cols) */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-700">Needs attention</h2>
              {atRiskEmployees.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200">
                  {atRiskEmployees.length}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">Sorted by readiness · lowest first</span>
          </div>

          {atRiskEmployees.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-slate-700">All employees are compliant</p>
              <p className="text-xs text-slate-400 mt-1">Readiness ≥ 80% across the board</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Issues
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {atRiskEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/hr/employees/${emp.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <EmployeeAvatar
                          firstName={emp.first_name}
                          lastName={emp.last_name}
                          photoUrl={emp.photo_url}
                        />
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-[#1A3A5C] transition-colors">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-xs text-slate-400">{emp.role?.title ?? '—'}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {emp.department?.name ?? '—'}
                    </td>
                    <td className="px-3 py-3">
                      <ReadinessPill score={emp.readiness.total} />
                    </td>
                    <td className="px-3 py-3">
                      <IssueTags
                        expired={emp.expiredCount}
                        expiring={emp.expiringSoonCount}
                        mandatoryIssues={emp.mandatoryIssueCount}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
      {children}
    </h2>
  )
}

function KpiCard({
  label,
  metric,
  metricColour,
  sub,
  barValue,
  barColour,
}: {
  label: string
  metric: string
  metricColour: string
  sub: string
  barValue: number
  barColour: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">{label}</p>
      <p className={`text-3xl font-bold tabular-nums leading-none mb-1 ${metricColour}`}>{metric}</p>
      <p className="text-xs text-slate-400 mb-4">{sub}</p>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColour}`}
          style={{ width: `${Math.min(barValue, 100)}%` }}
        />
      </div>
    </div>
  )
}

function IssueTags({
  expired,
  expiring,
  mandatoryIssues,
}: {
  expired: number
  expiring: number
  mandatoryIssues: number
}) {
  if (expired === 0 && expiring === 0 && mandatoryIssues === 0) {
    return <span className="text-xs text-slate-400">No valid quals</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {expired > 0 && (
        <IssueTag colour="red">
          {expired} expired
        </IssueTag>
      )}
      {expiring > 0 && (
        <IssueTag colour="amber">
          {expiring} expiring
        </IssueTag>
      )}
      {mandatoryIssues > 0 && (
        <IssueTag colour="slate">
          {mandatoryIssues} mandatory
        </IssueTag>
      )}
    </div>
  )
}

function IssueTag({
  colour,
  children,
}: {
  colour: 'red' | 'amber' | 'slate'
  children: React.ReactNode
}) {
  const cls =
    colour === 'red'   ? 'bg-red-50   text-red-600   ring-red-200'   :
    colour === 'amber' ? 'bg-amber-50 text-amber-600 ring-amber-200' :
                         'bg-slate-100 text-slate-500 ring-slate-200'
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls}`}>
      {children}
    </span>
  )
}
