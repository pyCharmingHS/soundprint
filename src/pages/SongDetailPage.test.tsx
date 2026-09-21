import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import SongDetailPage from './SongDetailPage'

const THREE_SONGS = ['song-el-aguante', 'song-cuando-se-acaba-el-amor', 'song-a-te']

function PantheonStub() {
  const location = useLocation()
  const highlightId =
    location.state && typeof location.state === 'object' && 'highlightSongId' in location.state
      ? (location.state as { highlightSongId: string }).highlightSongId
      : 'none'
  return <p>the pantheon grid (highlight: {highlightId})</p>
}

function renderAt(path: string, state?: unknown) {
  return render(
    <LocaleProvider>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route path="/song/:id" element={<SongDetailPage />} />
          <Route path="/pantheon" element={<PantheonStub />} />
        </Routes>
      </MemoryRouter>
    </LocaleProvider>,
  )
}

describe('SongDetailPage navigation', () => {
  it('shows no Prev/Next controls without a nav-list in router state', async () => {
    renderAt('/song/song-el-aguante')
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()
    expect(screen.queryByLabelText('Next song')).not.toBeInTheDocument()
  })

  it('shows a position indicator (with the list label) and steps forward through the list, wrapping at the end', async () => {
    renderAt('/song/song-el-aguante', {
      songIds: THREE_SONGS,
      returnTo: '/pantheon',
      listLabel: 'The Thinkers',
    })
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByText('· The Thinkers')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Next song'))
    expect(await screen.findByText('Cuando Se Acaba el Amor')).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Next song'))
    expect(await screen.findByText('A te')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()

    // Wraps back to the first song.
    fireEvent.click(screen.getByLabelText('Next song'))
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('steps backward and wraps at the start', async () => {
    renderAt('/song/song-el-aguante', {
      songIds: THREE_SONGS,
      returnTo: '/pantheon',
      listLabel: 'The Thinkers',
    })
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Previous song'))
    expect(await screen.findByText('A te')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('returns to the exact list view on Back, carrying which song to highlight', async () => {
    renderAt('/song/song-el-aguante', {
      songIds: THREE_SONGS,
      returnTo: '/pantheon',
      listLabel: 'The Thinkers',
    })
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/back/i))
    expect(
      await screen.findByText('the pantheon grid (highlight: song-el-aguante)'),
    ).toBeInTheDocument()
  })

  it('highlights whichever song Back was pressed from after moving with Next', async () => {
    renderAt('/song/song-el-aguante', {
      songIds: THREE_SONGS,
      returnTo: '/pantheon',
      listLabel: 'The Thinkers',
    })
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Next song'))
    expect(await screen.findByText('Cuando Se Acaba el Amor')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/back/i))
    expect(
      await screen.findByText('the pantheon grid (highlight: song-cuando-se-acaba-el-amor)'),
    ).toBeInTheDocument()
  })
})
