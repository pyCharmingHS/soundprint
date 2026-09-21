import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useLocale } from '../i18n/LocaleContext'
import type { SongNavState } from '../lib/songNav'
import type { Song } from '../types'
import AlbumArt from './AlbumArt'

interface SongCardProps {
  song: Song
  showWhy?: boolean
  showYear?: boolean
  /** The list this card is part of — lets the detail page offer Prev/Next
   * through it and a way back to exactly this view. */
  navState?: SongNavState
  /** Briefly rings the album art gold — used to mark "this is the song you
   * just came back from" when returning from the detail page. */
  glow?: boolean
}

const GLOW_SHADOW = [
  '0 0 0 0px rgba(201,162,75,0)',
  '0 0 0 6px rgba(201,162,75,0.55)',
  '0 0 0 0px rgba(201,162,75,0)',
]
const NO_GLOW_SHADOW = '0 0 0 0px rgba(201,162,75,0)'

function SongCard({ song, showWhy, showYear, navState, glow }: SongCardProps) {
  const { localize } = useLocale()
  const reducedMotion = usePrefersReducedMotion()
  const why = showWhy ? localize(song.personal.why) : undefined

  return (
    <Link
      to={`/song/${song.id}`}
      state={navState}
      data-song-id={song.id}
      className="group flex flex-col gap-3 text-left"
    >
      <motion.div
        className="rounded-sm"
        animate={{ boxShadow: glow ? (reducedMotion ? GLOW_SHADOW[1] : GLOW_SHADOW) : NO_GLOW_SHADOW }}
        transition={
          glow && !reducedMotion
            ? { duration: 2.2, ease: 'easeOut', times: [0, 0.3, 1] }
            : { duration: 0.4 }
        }
      >
        <AlbumArt
          src={song.artwork}
          title={song.title}
          artist={song.artist}
          className="transition-transform group-hover:scale-[1.02]"
        />
      </motion.div>
      <div className="flex flex-col">
        <span className="truncate font-medium">{song.title}</span>
        <div className="flex items-baseline gap-1 text-sm text-muted">
          <span className="min-w-0 truncate">{song.artist}</span>
          {showYear && song.releaseYear && <span className="shrink-0">· {song.releaseYear}</span>}
        </div>
      </div>
      {why && <p className="line-clamp-2 text-sm text-muted italic">"{why}"</p>}
    </Link>
  )
}

export default SongCard
