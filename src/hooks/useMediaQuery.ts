import { useEffect, useState } from 'react'

function getMatches(query: string): boolean {
  try {
    return window.matchMedia(query).matches
  } catch {
    return false
  }
}

/** Reactively tracks an arbitrary CSS media query (e.g. a min-width breakpoint). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    let mediaQuery: MediaQueryList | undefined
    try {
      mediaQuery = window.matchMedia(query)
    } catch {
      return
    }
    setMatches(mediaQuery.matches)
    if (typeof mediaQuery.addEventListener !== 'function') return

    const handleChange = () => setMatches(mediaQuery!.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery!.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
