import { describe, expect, it } from 'vitest'
import { isBackNavState, isSongNavState } from './songNav'

describe('isSongNavState', () => {
  it('accepts a well-formed nav state', () => {
    expect(
      isSongNavState({ songIds: ['a', 'b'], returnTo: '/pantheon', listLabel: 'The Thinkers' }),
    ).toBe(true)
  })

  it('rejects missing, null, or malformed values', () => {
    expect(isSongNavState(undefined)).toBe(false)
    expect(isSongNavState(null)).toBe(false)
    expect(isSongNavState({})).toBe(false)
    expect(
      isSongNavState({ songIds: 'not-an-array', returnTo: '/pantheon', listLabel: 'x' }),
    ).toBe(false)
    expect(isSongNavState({ songIds: ['a'], returnTo: '/pantheon' })).toBe(false)
  })
})

describe('isBackNavState', () => {
  it('accepts a well-formed back-nav state', () => {
    expect(isBackNavState({ highlightSongId: 'song-a-te' })).toBe(true)
  })

  it('rejects missing, null, or malformed values', () => {
    expect(isBackNavState(undefined)).toBe(false)
    expect(isBackNavState(null)).toBe(false)
    expect(isBackNavState({})).toBe(false)
    expect(isBackNavState({ highlightSongId: 42 })).toBe(false)
  })
})
