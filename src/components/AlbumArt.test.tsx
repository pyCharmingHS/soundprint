import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AlbumArt from './AlbumArt'

describe('AlbumArt', () => {
  it('renders an image when a src is provided', () => {
    render(<AlbumArt src="https://example.com/art.jpg" title="Vidrio y Sal" artist="Renata Cruz" />)
    const img = screen.getByRole('img', { name: 'Vidrio y Sal by Renata Cruz' })
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', 'https://example.com/art.jpg')
  })

  it('falls back to a generative pattern when there is no src', () => {
    const { container } = render(<AlbumArt title="Vidrio y Sal" artist="Renata Cruz" />)
    expect(screen.getByRole('img', { name: 'Vidrio y Sal by Renata Cruz' })).toBeInTheDocument()
    // 1 background rect + 4 shapes (circle/triangle/rectangle mix)
    expect(container.querySelectorAll('circle, polygon, rect').length).toBe(5)
  })
})
