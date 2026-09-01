import { motion } from 'framer-motion'
import type { GenreYearEntry } from '../lib/analytics'

interface MusicalEvolutionProps {
  entries: GenreYearEntry[]
}

function MusicalEvolution({ entries }: MusicalEvolutionProps) {
  return (
    <div className="flex gap-8 overflow-x-auto pb-4">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.year}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="flex w-32 shrink-0 flex-col items-center gap-2 text-center"
        >
          <span className="font-display text-lg text-gold">{entry.year}</span>
          <div className="h-px w-full bg-border" />
          <div className="flex flex-wrap justify-center gap-1">
            {entry.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
              >
                {genre}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default MusicalEvolution
