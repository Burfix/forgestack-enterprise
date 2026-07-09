export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getOrganisationId } from '@/lib/session'
import { getVacancies, getCandidatePipeline, getAvgTimeToHireDays } from '@/lib/db/recruitment'
import { getSites, getDepartments, getEmployeeRoles } from '@/lib/db/reference-data'
import { RecruitmentOverview } from '@/features/recruitment/components/recruitment-overview'
import { PipelineBoard } from '@/features/recruitment/components/pipeline-board'
import { VacanciesPanel } from '@/features/recruitment/components/vacancies-panel'

async function RecruitmentData() {
  const orgId = await getOrganisationId()
  const [vacancies, candidates, avgTimeToHireDays, sites, departments, roles] = await Promise.all([
    getVacancies(orgId),
    getCandidatePipeline(orgId),
    getAvgTimeToHireDays(orgId),
    getSites(orgId),
    getDepartments(orgId),
    getEmployeeRoles(orgId),
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
      <VacanciesPanel vacancies={vacancies} sites={sites} departments={departments} roles={roles} />
      <PipelineBoard candidates={candidates} />
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
