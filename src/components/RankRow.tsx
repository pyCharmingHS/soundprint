import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface RankRowProps {
  rank: number
  primary: ReactNode
  secondary?: string
  value: string
  href?: string
}

function RankRow({ rank, primary, secondary, value, href }: RankRowProps) {
  const content = (
    <>
      <span className="w-6 shrink-0 text-muted">{rank}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{primary}</span>
        {secondary && <span className="truncate text-sm text-muted">{secondary}</span>}
      </div>
      <span className="shrink-0 text-sm text-muted">{value}</span>
    </>
  )

  const className = 'flex items-center gap-3 py-2'

  if (href) {
    return (
      <Link to={href} className={`${className} hover:text-gold`}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export default RankRow
