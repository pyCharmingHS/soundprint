import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GLOW_DURATION_MS, useGlowAnimation } from './useGlowAnimation'

describe('useGlowAnimation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('has no shadow and no scale change when not glowing', () => {
    const { result } = renderHook(() => useGlowAnimation(false))
    expect(result.current.animate.boxShadow).toBe('0 0 0 0px rgba(201,162,75,0)')
    expect(result.current.animate.scale).toBe(1)
  })

  it('pulses through a hold-at-peak keyframe sequence when glowing', () => {
    const { result } = renderHook(() => useGlowAnimation(true))
    const shadow = result.current.animate.boxShadow
    expect(Array.isArray(shadow)).toBe(true)
    if (Array.isArray(shadow)) {
      // Peak is held across two consecutive keyframes, not just a single instant.
      expect(shadow[1]).toBe(shadow[2])
      expect(shadow[0]).toBe(shadow[shadow.length - 1])
    }
    expect(result.current.transition).toMatchObject({ duration: 2.6 })
  })

  it('falls back to a static ring (no pulse) for prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const { result } = renderHook(() => useGlowAnimation(true))
    expect(Array.isArray(result.current.animate.boxShadow)).toBe(false)
    expect(result.current.animate.scale).toBe(1)
  })

  it('exports a clear-timeout duration at least as long as the animation', () => {
    expect(GLOW_DURATION_MS).toBeGreaterThanOrEqual(2600)
  })
})
