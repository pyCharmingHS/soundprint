import { describe, expect, it } from 'vitest'
import type { Song } from '../types'
import { sortSongs } from './songSort'

function makeSong(overrides: Partial<Song> = {}): Song {
  return {
    id: overrides.id ?? 'song-x',
    title: 'Vidrio y Sal',
    artist: 'Renata Cruz',
    genres: [],
    listening: { plays: 0, minutes: 0 },
    personal: { isPantheon: false, categories: [], tags: [] },
    ...overrides,
  }
}

describe('sortSongs', () => {
  const songs = [
    makeSong({ id: 'a', title: 'Bravo', releaseYear: 2010 }),
    makeSong({ id: 'b', title: 'Alpha', releaseYear: 1990 }),
    makeSong({ id: 'c', title: 'Charlie' }), // no releaseYear
  ]

  it('leaves the order untouched for "curated"', () => {
    expect(sortSongs(songs, 'curated').map((s) => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('sorts by title ascending', () => {
    expect(sortSongs(songs, 'title-asc').map((s) => s.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts by title descending', () => {
    expect(sortSongs(songs, 'title-desc').map((s) => s.id)).toEqual(['c', 'a', 'b'])
  })

  it('sorts by year ascending, with missing years sinking to the bottom', () => {
    expect(sortSongs(songs, 'year-asc').map((s) => s.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts by year descending, with missing years still sinking to the bottom', () => {
    expect(sortSongs(songs, 'year-desc').map((s) => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the original array', () => {
    const original = [...songs]
    sortSongs(songs, 'title-asc')
    expect(songs).toEqual(original)
  })
})
