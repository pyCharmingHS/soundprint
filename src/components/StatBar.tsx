interface StatBarProps {
  label: string
  value: number
  max: number
}

function StatBar({ label, value, max }: StatBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 shrink-0 text-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
        <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-muted">{value}</span>
    </div>
  )
}

export default StatBar
