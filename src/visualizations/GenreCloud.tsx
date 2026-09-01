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
          <span
            key={genre.genre}
            style={{ fontSize: `${scale}rem` }}
            className="text-gold/80"
          >
            {genre.genre}
          </span>
        )
      })}
    </div>
  )
}

export default GenreCloud
