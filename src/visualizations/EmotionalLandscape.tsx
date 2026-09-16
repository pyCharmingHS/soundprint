import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import type { Song } from '../types'

interface EmotionalLandscapeProps {
  songs: Song[]
}

const SIZE = 300
const PADDING = 40
const PLOT = SIZE - PADDING - 10

// Only songs with both axes scored can be placed. Nostalgia/rating are
// optional dimensions layered on top (size/brightness) — missing ones
// just render as a mid-range dot rather than being excluded.
function EmotionalLandscape({ songs }: EmotionalLandscapeProps) {
  const navigate = useNavigate()
  const { t } = useLocale()

  const points = songs
    .filter(
      (s) => s.personal.meaning !== undefined && s.personal.emotionalIntensity !== undefined,
    )
    .map((s) => {
      const meaning = s.personal.meaning ?? 0
      const intensity = s.personal.emotionalIntensity ?? 0
      const nostalgia = s.personal.nostalgia ?? 5
      const rating = s.personal.rating ?? 5
      return {
        song: s,
        x: PADDING + (meaning / 10) * PLOT,
        y: SIZE - PADDING - (intensity / 10) * PLOT,
        radius: 4 + (nostalgia / 10) * 8,
        opacity: 0.3 + (rating / 10) * 0.6,
      }
    })

  if (points.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-sm">
        <line
          x1={PADDING}
          y1={SIZE - PADDING}
          x2={SIZE - 10}
          y2={SIZE - PADDING}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <line
          x1={PADDING}
          y1={SIZE - PADDING}
          x2={PADDING}
          y2={10}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <text x={SIZE / 2} y={SIZE - 12} fill="var(--color-muted)" fontSize={10} textAnchor="middle">
          {t('viz.meaningAxis')}
        </text>
        <text
          x={14}
          y={SIZE / 2}
          fill="var(--color-muted)"
          fontSize={10}
          textAnchor="middle"
          transform={`rotate(-90 14 ${SIZE / 2})`}
        >
          {t('viz.intensityAxis')}
        </text>
        {points.map(({ song, x, y, radius, opacity }) => (
          <circle
            key={song.id}
            cx={x}
            cy={y}
            r={radius}
            fill="var(--color-gold)"
            fillOpacity={opacity}
            className="cursor-pointer"
            onClick={() => navigate(`/song/${song.id}`)}
          >
            <title>{song.title}</title>
          </circle>
        ))}
      </svg>
      <p className="text-xs text-muted">{t('viz.emotionalLandscapeLegend')}</p>
    </div>
  )
}

export default EmotionalLandscape
