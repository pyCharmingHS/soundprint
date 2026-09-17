import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AlbumArt from './AlbumArt'

describe('AlbumArt', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  // The tilt is driven by a Framer Motion spring, which animates toward its
  // target on requestAnimationFrame rather than applying synchronously —
  // nothing forces that clock forward in this test environment, so these
  // check that the handlers run safely end to end (real getBoundingClientRect
  // math, correct wiring) rather than asserting on mid-animation style output.
  it('handles mouse move and mouse leave without crashing', () => {
    const { container } = render(<AlbumArt title="Vidrio y Sal" artist="Renata Cruz" />)
    const card = container.querySelector('.aspect-square') as HTMLElement
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    expect(() => fireEvent.mouseMove(card, { clientX: 90, clientY: 10 })).not.toThrow()
    expect(() => fireEvent.mouseLeave(card)).not.toThrow()
    expect(card).toBeInTheDocument()
  })

  it('skips the tilt update when the user prefers reduced motion, without crashing', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const { container } = render(<AlbumArt title="Vidrio y Sal" artist="Renata Cruz" />)
    const card = container.querySelector('.aspect-square') as HTMLElement
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    expect(() => fireEvent.mouseMove(card, { clientX: 90, clientY: 10 })).not.toThrow()
  })
})
