'use client'

// Thin tab toggle between the Kanban Pipeline Board (drag-to-advance,
// operational day-to-day use) and the Candidate List View (filterable
// table, for scanning/auditing/exporting). Both read the same underlying
// candidate data — the toggle only changes presentation, never the
// definition of risk or stage.

import { useState } from 'react'
import { PipelineBoard } from '@/features/recruitment/components/pipeline-board'
import { CandidateListView } from '@/features/recruitment/components/candidate-list-view'
import type { CandidatePipelineRow } from '@/types/recruitment'
import type { HiringManagerOption, SiteOption } from '@/lib/db/reference-data'

interface Props {
  activeCandidates: CandidatePipelineRow[]
  allCandidates: CandidatePipelineRow[]
  hiringManagers: HiringManagerOption[]
  sites: SiteOption[]
}

export function PipelineView({ activeCandidates, allCandidates, hiringManagers, sites }: Props) {
  const [view, setView] = useState<'board' | 'list'>('board')

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setView('board')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Board
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          List
        </button>
      </div>

      {view === 'board' ? (
        <PipelineBoard candidates={activeCandidates} hiringManagers={hiringManagers} />
      ) : (
        <CandidateListView candidates={allCandidates} sites={sites} hiringManagers={hiringManagers} />
      )}
    </div>
  )
}
