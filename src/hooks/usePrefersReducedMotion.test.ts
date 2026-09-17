import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when matchMedia is unavailable (jsdom default)', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('does not crash against a mock without addEventListener support', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
    expect(() => renderHook(() => usePrefersReducedMotion())).not.toThrow()
  })

  it('reacts to a later change event when the mock supports it', () => {
    let changeHandler: (() => void) | undefined
    const mediaQueryMock = {
      matches: false,
      addEventListener: (_event: string, handler: () => void) => {
        changeHandler = handler
      },
      removeEventListener: () => {},
    }
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryMock))

    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)

    mediaQueryMock.matches = true
    act(() => {
      changeHandler?.()
    })
    expect(result.current).toBe(true)
  })
})
