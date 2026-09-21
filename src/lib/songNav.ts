/**
 * Carried in router `state` when linking from a list of songs (the Pantheon
 * grid, Home's highlights, etc.) to a single song, so the detail page knows
 * what list it came from — letting it show Prev/Next through that exact
 * list and a "back to where you were" link, instead of just a generic
 * browser-history pop. `listLabel` names *why* this particular set of songs
 * (e.g. "The Thinkers", "hip hop", "1980s") — the answer to "why 5 songs
 * and not all of them" while browsing via Prev/Next.
 */
export interface SongNavState {
  songIds: string[]
  returnTo: string
  listLabel: string
}

export function isSongNavState(value: unknown): value is SongNavState {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as SongNavState).songIds) &&
    typeof (value as SongNavState).returnTo === 'string' &&
    typeof (value as SongNavState).listLabel === 'string'
  )
}

/** Carried back from the song detail page's Back button so the list view
 * knows which card to glow — "so you know where you were". */
export interface BackNavState {
  highlightSongId: string
}

export function isBackNavState(value: unknown): value is BackNavState {
  return (
    !!value && typeof value === 'object' && typeof (value as BackNavState).highlightSongId === 'string'
  )
}
