import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import { hashString } from '../lib/hash'
import type { Category, Song } from '../types'

interface OrbitalPantheonProps {
  categories: Category[]
  songs: Song[]
  activeCategory: string | null
  onSelectCategory: (categoryId: string) => void
}

const SIZE = 560
const CENTER = SIZE / 2
const PLANET_RADIUS = CENTER * 0.72
const MOON_ORBIT_RADIUS = 78

function pointOnCircle(radius: number, index: number, count: number) {
  const angle = (index / count) * 2 * Math.PI - Math.PI / 2
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
}

/**
 * A desktop-only, motion-on alternative to the category pill row: songs
 * orbit their category like moons around a planet (vision doc section 14).
 * Selecting a planet is equivalent to selecting its pill — the filtered
 * grid below still does the actual browsing/reading. Mobile and
 * prefers-reduced-motion users never see this; PantheonPage falls back to
 * the plain pill row for them.
 */
function OrbitalPantheon({ categories, songs, activeCategory, onSelectCategory }: OrbitalPantheonProps) {
  const { localize, t } = useLocale()
  const activeSongs = activeCategory
    ? songs.filter((song) => song.personal.categories.includes(activeCategory))
    : []
  const activeIndex = categories.findIndex((c) => c.id === activeCategory)
  const activeCenter = activeIndex >= 0 ? pointOnCircle(PLANET_RADIUS, activeIndex, categories.length) : null
  const orbitDuration = 24 + activeSongs.length * 3

  return (
    <div
      className="relative mx-auto hidden lg:block"
      style={{ width: SIZE, height: SIZE }}
      role="group"
      aria-label={t('pantheon.category')}
    >
      <div
        aria-hidden="true"
        className="absolute rounded-full border border-border/40"
        style={{ left: CENTER - PLANET_RADIUS, top: CENTER - PLANET_RADIUS, width: PLANET_RADIUS * 2, height: PLANET_RADIUS * 2 }}
      />

      <div
        aria-hidden="true"
        className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold"
        style={{ left: CENTER - 20, top: CENTER - 20 }}
      >
        ✦
      </div>

      {activeCenter && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: orbitDuration, ease: 'linear', repeat: Infinity }}
          className="absolute rounded-full border border-dashed border-gold/40"
          style={{
            left: CENTER + activeCenter.x - MOON_ORBIT_RADIUS,
            top: CENTER + activeCenter.y - MOON_ORBIT_RADIUS,
            width: MOON_ORBIT_RADIUS * 2,
            height: MOON_ORBIT_RADIUS * 2,
          }}
        >
          {activeSongs.map((song, i) => {
            const moon = pointOnCircle(MOON_ORBIT_RADIUS, i, activeSongs.length)
            const hue = hashString(`${song.title}${song.artist}`) % 360
            return (
              <motion.div
                key={song.id}
                animate={{ rotate: -360 }}
                transition={{ duration: orbitDuration, ease: 'linear', repeat: Infinity }}
                className="absolute h-8 w-8"
                style={{ left: MOON_ORBIT_RADIUS + moon.x - 16, top: MOON_ORBIT_RADIUS + moon.y - 16 }}
              >
                <Link
                  to={`/song/${song.id}`}
                  title={`${song.title} — ${song.artist}`}
                  className="block h-8 w-8 overflow-hidden rounded-full border border-border shadow-[0_4px_10px_-4px_rgba(0,0,0,0.6)] transition-transform hover:scale-125"
                >
                  {song.artwork ? (
                    <img src={song.artwork} alt={song.title} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{ backgroundColor: `hsl(${hue}, 45%, 35%)` }}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {categories.map((category, i) => {
        const point = pointOnCircle(PLANET_RADIUS, i, categories.length)
        const count = songs.filter((s) => s.personal.categories.includes(category.id)).length
        const isActive = category.id === activeCategory
        const size = Math.min(76, Math.max(48, 40 + count * 4))
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            title={`${localize(category.name)} — ${t('common.songs', { count })}`}
            className={`absolute flex flex-col items-center justify-center gap-0.5 rounded-full border transition-colors ${
              isActive
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-border bg-surface hover:border-gold/50'
            }`}
            style={{
              left: CENTER + point.x - size / 2,
              top: CENTER + point.y - size / 2,
              width: size,
              height: size,
            }}
          >
            <span className="text-lg">{category.emoji}</span>
            <span className="max-w-[70px] truncate text-[0.65rem] leading-tight font-display">
              {localize(category.name)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default OrbitalPantheon
