import { hashString } from '../lib/hash'

interface AlbumArtPatternProps {
  title: string
  artist: string
  alt: string
}

// Generative "identicon"-style pattern, no text — a unique abstract mark
// per song, deterministic from title+artist so it's stable across visits.
function AlbumArtPattern({ title, artist, alt }: AlbumArtPatternProps) {
  const seed = hashString(`${title}${artist}`)
  const hue = seed % 360

  const shapes = Array.from({ length: 4 }, (_, i) => {
    const n = seed + i * 7919
    return {
      cx: 20 + ((n * 13) % 60),
      cy: 20 + ((n * 29) % 60),
      r: 12 + ((n * 7) % 22),
      hueOffset: ((n * 3) % 40) - 20,
      opacity: 0.15 + ((n % 30) / 100),
    }
  })

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={alt} className="h-full w-full">
      <rect width="100" height="100" fill={`hsl(${hue}, 18%, 9%)`} />
      {shapes.map((shape, i) => (
        <circle
          key={i}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={`hsl(${(hue + shape.hueOffset + 360) % 360}, 30%, 50%)`}
          fillOpacity={shape.opacity}
        />
      ))}
    </svg>
  )
}

export default AlbumArtPattern
