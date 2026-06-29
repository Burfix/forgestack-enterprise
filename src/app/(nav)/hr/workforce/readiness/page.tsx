export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getOrganisationId } from '@/lib/session'
import { getEmployees, computeReadiness } from '@/lib/db/employees'
import { ReadinessDashboard } from '@/features/workforce/components/readiness-dashboard'
import type { EnrichedEmployee, DeptStat, ReadinessTier } from '@/features/workforce/types'

async function DashboardData() {
  const orgId = await getOrganisationId()
  const employees = await getEmployees(orgId)

  const now = Date.now()
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000

  const enriched: EnrichedEmployee[] = employees.map((emp) => {
    const readiness = computeReadiness(emp)

    const expiredCount = emp.qualifications.filter(
      (q) =>
        q.status === 'expired' ||
        (q.status === 'completed' &&
          q.expiry_date &&
          new Date(q.expiry_date + 'T00:00:00').getTime() <= now),
    ).length

    const expiringSoonCount = emp.qualifications.filter((q) => {
      if (q.status !== 'completed' || !q.expiry_date) return false
      const ms = new Date(q.expiry_date + 'T00:00:00').getTime() - now
      return ms > 0 && ms <= NINETY_DAYS
    }).length

    const mandatoryIssueCount = emp.qualifications.filter((q) => {
      if (!q.qualification_type?.is_mandatory) return false
      if (q.status === 'not_started' || q.status === 'suspended' || q.status === 'expired') return true
      if (q.status === 'completed' && q.expiry_date)
        return new Date(q.expiry_date + 'T00:00:00').getTime() <= now
      return false
    }).length

    return { ...emp, readiness, expiredCount, expiringSoonCount, mandatoryIssueCount }
  })

  const total = enriched.length
  const avgReadiness = total > 0 ? Math.round(enriched.reduce((s, e) => s + e.readiness.total, 0) / total) : 0
  const compliantCount = enriched.filter((e) => e.readiness.total >= 80).length
  const atRiskCount = enriched.filter((e) => e.readiness.total < 80).length
  const redSealCount = enriched.filter(
    (e) =>
      e.role?.level === 'red_seal' ||
      e.qualifications.some(
        (q) => q.qualification_type?.name === 'Red Seal Certificate' && q.status === 'completed',
      ),
  ).length

  const tiers: ReadinessTier[] = [
    { label: 'Excellent', range: '100%',   colour: 'bg-green-500', count: enriched.filter((e) => e.readiness.total === 100).length },
    { label: 'Good',      range: '80–99%', colour: 'bg-green-400', count: enriched.filter((e) => e.readiness.total >= 80 && e.readiness.total < 100).length },
    { label: 'Caution',   range: '60–79%', colour: 'bg-amber-400', count: enriched.filter((e) => e.readiness.total >= 60 && e.readiness.total < 80).length },
    { label: 'At risk',   range: '<60%',   colour: 'bg-red-500',   count: enriched.filter((e) => e.readiness.total < 60).length },
  ]

  const deptMap = new Map<string, { name: string; scores: number[] }>()
  for (const emp of enriched) {
    if (!emp.department) continue
    const d = deptMap.get(emp.department.id) ?? { name: emp.department.name, scores: [] }
    d.scores.push(emp.readiness.total)
    deptMap.set(emp.department.id, d)
  }
  const departments: DeptStat[] = Array.from(deptMap.values())
    .map((d) => ({
      name: d.name,
      avg: Math.round(d.scores.reduce((s, n) => s + n, 0) / d.scores.length),
      count: d.scores.length,
    }))
    .sort((a, b) => a.avg - b.avg)

  const atRiskEmployees = enriched
    .filter((e) => e.readiness.total < 80)
    .sort((a, b) => a.readiness.total - b.readiness.total || a.last_name.localeCompare(b.last_name))

  return (
    <ReadinessDashboard
      totalEmployees={total}
      avgReadiness={avgReadiness}
      compliantCount={compliantCount}
      atRiskCount={atRiskCount}
      redSealCount={redSealCount}
      tiers={tiers}
      departments={departments}
      atRiskEmployees={atRiskEmployees}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="px-8 py-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-28" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 h-52" />
          <div className="bg-white rounded-xl border border-slate-200 h-52" />
        </div>
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 h-96" />
      </div>
    </div>
  )
}

export default function WorkforceReadinessPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  )
}
