export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getOrganisationId } from '@/lib/session'
import { getEmployee, computeReadiness, computeCategoryIconStatuses } from '@/lib/db/employees'
import { EmployeeProfile } from '@/features/employees/components/employee-profile'

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const orgId = await getOrganisationId()
  const employee = await getEmployee(orgId, id)

  if (!employee) notFound()

  const readiness = computeReadiness(employee)
  const categoryStatuses = computeCategoryIconStatuses(employee)

  return (
    <div className="min-h-full bg-white">
      <EmployeeProfile
        employee={employee}
        readiness={readiness}
        categoryStatuses={categoryStatuses}
      />
    </div>
  )
}
