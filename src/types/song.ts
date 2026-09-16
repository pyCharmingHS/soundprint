import type { LocalizedString } from '../i18n/locale'

export interface SongListening {
  plays: number
  minutes: number
  firstListened?: string
  lastListened?: string
  playsByHour?: Record<string, number>
  playsByDay?: Record<string, number>
  playsByMonth?: Record<string, number>
  playsByYear?: Record<string, number>
}

export interface SongPersonal {
  isPantheon: boolean
  pantheonRank?: number
  categories: string[]
  tags: string[]
  rating?: number
  emotionalIntensity?: number
  nostalgia?: number
  meaning?: number
  why?: LocalizedString
  memories?: LocalizedString
  addedToPantheon?: string
}

export interface Song {
  id: string

  // Objective metadata
  title: string
  artist: string
  album?: string
  artwork?: string
  duration?: number
  releaseDate?: string
  genres: string[]

  // External identifiers
  appleMusicId?: string
  youtubeMusicId?: string

  // Listening analytics
  listening: SongListening

  // Subjective curation
  personal: SongPersonal
}
