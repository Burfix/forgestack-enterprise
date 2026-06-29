interface EmptyStateProps {
  query?: string
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-60"
      >
        <circle cx="60" cy="60" r="56" stroke="#E2E8F0" strokeWidth="2" />
        <rect x="34" y="44" width="52" height="6" rx="3" fill="#CBD5E1" />
        <rect x="34" y="56" width="38" height="5" rx="2.5" fill="#E2E8F0" />
        <rect x="34" y="67" width="44" height="5" rx="2.5" fill="#E2E8F0" />
        <circle cx="60" cy="32" r="10" stroke="#CBD5E1" strokeWidth="2" />
        <path
          d="M54 31.5c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="#CBD5E1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="86" cy="82" r="14" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />
        <path
          d="M82 82h8M86 78v8"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-base font-medium text-slate-700">
        {query ? `No employees match "${query}"` : 'No employees found'}
      </p>
      <p className="mt-1 text-sm text-slate-400">
        {query
          ? 'Try adjusting your search or filters.'
          : 'Add the first employee to get started.'}
      </p>
    </div>
  )
}
