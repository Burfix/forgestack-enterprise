import { HrSubnav } from '@/components/layout/hr-subnav'

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <HrSubnav />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
