// Feature 2: Employee Profile Workspace — built in the next phase.
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="px-8 py-10">
      <Link
        href="/hr/employees"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to directory
      </Link>
      <p className="text-slate-400 text-sm font-mono">{id}</p>
      <p className="text-slate-500 mt-2">Employee profile — Feature 2</p>
    </div>
  )
}
