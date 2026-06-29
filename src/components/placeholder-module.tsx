import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonWidget {
  label: string
  metric: string
  description: string
}

interface PlaceholderModuleProps {
  icon: LucideIcon
  name: string
  description: string
  widgets: SkeletonWidget[]
}

export function PlaceholderModule({ icon: Icon, name, description, widgets }: PlaceholderModuleProps) {
  return (
    <div className="px-8 py-10">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1A3A5C]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-[#1A3A5C]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-medium text-slate-900">{name}</h1>
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                In development
              </span>
            </div>
            <p className="text-slate-500">{description}</p>
          </div>
        </div>

        {/* Skeleton widgets */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {widgets.map((widget, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">{widget.label}</p>
                <Skeleton className="w-5 h-5 rounded" />
              </div>
              <Skeleton className="h-8 w-24 mb-2" />
              <p className="text-xs text-slate-400">{widget.description}</p>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-2 w-3/4 rounded-full" />
                <Skeleton className="h-2 w-1/2 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-400">
          This module is being built. Contact your ForgeStack account manager for a delivery timeline.
        </p>
      </div>
    </div>
  )
}
