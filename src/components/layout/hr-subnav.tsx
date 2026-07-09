'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HR_NAV = [
  { label: 'Overview',           href: '/hr' },
  { label: 'Employee directory', href: '/hr/employees' },
  { label: 'Recruitment',        href: '/hr/recruitment' },
  { label: 'Workforce readiness',href: '/hr/workforce/readiness' },
  { label: 'Organisation chart', href: '/hr/org-chart' },
  { label: 'Leave calendar',     href: '/hr/leave' },
  { label: 'Training',           href: '/hr/training' },
  { label: 'Medicals',           href: '/hr/medicals' },
  { label: 'Reports',            href: '/hr/reports' },
]

export function HrSubnav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-slate-200 bg-white">
      <nav className="px-8 flex gap-1">
        {HR_NAV.map(({ label, href }) => {
          const isActive =
            href === '/hr'
              ? pathname === '/hr'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#E8640A] text-[#1A3A5C]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
