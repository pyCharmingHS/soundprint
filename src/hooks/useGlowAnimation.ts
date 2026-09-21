import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const GLOW_SHADOW = [
  '0 0 0 0px rgba(201,162,75,0)',
  '0 0 0 6px rgba(201,162,75,0.55)',
  '0 0 0 0px rgba(201,162,75,0)',
]
const NO_GLOW_SHADOW = '0 0 0 0px rgba(201,162,75,0)'

/** Framer Motion `animate`/`transition` props for the gold "ring" used to
 * mark "this is the song you just came back from". Shared by SongCard and
 * SongRow so the two view modes glow identically. */
export function useGlowAnimation(glow?: boolean) {
  const reducedMotion = usePrefersReducedMotion()
  return {
    animate: { boxShadow: glow ? (reducedMotion ? GLOW_SHADOW[1] : GLOW_SHADOW) : NO_GLOW_SHADOW },
    transition:
      glow && !reducedMotion
        ? { duration: 2.2, ease: 'easeOut' as const, times: [0, 0.3, 1] }
        : { duration: 0.4 },
  }
}
