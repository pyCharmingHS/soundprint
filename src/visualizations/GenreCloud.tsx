import { Link } from 'react-router-dom'
import type { GenreStat } from '../lib/analytics'

interface GenreCloudProps {
  genres: GenreStat[]
}

// Deliberately understated — genre is context here, not the main story.
function GenreCloud({ genres }: GenreCloudProps) {
  const max = Math.max(1, ...genres.map((g) => g.plays))

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2">
      {genres.map((genre) => {
        const scale = 0.85 + (genre.plays / max) * 0.85
        return (
          <Link
            key={genre.genre}
            to={`/pantheon?genre=${encodeURIComponent(genre.genre)}`}
            style={{ fontSize: `${scale}rem` }}
            className="cursor-pointer text-gold/80 transition-colors hover:text-gold"
          >
            {genre.genre}
          </Link>
        )
      })}
    </div>
  )
}

export default GenreCloud
