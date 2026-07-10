'use client'

import { useState, useTransition } from 'react'
import type { WorkOrderPriority } from '@/types/work-orders'
import { createWorkOrder } from '../actions'

interface Props {
  onClose: () => void
}

export function NewWorkOrderForm({ onClose }: Props) {
  const [clientName, setClientName] = useState('')
  const [siteName, setSiteName] = useState('')
  const [assetDescription, setAssetDescription] = useState('')
  const [faultDescription, setFaultDescription] = useState('')
  const [priority, setPriority] = useState<WorkOrderPriority>('P3')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const slaHoursForPriority: Record<WorkOrderPriority, number> = { P1: 4, P2: 8, P3: 24, P4: 72 }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createWorkOrder({
        clientName: clientName.trim(),
        siteName: siteName.trim(),
        siteId: null,
        assetDescription: assetDescription.trim() || null,
        faultDescription: faultDescription.trim(),
        priority,
        slaHours: slaHoursForPriority[priority],
      })
      if (!result.ok) {
        setError(result.message ?? 'Something went wrong.')
        return
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-900">Log a new work order</h2>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Client name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Site"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Asset (optional)"
            value={assetDescription}
            onChange={(e) => setAssetDescription(e.target.value)}
            className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <textarea
          required
          placeholder="Fault or job description"
          value={faultDescription}
          onChange={(e) => setFaultDescription(e.target.value)}
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Priority</p>
          <div className="flex gap-2">
            {(['P1', 'P2', 'P3', 'P4'] as WorkOrderPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 text-sm font-medium rounded-lg px-2 py-1.5 ring-1 ring-inset ${
                  priority === p
                    ? 'bg-[#1A3A5C] text-white ring-[#1A3A5C]'
                    : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-sm text-slate-500 px-3 py-2 hover:text-slate-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="bg-[#1A3A5C] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#15304c] disabled:opacity-50"
          >
            {pending ? 'Logging\u2026' : 'Log work order'}
          </button>
        </div>
      </form>
    </div>
  )
}
