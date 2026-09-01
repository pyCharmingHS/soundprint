import { motion } from 'framer-motion'
import { EASE_CINEMATIC } from '../animations/variants'
import type { TimelineEntry } from '../lib/analytics'

interface TimelineChartProps {
  entries: TimelineEntry[]
}

function TimelineChart({ entries }: TimelineChartProps) {
  const max = Math.max(1, ...entries.map((entry) => entry.plays))

  return (
    <div className="flex items-end gap-4 overflow-x-auto pb-2">
      {entries.map((entry) => (
        <div key={entry.year} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted">{entry.plays}</span>
          <div className="flex h-32 w-8 items-end">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(entry.plays / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
              className="w-full rounded-t-sm bg-gold"
            />
          </div>
          <span className="text-xs text-muted">{entry.year}</span>
        </div>
      ))}
    </div>
  )
}

export default TimelineChart
