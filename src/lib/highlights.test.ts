import { describe, expect, it } from 'vitest'
import type { Category, Song } from '../types'
import { curatedHighlights } from './highlights'

function makeSong(overrides: Partial<Song> & Pick<Song, 'id'>): Song {
  return {
    title: overrides.id,
    artist: 'Unknown Artist',
    genres: [],
    listening: { plays: 0, minutes: 0 },
    personal: { isPantheon: true, categories: [], tags: [] },
    ...overrides,
  }
}

const categories: Category[] = [
  { id: 'bangers', name: 'The Bangers' },
  { id: 'hurts', name: 'The Ones That Hurt' },
  { id: 'thinkers', name: 'The Thinkers' },
]

describe('curatedHighlights', () => {
  it('picks one song per category, in category order', () => {
    const bangerSong = makeSong({ id: 'a', genres: ['trap'], personal: { isPantheon: true, categories: ['bangers'], tags: [] } })
    const hurtsSong = makeSong({ id: 'b', genres: ['ballad'], personal: { isPantheon: true, categories: ['hurts'], tags: [] } })

    const result = curatedHighlights([hurtsSong, bangerSong], categories, 4)
    expect(result.map((s) => s.id)).toEqual(['a', 'b'])
  })

  it('excludes non-Pantheon songs', () => {
    const notPantheon = makeSong({
      id: 'a',
      genres: ['trap'],
      personal: { isPantheon: false, categories: ['bangers'], tags: [] },
    })
    expect(curatedHighlights([notPantheon], categories, 4)).toHaveLength(0)
  })

  it('prefers a song with an unseen genre over one that repeats a genre', () => {
    const repeatsGenre = makeSong({
      id: 'repeat',
      genres: ['trap'],
      personal: { isPantheon: true, categories: ['hurts'], tags: [] },
    })
    const freshGenre = makeSong({
      id: 'fresh',
      genres: ['ballad'],
      personal: { isPantheon: true, categories: ['hurts'], tags: [] },
    })
    const bangerSong = makeSong({
      id: 'banger',
      genres: ['trap'],
      personal: { isPantheon: true, categories: ['bangers'], tags: [] },
    })

    // 'trap' gets used up by the bangers pick, so hurts should prefer 'fresh'
    const result = curatedHighlights([bangerSong, repeatsGenre, freshGenre], categories, 4)
    expect(result.map((s) => s.id)).toEqual(['banger', 'fresh'])
  })

  it('respects the limit', () => {
    const songs = categories.map((c) =>
      makeSong({ id: c.id, personal: { isPantheon: true, categories: [c.id], tags: [] } }),
    )
    expect(curatedHighlights(songs, categories, 2)).toHaveLength(2)
  })

  it('never picks the same song twice even if it matches multiple categories', () => {
    const multiCategorySong = makeSong({
      id: 'multi',
      personal: { isPantheon: true, categories: ['bangers', 'hurts'], tags: [] },
    })
    const result = curatedHighlights([multiCategorySong], categories, 4)
    expect(result).toEqual([multiCategorySong])
  })
})
