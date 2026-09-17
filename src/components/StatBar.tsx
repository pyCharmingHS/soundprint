import { motion } from 'framer-motion'
import { EASE_CINEMATIC } from '../animations/variants'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface StatBarProps {
  label: string
  value: number
  max: number
}

function StatBar({ label, value, max }: StatBarProps) {
  const reducedMotion = usePrefersReducedMotion()
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 shrink-0 text-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
        <motion.div
          layout
          className="h-full bg-gold"
          initial={reducedMotion ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-muted">{value}</span>
    </div>
  )
}

export default StatBar
