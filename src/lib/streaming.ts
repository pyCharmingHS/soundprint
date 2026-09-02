import type { Song } from '../types'

export interface StreamingLink {
  label: string
  url: string
}

/**
 * Direct link when we have a platform id, otherwise a search URL — most
 * songs won't have ids until Phase 7's real import pipeline populates them.
 */
export function streamingLinks(song: Song): StreamingLink[] {
  const query = encodeURIComponent(`${song.title} ${song.artist}`)

  return [
    {
      label: 'Apple Music',
      url: song.appleMusicId
        ? `https://music.apple.com/song/${song.appleMusicId}`
        : `https://music.apple.com/search?term=${query}`,
    },
    {
      label: 'Spotify',
      url: `https://open.spotify.com/search/${query}`,
    },
    {
      label: 'YouTube Music',
      url: song.youtubeMusicId
        ? `https://music.youtube.com/watch?v=${song.youtubeMusicId}`
        : `https://music.youtube.com/search?q=${query}`,
    },
  ]
}
