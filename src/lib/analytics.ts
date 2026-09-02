import type { Song } from '../types'

const DAY_MS = 1000 * 60 * 60 * 24
const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export interface Totals {
  totalPlays: number
  totalMinutes: number
  songCount: number
  artistCount: number
  albumCount: number
}

export function computeTotals(songs: Song[]): Totals {
  return {
    totalPlays: songs.reduce((sum, s) => sum + s.listening.plays, 0),
    totalMinutes: songs.reduce((sum, s) => sum + s.listening.minutes, 0),
    songCount: songs.length,
    artistCount: new Set(songs.map((s) => s.artist)).size,
    albumCount: new Set(songs.map((s) => s.album).filter(Boolean)).size,
  }
}

export function topSongsByPlays(songs: Song[], limit = 5): Song[] {
  return [...songs]
    .sort((a, b) => b.listening.plays - a.listening.plays)
    .slice(0, limit)
}

export interface ArtistStat {
  artist: string
  plays: number
  minutes: number
  songCount: number
}

export function topArtists(songs: Song[], limit = 5): ArtistStat[] {
  const byArtist = new Map<string, ArtistStat>()
  for (const song of songs) {
    const stat = byArtist.get(song.artist) ?? {
      artist: song.artist,
      plays: 0,
      minutes: 0,
      songCount: 0,
    }
    stat.plays += song.listening.plays
    stat.minutes += song.listening.minutes
    stat.songCount += 1
    byArtist.set(song.artist, stat)
  }
  return [...byArtist.values()].sort((a, b) => b.plays - a.plays).slice(0, limit)
}

export interface GenreStat {
  genre: string
  plays: number
  songCount: number
}

export function topGenres(songs: Song[], limit = 5): GenreStat[] {
  const byGenre = new Map<string, GenreStat>()
  for (const song of songs) {
    for (const genre of song.genres) {
      const stat = byGenre.get(genre) ?? { genre, plays: 0, songCount: 0 }
      stat.plays += song.listening.plays
      stat.songCount += 1
      byGenre.set(genre, stat)
    }
  }
  return [...byGenre.values()].sort((a, b) => b.plays - a.plays).slice(0, limit)
}

export function aggregateByHour(songs: Song[]): Record<string, number> {
  const hours: Record<string, number> = {}
  for (let h = 0; h < 24; h++) hours[String(h)] = 0
  for (const song of songs) {
    for (const [hour, plays] of Object.entries(song.listening.playsByHour ?? {})) {
      hours[hour] = (hours[hour] ?? 0) + plays
    }
  }
  return hours
}

export function aggregateByDay(songs: Song[]): Record<string, number> {
  const days: Record<string, number> = Object.fromEntries(WEEKDAYS.map((d) => [d, 0]))
  for (const song of songs) {
    for (const [day, plays] of Object.entries(song.listening.playsByDay ?? {})) {
      days[day] = (days[day] ?? 0) + plays
    }
  }
  return days
}

export { WEEKDAYS }

export interface TimelineEntry {
  year: number
  songCount: number
  plays: number
}

/**
 * Grouped by the year each song was first heard, since per-event history
 * (needed for a true plays-over-time timeline) isn't available until the
 * real listening-event pipeline lands in Phase 6.
 */
export function discoveryTimeline(songs: Song[]): TimelineEntry[] {
  const byYear = new Map<number, TimelineEntry>()
  for (const song of songs) {
    if (!song.listening.firstListened) continue
    const year = new Date(song.listening.firstListened).getFullYear()
    const entry = byYear.get(year) ?? { year, songCount: 0, plays: 0 }
    entry.songCount += 1
    entry.plays += song.listening.plays
    byYear.set(year, entry)
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year)
}

export interface GenreYearEntry {
  year: number
  genres: string[]
}

/** Which genres entered the collection each year, based on first-listened year. */
export function genresByYear(songs: Song[]): GenreYearEntry[] {
  const byYear = new Map<number, Set<string>>()
  for (const song of songs) {
    if (!song.listening.firstListened) continue
    const year = new Date(song.listening.firstListened).getFullYear()
    const set = byYear.get(year) ?? new Set<string>()
    for (const genre of song.genres) set.add(genre)
    byYear.set(year, set)
  }
  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, genres]) => ({ year, genres: [...genres] }))
}

