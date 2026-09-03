import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Song } from '../types'
import EmotionalLandscape from './EmotionalLandscape'

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

function renderWithRouter(songs: Song[]) {
  return render(
    <MemoryRouter>
      <EmotionalLandscape songs={songs} />
    </MemoryRouter>,
  )
}

describe('EmotionalLandscape', () => {
  it('renders nothing when no song has both meaning and emotionalIntensity', () => {
    const songs = [
      makeSong({ id: 'a', personal: { isPantheon: true, categories: [], tags: [], meaning: 8 } }),
    ]
    const { container } = renderWithRouter(songs)
    expect(container).toBeEmptyDOMElement()
  })

  it('plots one point per qualifying song, skipping songs missing an axis', () => {
    const plottable = makeSong({
      id: 'plottable',
      title: 'Plottable Song',
      personal: {
        isPantheon: true,
        categories: [],
        tags: [],
        meaning: 8,
        emotionalIntensity: 6,
      },
    })
    const missingAxis = makeSong({
      id: 'missing-axis',
      personal: { isPantheon: true, categories: [], tags: [], meaning: 5 },
    })

    const { container } = renderWithRouter([plottable, missingAxis])
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(1)
    expect(container.querySelector('title')?.textContent).toBe('Plottable Song')
  })

  it('defaults missing nostalgia/rating to a mid-range value rather than excluding the song', () => {
    const song = makeSong({
      id: 'no-extras',
      personal: { isPantheon: true, categories: [], tags: [], meaning: 5, emotionalIntensity: 5 },
    })
    const { container } = renderWithRouter([song])
    const circle = container.querySelector('circle')
    expect(circle).not.toBeNull()
    expect(circle?.getAttribute('r')).toBe('8') // 4 + (5/10)*8
  })
})
