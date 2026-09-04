import { hashString } from '../lib/hash'

interface AlbumArtPatternProps {
  title: string
  artist: string
  alt: string
}

const SHAPE_TYPES = ['circle', 'triangle', 'rectangle'] as const
type ShapeType = (typeof SHAPE_TYPES)[number]

function polygonPoints(cx: number, cy: number, r: number, sides: number, rotationDeg: number): string {
  const points: string[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2 + (rotationDeg * Math.PI) / 180
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`)
  }
  return points.join(' ')
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
      rotation: (n * 17) % 360,
      shapeType: SHAPE_TYPES[n % SHAPE_TYPES.length] as ShapeType,
    }
  })

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={alt} className="h-full w-full">
      <rect width="100" height="100" fill={`hsl(${hue}, 18%, 9%)`} />
      {shapes.map((shape, i) => {
        const fill = `hsl(${(hue + shape.hueOffset + 360) % 360}, 30%, 50%)`

        if (shape.shapeType === 'triangle') {
          return (
            <polygon
              key={i}
              points={polygonPoints(shape.cx, shape.cy, shape.r, 3, shape.rotation)}
              fill={fill}
              fillOpacity={shape.opacity}
            />
          )
        }

        if (shape.shapeType === 'rectangle') {
          const size = shape.r * 1.6
          return (
            <rect
              key={i}
              x={shape.cx - size / 2}
              y={shape.cy - size / 2}
              width={size}
              height={size}
              fill={fill}
              fillOpacity={shape.opacity}
              transform={`rotate(${shape.rotation} ${shape.cx} ${shape.cy})`}
            />
          )
        }

        return (
          <circle
            key={i}
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
            fill={fill}
            fillOpacity={shape.opacity}
          />
        )
      })}
    </svg>
  )
}

export default AlbumArtPattern
