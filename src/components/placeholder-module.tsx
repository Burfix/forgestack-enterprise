import type { LucideIcon } from 'lucide-react'

interface ModuleFeature {
  icon: LucideIcon
  title: string
  description: string
}

interface PlaceholderModuleProps {
  icon: LucideIcon
  name: string
  description: string
  features: ModuleFeature[]
}

export function PlaceholderModule({ icon: Icon, name, description, features }: PlaceholderModuleProps) {
  return (
    <div className="px-8 py-10">
      <div className="max-w-4xl">
        <div className="flex items-start gap-5 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#1A3A5C]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 text-[#1A3A5C]" />
          </div>
          <div className="pt-0.5">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
              <span className="inline-flex items-center rounded-full bg-[#E8640A]/10 border border-[#E8640A]/25 px-2.5 py-0.5 text-xs font-semibold text-[#E8640A] tracking-wide uppercase">
                Coming soon
              </span>
            </div>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => {
            const FeatureIcon = feature.icon
            return (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#1A3A5C]/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#1A3A5C]/8 flex items-center justify-center flex-shrink-0 transition-colors">
                    <FeatureIcon className="w-5 h-5 text-slate-500 group-hover:text-[#1A3A5C] transition-colors" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Coming soon
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          This module is in active development. Contact your ForgeStack account manager for a delivery timeline.
        </p>
      </div>
    </div>
  )
}
