import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface ParallaxLayerProps {
  children: ReactNode
  offset?: number
  className?: string
}

/**
 * Drifts its contents vertically as the page scrolls the element through the
 * viewport, giving sections a soft sense of depth rather than sliding in
 * flat. Scroll-linked (not spring-animated), so it tracks the scrollbar
 * directly instead of settling after the fact — and is inert entirely for
 * prefers-reduced-motion.
 */
function ParallaxLayer({ children, offset = 30, className = '' }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])

  return (
    <motion.div ref={ref} style={reducedMotion ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  )
}

export default ParallaxLayer
