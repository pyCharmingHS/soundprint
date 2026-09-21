import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useGlowAnimation } from '../hooks/useGlowAnimation'
import type { SongNavState } from '../lib/songNav'
import type { Song } from '../types'
import AlbumArt from './AlbumArt'

interface SongRowProps {
  song: Song
  showYear?: boolean
  navState?: SongNavState
  glow?: boolean
}

/** The list-view counterpart to SongCard — a compact single line per song,
 * for scanning many at once instead of browsing a grid of art. */
function SongRow({ song, showYear, navState, glow }: SongRowProps) {
  const glowAnimation = useGlowAnimation(glow)

  return (
    <Link
      to={`/song/${song.id}`}
      state={navState}
      data-song-id={song.id}
      className="group flex items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors hover:bg-surface"
    >
      <motion.div className="w-11 shrink-0 rounded-sm" {...glowAnimation}>
        <AlbumArt src={song.artwork} title={song.title} artist={song.artist} />
      </motion.div>
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate font-medium">{song.title}</span>
        <span className="min-w-0 shrink truncate text-sm text-muted">{song.artist}</span>
      </div>
      {showYear && song.releaseYear && (
        <span className="shrink-0 text-sm text-muted">{song.releaseYear}</span>
      )}
    </Link>
  )
}

export default SongRow
