import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import type { Song } from '../types'
import AlbumArt from './AlbumArt'

interface SongCardProps {
  song: Song
  showWhy?: boolean
}

function SongCard({ song, showWhy }: SongCardProps) {
  const { localize } = useLocale()
  const why = showWhy ? localize(song.personal.why) : undefined

  return (
    <Link
      to={`/song/${song.id}`}
      className="group flex flex-col gap-3 text-left"
    >
      <AlbumArt
        src={song.artwork}
        title={song.title}
        artist={song.artist}
        className="transition-transform group-hover:scale-[1.02]"
      />
      <div className="flex flex-col">
        <span className="truncate font-medium">{song.title}</span>
        <span className="truncate text-sm text-muted">{song.artist}</span>
      </div>
      {why && <p className="line-clamp-2 text-sm text-muted italic">"{why}"</p>}
    </Link>
  )
}

export default SongCard
