import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Song } from '../types'
import SongRow from './SongRow'

const song: Song = {
  id: 'song-x',
  title: 'Vidrio y Sal',
  artist: 'Renata Cruz',
  releaseYear: 1998,
  genres: [],
  listening: { plays: 0, minutes: 0 },
  personal: { isPantheon: false, categories: [], tags: [] },
}

describe('SongRow', () => {
  it('renders the title, artist, and links to the song', () => {
    render(
      <MemoryRouter>
        <SongRow song={song} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Vidrio y Sal')).toBeInTheDocument()
    expect(screen.getByText('Renata Cruz')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/song/song-x')
  })

  it('shows the release year only when showYear is set', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SongRow song={song} />
      </MemoryRouter>,
    )
    expect(screen.queryByText('1998')).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <SongRow song={song} showYear />
      </MemoryRouter>,
    )
    expect(screen.getByText('1998')).toBeInTheDocument()
  })

  it('renders without crashing when glowing', () => {
    expect(() =>
      render(
        <MemoryRouter>
          <SongRow song={song} glow />
        </MemoryRouter>,
      ),
    ).not.toThrow()
  })
})