export function longevityDays(song: Song): number | undefined {
  const { firstListened, lastListened } = song.listening
  if (!firstListened || !lastListened) return undefined
  return Math.max(
    1,
    (new Date(lastListened).getTime() - new Date(firstListened).getTime()) / DAY_MS,
  )
}

export function recencyDays(song: Song, now: Date = new Date()): number | undefined {
  if (!song.listening.lastListened) return undefined
  return (now.getTime() - new Date(song.listening.lastListened).getTime()) / DAY_MS
}

/** Plays per day across the song's listening life. Higher = disproportionately replayed. */
export function replayIntensity(song: Song): number | undefined {
  const days = longevityDays(song)
  if (days === undefined) return undefined
  return song.listening.plays / days
}

export function topByReplayIntensity(songs: Song[], limit = 5): Song[] {
  return [...songs]
    .filter((s) => replayIntensity(s) !== undefined)
    .sort((a, b) => (replayIntensity(b) ?? 0) - (replayIntensity(a) ?? 0))
    .slice(0, limit)
}

const OBSESSION_WINDOW_DAYS = 14
const OBSESSION_MIN_PLAYS = 10

/** A song heavily replayed in a short, recent window. Null if nothing currently qualifies. */
export function findCurrentObsession(songs: Song[], now: Date = new Date()): Song | null {
  const candidates = songs.filter((song) => {
    const longevity = longevityDays(song)
    const recency = recencyDays(song, now)
    return (
      longevity !== undefined &&
      recency !== undefined &&
      longevity <= OBSESSION_WINDOW_DAYS &&
      recency <= OBSESSION_WINDOW_DAYS &&
      song.listening.plays >= OBSESSION_MIN_PLAYS
    )
  })
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => (replayIntensity(b) ?? 0) - (replayIntensity(a) ?? 0))[0]
}

function normalize(value: number, min: number, max: number): number {
  return max === min ? 0 : (value - min) / (max - min)
}

function minMax(values: number[]): [number, number] {
  return [Math.min(...values), Math.max(...values)]
}

// A song with plays but no listening dates (e.g. a brand-new stub from
// generate_public_data.py) is "as unrecent as possible" for ranking
// purposes. Using -Infinity here breaks normalize() with NaN whenever it's
// also the min of the batch — (-Infinity - -Infinity) is NaN — so a large
// finite sentinel is used instead.
const UNKNOWN_RECENCY_DAYS = -1_000_000

export interface PantheonCandidate {
  song: Song
  score: number
}

/**
 * A discovery signal for songs that behave like Pantheon songs but aren't
 * marked as one yet — combines plays, longevity, replay intensity, and
 * recency. This never determines Pantheon membership; that's a human call.
 */
export function pantheonCandidates(
  songs: Song[],
  limit = 5,
  now: Date = new Date(),
): PantheonCandidate[] {
  const candidates = songs
    .filter((s) => !s.personal.isPantheon)
    .map((song) => ({
      song,
      plays: song.listening.plays,
      longevity: longevityDays(song) ?? 0,
      replay: replayIntensity(song) ?? 0,
      recency: song.listening.lastListened
        ? -(recencyDays(song, now) ?? 0)
        : UNKNOWN_RECENCY_DAYS,
    }))

  if (candidates.length === 0) return []

  const playsRange = minMax(candidates.map((c) => c.plays))
  const longevityRange = minMax(candidates.map((c) => c.longevity))
  const replayRange = minMax(candidates.map((c) => c.replay))
  const recencyRange = minMax(candidates.map((c) => c.recency))

  return candidates
    .map((c) => ({
      song: c.song,
      score:
        (normalize(c.plays, ...playsRange) +
          normalize(c.longevity, ...longevityRange) +
          normalize(c.replay, ...replayRange) +
          normalize(c.recency, ...recencyRange)) /
        4,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
