/**
 * Carried in router `state` when linking from a list of songs (the Pantheon
 * grid, Home's highlights, etc.) to a single song, so the detail page knows
 * what list it came from — letting it show Prev/Next through that exact
 * list and a "back to where you were" link, instead of just a generic
 * browser-history pop.
 */
export interface SongNavState {
  songIds: string[]
  returnTo: string
}

export function isSongNavState(value: unknown): value is SongNavState {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as SongNavState).songIds) &&
    typeof (value as SongNavState).returnTo === 'string'
  )
}
