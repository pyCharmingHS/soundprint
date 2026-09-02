import { describe, expect, it } from 'vitest'
import type { Song } from '../types'
import { streamingLinks } from './streaming'

function makeSong(overrides: Partial<Song> = {}): Song {
  return {
    id: 'song-x',
    title: 'Vidrio y Sal',
    artist: 'Renata Cruz',
    genres: [],
    listening: { plays: 0, minutes: 0 },
    personal: { isPantheon: false, categories: [], tags: [] },
    ...overrides,
  }
}

describe('streamingLinks', () => {
  it('falls back to search URLs when no platform ids are set', () => {
    const links = streamingLinks(makeSong())
    const byLabel = Object.fromEntries(links.map((l) => [l.label, l.url]))

    expect(byLabel['Apple Music']).toBe('https://music.apple.com/search?term=Vidrio%20y%20Sal%20Renata%20Cruz')
    expect(byLabel['YouTube Music']).toBe('https://music.youtube.com/search?q=Vidrio%20y%20Sal%20Renata%20Cruz')
    expect(byLabel['Spotify']).toBe('https://open.spotify.com/search/Vidrio%20y%20Sal%20Renata%20Cruz')
  })

  it('uses a direct link when a platform id is present', () => {
    const links = streamingLinks(
      makeSong({ appleMusicId: 'apple-123', youtubeMusicId: 'yt-abc' }),
    )
    const byLabel = Object.fromEntries(links.map((l) => [l.label, l.url]))

    expect(byLabel['Apple Music']).toBe('https://music.apple.com/song/apple-123')
    expect(byLabel['YouTube Music']).toBe('https://music.youtube.com/watch?v=yt-abc')
  })

  it('always returns exactly one link per platform', () => {
    expect(streamingLinks(makeSong())).toHaveLength(3)
  })
})
