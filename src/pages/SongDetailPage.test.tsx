import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import SongDetailPage from './SongDetailPage'

const THREE_SONGS = ['song-el-aguante', 'song-cuando-se-acaba-el-amor', 'song-a-te']

function renderAt(path: string, state?: unknown) {
  return render(
    <LocaleProvider>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route path="/song/:id" element={<SongDetailPage />} />
          <Route path="/pantheon" element={<p>the pantheon grid</p>} />
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

  it('shows a position indicator and steps forward through the list, wrapping at the end', async () => {
    renderAt('/song/song-el-aguante', { songIds: THREE_SONGS, returnTo: '/pantheon' })
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()

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
    renderAt('/song/song-el-aguante', { songIds: THREE_SONGS, returnTo: '/pantheon' })
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Previous song'))
    expect(await screen.findByText('A te')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('returns to the exact list view on Back when nav state is present', async () => {
    renderAt('/song/song-el-aguante', { songIds: THREE_SONGS, returnTo: '/pantheon' })
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/back/i))
    expect(await screen.findByText('the pantheon grid')).toBeInTheDocument()
  })
})
