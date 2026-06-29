'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  Wrench,
  Cog,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Users,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Sparkles,
  UserCog,
  Settings,
  Building2,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Executive dashboard', href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Sites',               href: '/sites',         icon: MapPin },
  { label: 'Operations',          href: '/operations',    icon: Cog },
  { label: 'Maintenance',         href: '/maintenance',   icon: Wrench },
  { label: 'Compliance',          href: '/compliance',    icon: ShieldCheck },
  { label: 'Risk',                href: '/risk',          icon: AlertTriangle },
  { label: 'Work orders',         href: '/work-orders',   icon: ClipboardList },
  { label: 'Customers',           href: '/customers',     icon: Users },
  { label: 'Procurement',         href: '/procurement',   icon: ShoppingCart },
  { label: 'Finance',             href: '/finance',       icon: DollarSign },
  { label: 'Analytics',           href: '/analytics',     icon: BarChart3 },
  { label: 'AI copilot',          href: '/ai',            icon: Sparkles },
  { label: 'HR & workforce',      href: '/hr',            icon: UserCog },
  { label: 'Administration',      href: '/admin',         icon: Building2 },
  { label: 'Settings',            href: '/settings',      icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 bg-[#1A3A5C] flex flex-col h-screen sticky top-0">
      {/* Wordmark */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#E8640A] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">ForgeStack</p>
            <p className="text-white/40 text-[11px] mt-0.5 leading-none">Enterprise</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/hr'
              ? pathname.startsWith('/hr')
              : href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-white/30 text-[11px]">Phase 1 — Employee directory</p>
      </div>
    </aside>
  )
}
