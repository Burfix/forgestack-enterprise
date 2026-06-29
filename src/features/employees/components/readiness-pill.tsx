interface ReadinessPillProps {
  score: number
}

export function ReadinessPill({ score }: ReadinessPillProps) {
  const colour =
    score >= 80
      ? 'bg-green-100 text-green-700 ring-green-200'
      : score >= 60
        ? 'bg-amber-100 text-amber-700 ring-amber-200'
        : 'bg-red-100 text-red-700 ring-red-200'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset tabular-nums ${colour}`}
    >
      {score}%
    </span>
  )
}
