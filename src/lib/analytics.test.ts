import { describe, expect, it } from 'vitest'
import type { Song } from '../types'
import {
  aggregateByDay,
  aggregateByHour,
  computeTotals,
  discoveryTimeline,
  findCurrentObsession,
  genresByYear,
  longevityDays,
  pantheonCandidates,
  recencyDays,
  replayIntensity,
  topArtists,
  topByReplayIntensity,
  topGenres,
  topSongsByPlays,
  WEEKDAYS,
} from './analytics'

const DAY_MS = 1000 * 60 * 60 * 24
const NOW = new Date('2026-09-02T00:00:00.000Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY_MS).toISOString()

function makeSong(overrides: Partial<Song> & Pick<Song, 'id'>): Song {
  return {
    title: overrides.id,
    artist: 'Unknown Artist',
    genres: [],
    listening: { plays: 0, minutes: 0 },
    personal: { isPantheon: false, categories: [], tags: [] },
    ...overrides,
  }
}

const mostPlayed = makeSong({
  id: 'most-played',
  artist: 'Artist A',
  genres: ['trap'],
  listening: {
    plays: 300,
    minutes: 900,
    firstListened: daysAgo(2400),
    lastListened: daysAgo(2200),
  },
})

const pantheonOld = makeSong({
  id: 'pantheon-old',
  artist: 'Artist B',
  genres: ['ballad'],
  listening: {
    plays: 10,
    minutes: 40,
    firstListened: daysAgo(3000),
    lastListened: daysAgo(2990),
  },
  personal: { isPantheon: true, categories: ['hurts'], tags: [] },
})

const obsession = makeSong({
  id: 'obsession',
  artist: 'Artist C',
  genres: ['trap', 'reggaeton'],
  listening: {
    plays: 20,
    minutes: 60,
    firstListened: daysAgo(5),
    lastListened: daysAgo(1),
  },
})

const candidate = makeSong({
  id: 'candidate',
  artist: 'Artist A',
  genres: ['trap'],
  listening: {
    plays: 150,
    minutes: 450,
    firstListened: daysAgo(200),
    lastListened: daysAgo(2),
  },
})

// No firstListened/lastListened at all — exactly what a brand-new song
// stub from generate_public_data.py looks like before real listening
// history exists for it.
const noDates = makeSong({
  id: 'no-dates',
  artist: 'Artist D',
  genres: ['folk'],
  listening: { plays: 5, minutes: 10 },
})

const allSongs = [mostPlayed, pantheonOld, obsession, candidate, noDates]

describe('computeTotals', () => {
  it('sums plays/minutes and counts distinct artists and albums', () => {
    const totals = computeTotals(allSongs)
    expect(totals.totalPlays).toBe(300 + 10 + 20 + 150 + 5)
    expect(totals.totalMinutes).toBe(900 + 40 + 60 + 450 + 10)
    expect(totals.songCount).toBe(5)
    expect(totals.artistCount).toBe(4) // Artist A appears twice
    expect(totals.albumCount).toBe(0) // none of the fixtures set `album`
  })
})

describe('topSongsByPlays', () => {
  it('sorts descending by plays and respects the limit', () => {
    const top = topSongsByPlays(allSongs, 3)
    expect(top.map((s) => s.id)).toEqual(['most-played', 'candidate', 'obsession'])
  })
})

describe('topArtists', () => {
  it('aggregates plays/minutes/songCount per artist', () => {
    const top = topArtists(allSongs)
    const artistA = top.find((a) => a.artist === 'Artist A')
    expect(artistA).toEqual({ artist: 'Artist A', plays: 450, minutes: 1350, songCount: 2 })
    expect(top.map((a) => a.artist)).toEqual(['Artist A', 'Artist C', 'Artist B', 'Artist D'])
  })
})

describe('topGenres', () => {
  it('aggregates plays per genre across songs that share it', () => {
    const genres = topGenres(allSongs)
    expect(genres).toEqual([
      { genre: 'trap', plays: 300 + 20 + 150, songCount: 3 },
      { genre: 'reggaeton', plays: 20, songCount: 1 },
      { genre: 'ballad', plays: 10, songCount: 1 },
      { genre: 'folk', plays: 5, songCount: 1 },
    ])
  })
})

describe('aggregateByHour / aggregateByDay', () => {
  it('returns every hour/day represented, even with no data', () => {
    const hours = aggregateByHour(allSongs)
    expect(Object.keys(hours)).toHaveLength(24)
    expect(Object.values(hours).every((v) => v === 0)).toBe(true)

    const days = aggregateByDay(allSongs)
    expect(Object.keys(days)).toEqual(WEEKDAYS)
    expect(Object.values(days).every((v) => v === 0)).toBe(true)
  })

  it('sums contributions from multiple songs for the same slot', () => {
    const a = makeSong({
      id: 'a',
      listening: { plays: 5, minutes: 10, playsByHour: { '23': 5 }, playsByDay: { Friday: 5 } },
    })
    const b = makeSong({
      id: 'b',
      listening: { plays: 7, minutes: 10, playsByHour: { '23': 7 }, playsByDay: { Friday: 7 } },
    })
    expect(aggregateByHour([a, b])['23']).toBe(12)
    expect(aggregateByDay([a, b]).Friday).toBe(12)
  })
})

describe('discoveryTimeline', () => {
  it('groups by first-listened year and skips songs with no firstListened', () => {
    const timeline = discoveryTimeline(allSongs)
    const years = timeline.map((e) => e.year)
    expect(years).toEqual([...years].sort((a, b) => a - b)) // chronological
    expect(years).not.toContain(undefined)
    expect(timeline.reduce((sum, e) => sum + e.songCount, 0)).toBe(4) // noDates excluded

    const currentYearEntry = timeline.find((e) => e.year === NOW.getFullYear())
    // obsession (5 days ago) and candidate (200 days ago) both land in NOW's year
    expect(currentYearEntry?.songCount).toBe(2)
    expect(currentYearEntry?.plays).toBe(20 + 150)
  })
})

describe('genresByYear', () => {
  it('merges genres from songs discovered in the same year', () => {
    const entries = genresByYear(allSongs)
    const currentYearEntry = entries.find((e) => e.year === NOW.getFullYear())
    expect(currentYearEntry?.genres.sort()).toEqual(['reggaeton', 'trap'])
  })
})

describe('longevityDays / recencyDays / replayIntensity', () => {
  it('computes exact day differences and returns undefined when dates are missing', () => {
    expect(longevityDays(obsession)).toBe(4)
    expect(recencyDays(obsession, NOW)).toBe(1)
    expect(replayIntensity(obsession)).toBe(20 / 4)

    expect(longevityDays(noDates)).toBeUndefined()
    expect(recencyDays(noDates, NOW)).toBeUndefined()
    expect(replayIntensity(noDates)).toBeUndefined()
  })

  it('floors longevity at 1 day to avoid divide-by-zero for same-day plays', () => {
    const sameDay = makeSong({
      id: 'same-day',
      listening: {
        plays: 3,
        minutes: 9,
        firstListened: '2026-01-01T10:00:00.000Z',
        lastListened: '2026-01-01T11:00:00.000Z',
      },
    })
    expect(longevityDays(sameDay)).toBe(1)
  })
})

describe('topByReplayIntensity', () => {
  it('ranks by plays-per-day and excludes songs without listening dates', () => {
    const top = topByReplayIntensity(allSongs, 3)
    expect(top.map((s) => s.id)).toEqual(['obsession', 'most-played', 'pantheon-old'])
    expect(top.some((s) => s.id === 'no-dates')).toBe(false)
  })
})

describe('findCurrentObsession', () => {
  it('finds a song with a short, recent, high-play window', () => {
    expect(findCurrentObsession(allSongs, NOW)?.id).toBe('obsession')
  })

  it('returns null when nothing qualifies', () => {
    expect(findCurrentObsession([mostPlayed, pantheonOld], NOW)).toBeNull()
  })
})

describe('pantheonCandidates', () => {
  it('excludes Pantheon songs and never throws or produces NaN scores', () => {
    const results = pantheonCandidates(allSongs, 10, NOW)
    expect(results.some((r) => r.song.id === 'pantheon-old')).toBe(false)
    expect(results).toHaveLength(4)
    for (const r of results) {
      expect(Number.isNaN(r.score)).toBe(false)
    }
  })

  it('ranks a song with no listening history behind dated songs', () => {
    const results = pantheonCandidates(allSongs, 10, NOW)
    const noDatesIndex = results.findIndex((r) => r.song.id === 'no-dates')
    expect(noDatesIndex).toBe(results.length - 1)
  })
})
