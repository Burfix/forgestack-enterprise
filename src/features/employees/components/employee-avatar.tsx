// Server-safe — no client APIs used.

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const AVATAR_COLOURS = [
  'bg-blue-700',
  'bg-indigo-700',
  'bg-violet-700',
  'bg-teal-700',
  'bg-emerald-700',
  'bg-cyan-700',
  'bg-rose-700',
  'bg-amber-700',
]

interface EmployeeAvatarProps {
  firstName: string
  lastName: string
  photoUrl?: string | null
  size?: 'sm' | 'lg'
}

export function EmployeeAvatar({ firstName, lastName, photoUrl, size = 'sm' }: EmployeeAvatarProps) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  const colour = AVATAR_COLOURS[hashCode(`${firstName}${lastName}`) % AVATAR_COLOURS.length]
  const dim = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-8 h-8 text-xs'

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={`${dim} rounded-full object-cover flex-shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${dim} ${colour} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}
    >
      {initials}
    </div>
  )
}
