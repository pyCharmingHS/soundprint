import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AlbumArtPattern from './AlbumArtPattern'

describe('AlbumArtPattern', () => {
  it('renders the same pattern for the same title/artist', () => {
    const a = render(<AlbumArtPattern title="El Aguante" artist="Calle 13" alt="alt" />)
    const b = render(<AlbumArtPattern title="El Aguante" artist="Calle 13" alt="alt" />)
    expect(a.container.innerHTML).toBe(b.container.innerHTML)
  })

  it('renders a different pattern for a different song', () => {
    const a = render(<AlbumArtPattern title="El Aguante" artist="Calle 13" alt="alt" />)
    const b = render(
      <AlbumArtPattern title="Cuando Se Acaba el Amor" artist="Guillermo Dávila" alt="alt" />,
    )
    expect(a.container.innerHTML).not.toBe(b.container.innerHTML)
  })

  it('applies the accessible label', () => {
    const { getByRole } = render(<AlbumArtPattern title="X" artist="Y" alt="X by Y" />)
    expect(getByRole('img', { name: 'X by Y' })).toBeInTheDocument()
  })

  it('uses more than one shape type across a range of songs', () => {
    const songs = Array.from({ length: 15 }, (_, i) => ({
      title: `Song ${i}`,
      artist: `Artist ${i}`,
    }))

    const tagNames = new Set<string>()
    for (const song of songs) {
      const { container, unmount } = render(
        <AlbumArtPattern title={song.title} artist={song.artist} alt="alt" />,
      )
      // skip the background rect (always index 0) — only care about the 4 shapes
      const shapeEls = Array.from(container.querySelectorAll('circle, polygon, rect')).slice(1)
      for (const el of shapeEls) tagNames.add(el.tagName.toLowerCase())
      unmount()
    }

    expect(tagNames.size).toBeGreaterThan(1)
  })
})
