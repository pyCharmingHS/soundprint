import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useLocale } from '../i18n/LocaleContext'
import AlbumArtPattern from './AlbumArtPattern'

interface AlbumArtProps {
  src?: string
  title: string
  artist: string
  className?: string
}

const TILT_SPRING = { stiffness: 300, damping: 20, mass: 0.5 }

// A "museum display case" tilt: the card rotates toward the cursor with a
// soft spring settle, plus a faint glare that tracks the cursor to sell the
// illusion of a glossy surface. Cursor-hover-only by nature, so it's a pure
// desktop enhancement — no touch/tap equivalent, which is fine since it
// never blocks or alters the primary (mobile) experience.
function AlbumArt({ src, title, artist, className = '' }: AlbumArtProps) {
  const { t } = useLocale()
  const reducedMotion = usePrefersReducedMotion()
  const alt = t('common.by', { title, artist })

  const pointerX = useMotionValue(0.5)
  const pointerY = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [8, -8]), TILT_SPRING)
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-8, 8]), TILT_SPRING)
  const glareX = useTransform(pointerX, (v) => `${v * 100}%`)
  const glareY = useTransform(pointerY, (v) => `${v * 100}%`)
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.12), transparent 55%)`

  function handlePointerMove(event: ReactMouseEvent<HTMLDivElement>) {
    if (reducedMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - rect.left) / rect.width)
    pointerY.set((event.clientY - rect.top) / rect.height)
  }

  function resetTilt() {
    pointerX.set(0.5)
    pointerY.set(0.5)
  }

  return (
    <div className={className} style={{ perspective: '800px' }}>
      <motion.div
        onMouseMove={handlePointerMove}
        onMouseLeave={resetTilt}
        style={{ rotateX, rotateY }}
        className="relative aspect-square overflow-hidden rounded-sm border border-border bg-surface shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <AlbumArtPattern title={title} artist={artist} alt={alt} />
        )}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  )
}

export default AlbumArt
