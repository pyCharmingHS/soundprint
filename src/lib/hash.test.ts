import { describe, expect, it } from 'vitest'
import { hashString } from './hash'

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('El Aguante')).toBe(hashString('El Aguante'))
  })

  it('produces different values for different inputs', () => {
    expect(hashString('El Aguante')).not.toBe(hashString('Cuando Se Acaba el Amor'))
  })

  it('always returns a non-negative integer', () => {
    expect(hashString('')).toBeGreaterThanOrEqual(0)
    expect(hashString('anything at all')).toBeGreaterThanOrEqual(0)
  })
})
