import { motion } from 'framer-motion'
import { useLocale } from '../i18n/LocaleContext'
import type { Song } from '../types'

interface PantheonVsRealityProps {
  songs: Song[]
}

// The project's central tension, made visible: sorted by plays, but color
// tracks Pantheon membership — so the eye immediately sees that the two
// don't line up.
function PantheonVsReality({ songs }: PantheonVsRealityProps) {
  const { t } = useLocale()
  const sorted = [...songs].sort((a, b) => b.listening.plays - a.listening.plays)
  const max = Math.max(1, ...sorted.map((s) => s.listening.plays))

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((song) => (
        <div key={song.id} className="flex items-center gap-3 text-sm">
          <span
            className={`w-36 shrink-0 truncate sm:w-44 ${
              song.personal.isPantheon ? 'text-gold' : 'text-muted'
            }`}
          >
            {song.title}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(song.listening.plays / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`h-full ${song.personal.isPantheon ? 'bg-gold' : 'bg-muted/50'}`}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-muted">
            {song.listening.plays}
          </span>
        </div>
      ))}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gold" /> {t('viz.pantheonLegend')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted/50" /> {t('viz.notYetLegend')}
        </span>
      </div>
    </div>
  )
}

export default PantheonVsReality
