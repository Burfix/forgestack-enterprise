export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getOrganisationId } from '@/lib/session'
import { getEmployees, computeReadiness, computeCategoryIconStatuses } from '@/lib/db/employees'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EmployeeTable } from '@/features/employees/components/employee-table'
import { TableSkeleton } from '@/features/employees/components/table-skeleton'

async function EmployeeData() {
  const orgId = await getOrganisationId()
  const supabase = await createServerSupabaseClient()
  const [employees, departmentsResult] = await Promise.all([
    getEmployees(orgId),
    supabase
      .from('departments')
      .select('id, name')
      .eq('organisation_id', orgId)
      .is('deleted_at', null)
      .order('name'),
  ])

  const enriched = employees.map((emp) => ({
    ...emp,
    readiness: computeReadiness(emp),
    categoryStatuses: computeCategoryIconStatuses(emp),
  }))

  const departments = (departmentsResult.data ?? []) as { id: string; name: string }[]

  return <EmployeeTable employees={enriched} departments={departments} />
}

export default function EmployeeDirectoryPage() {
  return (
    <div className="min-h-full bg-white">
      <Suspense fallback={<TableSkeleton />}>
        <EmployeeData />
      </Suspense>
    </div>
  )
}
