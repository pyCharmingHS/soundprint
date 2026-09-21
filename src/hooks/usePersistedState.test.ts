import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePersistedState } from './usePersistedState'

type Size = 'small' | 'large'
const isSize = (v: string): v is Size => v === 'small' || v === 'large'

describe('usePersistedState', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts at the default when nothing is stored', () => {
    const { result } = renderHook(() => usePersistedState('test-key', 'small', isSize))
    expect(result.current[0]).toBe('small')
  })

  it('reads a previously stored value', () => {
    window.localStorage.setItem('test-key', 'large')
    const { result } = renderHook(() => usePersistedState('test-key', 'small', isSize))
    expect(result.current[0]).toBe('large')
  })

  it('ignores an invalid stored value and falls back to the default', () => {
    window.localStorage.setItem('test-key', 'huge')
    const { result } = renderHook(() => usePersistedState('test-key', 'small', isSize))
    expect(result.current[0]).toBe('small')
  })

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => usePersistedState('test-key', 'small', isSize))
    act(() => result.current[1]('large'))
    expect(result.current[0]).toBe('large')
    expect(window.localStorage.getItem('test-key')).toBe('large')
  })
})
