import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import type { Category, Song } from '../types'
import OrbitalPantheon from './OrbitalPantheon'

const categories: Category[] = [
  { id: 'thinkers', name: { en: 'The Thinkers' }, emoji: '🧠' },
  { id: 'hurts', name: { en: 'The Hurts' }, emoji: '💔' },
]

const songs: Song[] = [
  {
    id: 'song-1',
    title: 'Song One',
    artist: 'Artist One',
    genres: [],
    listening: { plays: 1, minutes: 3 },
    personal: { isPantheon: true, categories: ['thinkers'], tags: [] },
  },
  {
    id: 'song-2',
    title: 'Song Two',
    artist: 'Artist Two',
    genres: [],
    listening: { plays: 1, minutes: 3 },
    personal: { isPantheon: true, categories: ['hurts'], tags: [] },
  },
]

function renderOrbital(activeCategory: string | null, onSelectCategory = vi.fn()) {
  return {
    onSelectCategory,
    ...render(
      <LocaleProvider>
        <MemoryRouter>
          <OrbitalPantheon
            categories={categories}
            songs={songs}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
          />
        </MemoryRouter>
      </LocaleProvider>,
    ),
  }
}

describe('OrbitalPantheon', () => {
  it('renders a planet button per category', () => {
    renderOrbital(null)
    expect(screen.getByTitle(/The Thinkers/)).toBeInTheDocument()
    expect(screen.getByTitle(/The Hurts/)).toBeInTheDocument()
  })

  it('calls onSelectCategory when a planet is clicked', () => {
    const { onSelectCategory } = renderOrbital(null)
    fireEvent.click(screen.getByTitle(/The Thinkers/))
    expect(onSelectCategory).toHaveBeenCalledWith('thinkers')
  })

  it('renders a moon link for each song in the active category', () => {
    renderOrbital('thinkers')
    expect(screen.getByTitle('Song One — Artist One')).toBeInTheDocument()
    expect(screen.queryByTitle('Song Two — Artist Two')).not.toBeInTheDocument()
  })
})
