import Link from 'next/link'
import {
  ChevronLeft, Mail, Phone, Calendar,
  Building2, MapPin, User, CreditCard, Briefcase,
} from 'lucide-react'
import { format } from 'date-fns'
import { EmployeeAvatar } from './employee-avatar'
import { StatusBadge } from './status-badge'
import type {
  EmployeeRow, ReadinessScore, CategoryIconStatus,
  EmploymentType, QualificationStatus,
} from '@/types/hr'

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  permanent:  'Permanent',
  contract:   'Contract',
  casual:     'Casual',
  probation:  'Probation',
}

const QUAL_STATUS_CONFIG: Record<QualificationStatus, { label: string; className: string }> = {
  completed:   { label: 'Valid',        className: 'bg-green-100 text-green-700 ring-green-200'  },
  in_progress: { label: 'In progress',  className: 'bg-blue-100  text-blue-700  ring-blue-200'   },
  not_started: { label: 'Not started',  className: 'bg-slate-100 text-slate-500 ring-slate-200'  },
  expired:     { label: 'Expired',      className: 'bg-red-100   text-red-700   ring-red-200'    },
  suspended:   { label: 'Suspended',    className: 'bg-amber-100 text-amber-700 ring-amber-200'  },
}

const CATEGORY_COLOURS: Record<string, string> = {
  trade:      'bg-indigo-100 text-indigo-700',
  safety:     'bg-red-100    text-red-700',
  compliance: 'bg-purple-100 text-purple-700',
  health:     'bg-pink-100   text-pink-700',
  technical:  'bg-cyan-100   text-cyan-700',
  regulatory: 'bg-orange-100 text-orange-700',
  internal:   'bg-slate-100  text-slate-600',
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

function fmt(d: string | null): string {
  if (!d) return '—'
  return format(new Date(d + 'T00:00:00'), 'd MMM yyyy')
}

interface Props {
  employee: EmployeeRow
  readiness: ReadinessScore
  categoryStatuses: CategoryIconStatus[]
}

export function EmployeeProfile({ employee: emp, readiness }: Props) {
  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 px-8 pt-5 pb-6">
        <Link
          href="/hr/employees"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Employee directory
        </Link>

        <div className="flex items-start justify-between gap-8">
          {/* Identity */}
          <div className="flex items-start gap-5">
            <EmployeeAvatar
              firstName={emp.first_name}
              lastName={emp.last_name}
              photoUrl={emp.photo_url}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
                {emp.first_name} {emp.last_name}
              </h1>
              {emp.role && (
                <p className="text-slate-500 mt-0.5 text-base">{emp.role.title}</p>
              )}
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2.5">
                <span className="font-mono text-xs text-slate-400">{emp.employee_number}</span>
                <Dot />
                <StatusBadge status={emp.employment_status} />
                <Dot />
                <span className="text-xs text-slate-500">
                  {EMPLOYMENT_TYPE_LABELS[emp.employment_type]}
                </span>
                {emp.start_date && (
                  <>
                    <Dot />
                    <span className="text-xs text-slate-500">Since {fmt(emp.start_date)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Readiness panel */}
          <div className="flex-shrink-0 text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Workforce readiness
            </p>
            <div className={`text-4xl font-bold tabular-nums leading-none ${
              readiness.total >= 80 ? 'text-green-600' :
              readiness.total >= 60 ? 'text-amber-500' : 'text-red-500'
            }`}>
              {readiness.total}%
            </div>
            <div className="mt-3 space-y-1.5">
              <ReadinessLine label="Valid qualifications" score={readiness.validQuals}   max={40} />
              <ReadinessLine label="No expired quals"     score={readiness.noExpired}    max={20} />
              <ReadinessLine label="Medical clearance"    score={readiness.medicalValid} max={20} />
              <ReadinessLine label="No active warnings"   score={readiness.noWarnings}   max={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex gap-10 px-8 py-7">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 space-y-7">
          <section>
            <SectionHeading>Employment</SectionHeading>
            <dl className="space-y-3">
              <InfoRow icon={Building2}  label="Department"  value={emp.department?.name} />
              <InfoRow icon={MapPin}     label="Site"        value={emp.site?.name} />
              <InfoRow icon={User}       label="Manager"
                value={emp.manager ? `${emp.manager.first_name} ${emp.manager.last_name}` : null}
              />
              <InfoRow icon={Calendar}   label="Start date"  value={fmt(emp.start_date)} />
              <InfoRow icon={Briefcase}  label="Type"        value={EMPLOYMENT_TYPE_LABELS[emp.employment_type]} />
            </dl>
          </section>

          <section>
            <SectionHeading>Contact</SectionHeading>
            <dl className="space-y-3">
              <InfoRow icon={Mail}       label="Email"      value={emp.email} />
              <InfoRow icon={Phone}      label="Phone"      value={emp.phone} />
              <InfoRow icon={CreditCard} label="ID number"  value={emp.id_number} />
            </dl>
          </section>
        </aside>

        {/* Qualifications */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <SectionHeading>Qualifications</SectionHeading>
            <span className="text-xs text-slate-400 font-normal">
              {emp.qualifications.length} records
            </span>
          </div>

          {emp.qualifications.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No qualification records on file.</p>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Qualification
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Issued
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {emp.qualifications.map((q) => {
                    const qt = q.qualification_type
                    const now = Date.now()
                    const expiryMs = q.expiry_date ? new Date(q.expiry_date + 'T00:00:00').getTime() : null
                    const isExpired    = expiryMs !== null && expiryMs <= now
                    const isCritical   = expiryMs !== null && !isExpired && (expiryMs - now) <= THIRTY_DAYS_MS
                    const isExpiring   = expiryMs !== null && !isExpired && (expiryMs - now) <= NINETY_DAYS_MS
                    const statusConfig = QUAL_STATUS_CONFIG[q.status]
                    const catColour    = qt?.category ? (CATEGORY_COLOURS[qt.category] ?? '') : ''

                    return (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-900">{qt?.name ?? '—'}</span>
                          {qt?.is_mandatory && (
                            <span className="ml-2 inline-flex items-center rounded text-[10px] font-semibold px-1.5 py-0.5 bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-200">
                              Required
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {qt?.category ? (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${catColour}`}>
                              {qt.category.charAt(0).toUpperCase() + qt.category.slice(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                          {fmt(q.issue_date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {q.expiry_date ? (
                            <span className={
                              isExpired  ? 'text-red-600 font-semibold' :
                              isCritical ? 'text-red-500 font-medium'   :
                              isExpiring ? 'text-amber-600 font-medium'  :
                                           'text-slate-600'
                            }>
                              {fmt(q.expiry_date)}
                            </span>
                          ) : (
                            <span className="text-slate-400">No expiry</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
      {children}
    </h2>
  )
}

function Dot() {
  return <span className="text-slate-300">·</span>
}

function ReadinessLine({ label, score, max }: { label: string; score: number; max: number }) {
  return (
    <div className="flex items-center gap-3 text-xs justify-end">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold tabular-nums w-10 text-right ${
        score === max ? 'text-green-600' : 'text-red-500'
      }`}>
        {score}/{max}
      </span>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <dt className="text-[11px] text-slate-400 leading-none mb-0.5">{label}</dt>
        <dd className="text-sm text-slate-700 break-words">{value ?? '—'}</dd>
      </div>
    </div>
  )
}
