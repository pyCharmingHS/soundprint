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

  it('falls back to a title/artist initials monogram when there is no src', () => {
    render(<AlbumArt title="Vidrio y Sal" artist="Renata Cruz" />)
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Vidrio y Sal by Renata Cruz' })).toBeInTheDocument()
  })
})
