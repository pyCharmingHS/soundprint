import { motion } from 'framer-motion'
import { useLocale } from '../i18n/LocaleContext'
import { formatHourLabel } from '../lib/format'

interface ListeningClockProps {
  hours: Record<string, number>
}

const CARDINAL_HOURS = [0, 6, 12, 18]

// Center is inset from the 240x240 viewBox edges so the cardinal labels
// (offset R_OUTER + 14 past the circle) have room to render without clipping.
const CENTER = 120
const R_INNER = 36
const R_OUTER = 88

function pointOnCircle(hour: number, radius: number) {
  const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

function ListeningClock({ hours }: ListeningClockProps) {
  const { locale } = useLocale()
  const max = Math.max(1, ...Object.values(hours))

  return (
    <svg viewBox="0 0 240 240" className="mx-auto w-56 sm:w-64">
      <circle
        cx={CENTER}
        cy={CENTER}
        r={R_INNER}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={1}
      />
      {Array.from({ length: 24 }, (_, hour) => {
        const value = hours[String(hour)] ?? 0
        const inner = pointOnCircle(hour, R_INNER)
        const outer = pointOnCircle(hour, R_INNER + (value / max) * (R_OUTER - R_INNER))
        return (
          <motion.line
            key={hour}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--color-gold)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: value > 0 ? 0.35 + 0.65 * (value / max) : 0.12 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: hour * 0.015 }}
          />
        )
      })}
      {CARDINAL_HOURS.map((hour) => {
        const label = formatHourLabel(String(hour), locale)
        const { x, y } = pointOnCircle(hour, R_OUTER + 14)
        return (
          <text
            key={hour}
            x={x}
            y={y}
            fill="var(--color-muted)"
            fontSize={9}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

export default ListeningClock
