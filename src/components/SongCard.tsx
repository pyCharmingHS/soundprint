import { Link } from 'react-router-dom'
import type { Song } from '../types'
import AlbumArt from './AlbumArt'

interface SongCardProps {
  song: Song
}

function SongCard({ song }: SongCardProps) {
  return (
    <Link
      to={`/song/${song.id}`}
      className="group flex flex-col gap-3 text-left"
    >
      <AlbumArt
        src={song.artwork}
        alt={`${song.title} by ${song.artist}`}
        className="transition-transform group-hover:scale-[1.02]"
      />
      <div className="flex flex-col">
        <span className="truncate font-medium">{song.title}</span>
        <span className="truncate text-sm text-muted">{song.artist}</span>
      </div>
    </Link>
  )
}

export default SongCard
