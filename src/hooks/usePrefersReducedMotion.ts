import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getPrefersReducedMotion(): boolean {
  try {
    return window.matchMedia(QUERY).matches
  } catch {
    return false
  }
}

/** Reactively tracks the OS/browser "reduce motion" preference — used to
 * skip or tone down purely decorative animation (the opening sequence,
 * album-art tilt) for users who've asked for less of it. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getPrefersReducedMotion)

  useEffect(() => {
    let mediaQuery: MediaQueryList | undefined
    try {
      mediaQuery = window.matchMedia(QUERY)
    } catch {
      return
    }
    if (typeof mediaQuery.addEventListener !== 'function') return

    const handleChange = () => setReduced(mediaQuery!.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery!.removeEventListener('change', handleChange)
  }, [])

  return reduced
}
