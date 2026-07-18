export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getOrganisationId } from '@/lib/session'
import Link from 'next/link'
import { getCurrentRoles } from '@/lib/session'
import { getVacancies, getCandidatePipeline, getCandidateListView, getAvgTimeToHireDays } from '@/lib/db/recruitment'
import { getSites, getDepartments, getEmployeeRoles, getHiringManagers, getContractTypes, getHireTypes } from '@/lib/db/reference-data'
import { RecruitmentOverview } from '@/features/recruitment/components/recruitment-overview'
import { PipelineView } from '@/features/recruitment/components/pipeline-view'
import { VacanciesPanel } from '@/features/recruitment/components/vacancies-panel'

async function RecruitmentData() {
  const orgId = await getOrganisationId()
  const userRoles = await getCurrentRoles()
  const canImport = userRoles.some((r) => ['super_admin', 'hr_admin'].includes(r))
  const [vacancies, candidates, allCandidates, avgTimeToHireDays, sites, departments, roles, hiringManagers, contractTypes, hireTypes] = await Promise.all([
    getVacancies(orgId),
    getCandidatePipeline(orgId),
    getCandidateListView(orgId),
    getAvgTimeToHireDays(orgId),
    getSites(orgId),
    getDepartments(orgId),
    getEmployeeRoles(orgId),
    getHiringManagers(orgId),
    getContractTypes(orgId),
    getHireTypes(orgId),
  ])

  const openVacancies = vacancies.filter((v) => v.status === 'open').length
  const atRisk = candidates
    .filter((c) => c.risk !== 'green')
    .sort((a, b) => (a.risk === b.risk ? b.daysInStage - a.daysInStage : a.risk === 'red' ? -1 : 1))
  const waitingManagerAction = candidates.filter(
    (c) => c.activeWorkflow?.stage === 'head_approval' || c.activeWorkflow?.stage === 'manager_approval'
  ).length
  const waitingMdSignature = candidates.filter(
    (c) => c.activeWorkflow?.stage === 'md_signature_pending' || c.activeWorkflow?.stage === 'final_md_signature'
  ).length

  return (
    <div className="space-y-6">
      {canImport && (
        <div className="flex justify-end">
          <Link href="/hr/recruitment/import" className="text-sm text-blue-600 hover:underline">
            Import historical vacancies from spreadsheet →
          </Link>
        </div>
      )}
      <RecruitmentOverview
        openVacancies={openVacancies}
        candidatesInPipeline={candidates.length}
        slaBreaches={candidates.filter((c) => c.risk === 'red').length}
        waitingManagerAction={waitingManagerAction}
        waitingMdSignature={waitingMdSignature}
        avgTimeToHireDays={avgTimeToHireDays}
        atRisk={atRisk}
        vacancies={vacancies}
      />
      <VacanciesPanel
        vacancies={vacancies}
        sites={sites}
        departments={departments}
        roles={roles}
        hiringManagers={hiringManagers}
        contractTypes={contractTypes}
        hireTypes={hireTypes}
      />
      <PipelineView activeCandidates={candidates} allCandidates={allCandidates} hiringManagers={hiringManagers} sites={sites} />
    </div>
  )
}

function RecruitmentSkeleton() {
  return (
    <div className="px-8 py-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 h-64" />
      <div className="bg-white rounded-xl border border-slate-200 h-64" />
      <div className="bg-white rounded-xl border border-slate-200 h-80" />
    </div>
  )
}

export default function RecruitmentPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-6">
      <Suspense fallback={<RecruitmentSkeleton />}>
        <RecruitmentData />
      </Suspense>
    </div>
  )
}
