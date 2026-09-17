import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ParallaxLayer from './ParallaxLayer'

describe('ParallaxLayer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders its children', () => {
    render(
      <ParallaxLayer>
        <p>content</p>
      </ParallaxLayer>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('renders without crashing when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    render(
      <ParallaxLayer offset={50}>
        <p>content</p>
      </ParallaxLayer>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
