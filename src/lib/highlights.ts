import type { Category, Song } from '../types'

/**
 * Picks a small, deliberately varied sample of Pantheon songs for a
 * first-time visitor who may never click past the homepage — one per
 * category (in category order), preferring a song whose genre hasn't
 * been shown yet so the sample reads as broad, not just "meaningful."
 */
export function curatedHighlights(
  songs: Song[],
  categories: Category[],
  limit = 4,
): Song[] {
  const pantheon = songs.filter((s) => s.personal.isPantheon)
  const picked: Song[] = []
  const usedGenres = new Set<string>()

  for (const category of categories) {
    if (picked.length >= limit) break

    const candidates = pantheon.filter(
      (s) => s.personal.categories.includes(category.id) && !picked.includes(s),
    )
    if (candidates.length === 0) continue

    const fresh = candidates.find((s) => s.genres.some((g) => !usedGenres.has(g)))
    const choice = fresh ?? candidates[0]

    picked.push(choice)
    for (const genre of choice.genres) usedGenres.add(genre)
  }

  return picked
}
