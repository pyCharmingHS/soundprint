import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// Ramp up, HOLD at peak for a while (previously it only ever touched peak
// brightness for an instant — easy to miss, especially paired with a scroll
// that hadn't caught up yet), then fade out.
const TIMES = [0, 0.15, 0.75, 1]
const GLOW_SHADOW = [
  '0 0 0 0px rgba(201,162,75,0)',
  '0 0 0 8px rgba(201,162,75,0.65)',
  '0 0 0 8px rgba(201,162,75,0.65)',
  '0 0 0 0px rgba(201,162,75,0)',
]
const GLOW_SCALE = [1, 1.06, 1.06, 1]
const GLOW_SHADOW_STATIC = '0 0 0 8px rgba(201,162,75,0.6)'
const NO_GLOW_SHADOW = '0 0 0 0px rgba(201,162,75,0)'

/** Duration (ms) the caller should wait before clearing `glow` — matches
 * this animation's own length so the effect isn't cut off mid-fade. */
export const GLOW_DURATION_MS = 3000

/** Framer Motion `animate`/`transition` props for the gold "ring" used to
 * mark "this is the song you just came back from". Shared by SongCard and
 * SongRow so the two view modes glow identically. */
export function useGlowAnimation(glow?: boolean) {
  const reducedMotion = usePrefersReducedMotion()
  return {
    animate: {
      boxShadow: glow ? (reducedMotion ? GLOW_SHADOW_STATIC : GLOW_SHADOW) : NO_GLOW_SHADOW,
      scale: glow && !reducedMotion ? GLOW_SCALE : 1,
    },
    transition:
      glow && !reducedMotion
        ? { duration: 2.6, ease: 'easeInOut' as const, times: TIMES }
        : { duration: 0.4 },
  }
}
