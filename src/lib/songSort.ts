import type { Song } from '../types'

export type SongSortOption = 'curated' | 'title-asc' | 'title-desc' | 'year-asc' | 'year-desc'

export const SONG_SORT_OPTIONS: SongSortOption[] = [
  'curated',
  'title-asc',
  'title-desc',
  'year-asc',
  'year-desc',
]

// A song with no releaseYear always sinks to the bottom of a year sort,
// regardless of direction, rather than jumping to the top on "newest first".
function compareByYear(a: Song, b: Song, direction: 1 | -1): number {
  if (a.releaseYear === undefined && b.releaseYear === undefined) return 0
  if (a.releaseYear === undefined) return 1
  if (b.releaseYear === undefined) return -1
  return (a.releaseYear - b.releaseYear) * direction
}

/** `'curated'` preserves the incoming order (the Pantheon's own rank / added-date
 * sort) — every other option re-sorts a copy of the list. */
export function sortSongs(songs: Song[], sort: SongSortOption): Song[] {
  switch (sort) {
    case 'title-asc':
      return [...songs].sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return [...songs].sort((a, b) => b.title.localeCompare(a.title))
    case 'year-asc':
      return [...songs].sort((a, b) => compareByYear(a, b, 1))
    case 'year-desc':
      return [...songs].sort((a, b) => compareByYear(a, b, -1))
    case 'curated':
    default:
      return songs
  }
}
