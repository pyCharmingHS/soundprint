import { describe, expect, it } from 'vitest'
import { isSongNavState } from './songNav'

describe('isSongNavState', () => {
  it('accepts a well-formed nav state', () => {
    expect(isSongNavState({ songIds: ['a', 'b'], returnTo: '/pantheon' })).toBe(true)
  })

  it('rejects missing, null, or malformed values', () => {
    expect(isSongNavState(undefined)).toBe(false)
    expect(isSongNavState(null)).toBe(false)
    expect(isSongNavState({})).toBe(false)
    expect(isSongNavState({ songIds: 'not-an-array', returnTo: '/pantheon' })).toBe(false)
    expect(isSongNavState({ songIds: ['a'] })).toBe(false)
  })
})
