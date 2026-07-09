export const dynamic = 'force-dynamic'

import { getCurrentRoles, getOrganisationId } from '@/lib/session'
import { getSites, getDepartments, getHiringManagers, getContractTypes, getHireTypes } from '@/lib/db/reference-data'
import { getImportBatches, getImportRows } from '@/lib/db/vacancy-import'
import { VacancyImportPanel } from '@/features/recruitment/components/vacancy-import-panel'

const AUTHORISED_ROLES = ['super_admin', 'hr_admin']

export default async function VacancyImportPage() {
  const roles = await getCurrentRoles()

  if (!roles.some((r) => AUTHORISED_ROLES.includes(r))) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <h1 className="text-sm font-semibold text-slate-700">Vacancy import</h1>
        <p className="mt-2 text-sm text-slate-500">
          This page is restricted to HR Admin and Super Admin roles. Ask an admin to run this import, or to grant
          you the HR Admin role.
        </p>
      </div>
    )
  }

  const orgId = await getOrganisationId()
  const [sites, departments, hiringManagers, contractTypes, hireTypes, batches] = await Promise.all([
    getSites(orgId),
    getDepartments(orgId),
    getHiringManagers(orgId),
    getContractTypes(orgId),
    getHireTypes(orgId),
    getImportBatches(orgId),
  ])

  const rowsByBatch: Record<string, Awaited<ReturnType<typeof getImportRows>>> = {}
  for (const batch of batches) {
    rowsByBatch[batch.id] = await getImportRows(batch.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Vacancy import</h1>
        <p className="text-sm text-slate-500">Historical migration from spreadsheets. Review and confirm before anything is written.</p>
      </div>
      <VacancyImportPanel
        batches={batches}
        rowsByBatch={rowsByBatch}
        sites={sites}
        departments={departments}
        hiringManagers={hiringManagers}
        contractTypes={contractTypes}
        hireTypes={hireTypes}
      />
    </div>
  )
}
