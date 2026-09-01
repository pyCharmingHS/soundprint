export type Platform = 'apple_music' | 'youtube_music'

export interface ListeningEvent {
  id: string
  timestamp: string
  songId: string
  artistId?: string
  platform: Platform
  durationPlayed?: number
  sourceId?: string
  sourceMetadata?: Record<string, unknown>
}
