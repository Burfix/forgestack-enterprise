import { EmployeeAvatar } from '@/features/employees/components/employee-avatar'
import type { CandidatePipelineRow, VacancyRow } from '@/types/recruitment'
import { STAGE_LABEL } from '@/types/recruitment'

interface Props {
  openVacancies: number
  candidatesInPipeline: number
  slaBreaches: number
  waitingManagerAction: number
  waitingMdSignature: number
  avgTimeToHireDays: number | null
  atRisk: CandidatePipelineRow[]
  vacancies: VacancyRow[]
}

export function RecruitmentOverview({
  openVacancies,
  candidatesInPipeline,
  slaBreaches,
  waitingManagerAction,
  waitingMdSignature,
  avgTimeToHireDays,
  atRisk,
}: Props) {
  const dateLabel = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-slate-900">Recruitment</h1>
        <p className="text-xs text-slate-400">As of {dateLabel}</p>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Open vacancies" metric={String(openVacancies)} metricColour="text-[#1A3A5C]" sub="Across all sites" />
        <KpiCard label="In pipeline" metric={String(candidatesInPipeline)} metricColour="text-[#1A3A5C]" sub="Active candidates" />
        <KpiCard
          label="SLA breaches"
          metric={String(slaBreaches)}
          metricColour={slaBreaches > 0 ? 'text-red-600' : 'text-slate-400'}
          sub="Overdue right now"
        />
        <KpiCard
          label="Waiting on manager"
          metric={String(waitingManagerAction)}
          metricColour={waitingManagerAction > 0 ? 'text-amber-500' : 'text-slate-400'}
          sub="Approval pending"
        />
        <KpiCard
          label="Waiting on MD"
          metric={String(waitingMdSignature)}
          metricColour={waitingMdSignature > 0 ? 'text-amber-500' : 'text-slate-400'}
          sub="Signature pending"
        />
        <KpiCard
          label="Avg. time to hire"
          metric={avgTimeToHireDays != null ? `${avgTimeToHireDays}d` : '—'}
          metricColour="text-[#1A3A5C]"
          sub="Vacancy to active"
        />
      </div>

      {/* Risk Intelligence Panel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-700">Needs attention</h2>
            {atRisk.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200">
                {atRisk.length}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">Sorted by severity</span>
        </div>

        {atRisk.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-700">Nothing breaching SLA right now</p>
            <p className="text-xs text-slate-400 mt-1">All active candidates are within their stage timers</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vacancy</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days in stage</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {atRisk.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar firstName={c.first_name} lastName={c.surname} />
                      <div>
                        <p className="font-medium text-slate-900">{c.first_name} {c.surname}</p>
                        <p className="text-xs text-slate-400">{c.vacancy.department?.name ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{c.vacancy.position_title}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {c.activeWorkflow ? STAGE_LABEL[c.activeWorkflow.stage] : '—'}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 tabular-nums">{c.daysInStage}</td>
                  <td className="px-3 py-3">
                    <RiskTag risk={c.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  metric,
  metricColour,
  sub,
}: {
  label: string
  metric: string
  metricColour: string
  sub: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">{label}</p>
      <p className={`text-3xl font-bold tabular-nums leading-none mb-1 ${metricColour}`}>{metric}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

function RiskTag({ risk }: { risk: 'green' | 'amber' | 'red' }) {
  const cls =
    risk === 'red'
      ? 'bg-red-50 text-red-600 ring-red-200'
      : risk === 'amber'
        ? 'bg-amber-50 text-amber-600 ring-amber-200'
        : 'bg-green-50 text-green-600 ring-green-200'
  const label = risk === 'red' ? 'Breached' : risk === 'amber' ? 'At risk' : 'On track'
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  )
}
