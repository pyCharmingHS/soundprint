import categoriesData from '../data/public/categories.json'
import songsData from '../data/public/songs.json'
import type { Category, Song } from '../types'

// Async on purpose: V1 resolves this synchronously-imported JSON immediately,
// but V2 can swap the implementation for a real API call without touching callers.
export async function loadSongs(): Promise<Song[]> {
  return songsData as Song[]
}

export async function loadCategories(): Promise<Category[]> {
  return categoriesData as Category[]
}
