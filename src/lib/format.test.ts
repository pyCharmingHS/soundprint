import { describe, expect, it } from 'vitest'
import { formatDate, formatHourLabel, formatHours, mostCommonKey } from './format'

describe('formatHours', () => {
  it('converts minutes to hours with one decimal place, no unit', () => {
    expect(formatHours(90)).toBe('1.5')
    expect(formatHours(0)).toBe('0.0')
    expect(formatHours(60)).toBe('1.0')
  })
})

describe('formatDate', () => {
  it('round-trips to the same calendar date regardless of locale formatting', () => {
    const iso = '2026-08-15T10:00:00.000Z'
    const parsedBack = new Date(formatDate(iso, 'en'))
    const original = new Date(iso)
    expect(parsedBack.getFullYear()).toBe(original.getFullYear())
    expect(parsedBack.getMonth()).toBe(original.getMonth())
    expect(parsedBack.getDate()).toBe(original.getDate())
  })

  it('formats month names in the requested locale', () => {
    const iso = '2026-01-15T10:00:00.000Z'
    expect(formatDate(iso, 'en')).toContain('January')
    expect(formatDate(iso, 'es')).toContain('enero')
    expect(formatDate(iso, 'it')).toContain('gennaio')
    expect(formatDate(iso, 'pt')).toContain('janeiro')
  })

  it('defaults to English when no locale is given', () => {
    expect(formatDate('2026-01-15T10:00:00.000Z')).toContain('January')
  })
})

describe('mostCommonKey', () => {
  it('returns the key with the highest value', () => {
    expect(mostCommonKey({ Friday: 3, Saturday: 9, Sunday: 4 })).toBe('Saturday')
  })

  it('keeps the first key on a tie', () => {
    expect(mostCommonKey({ a: 5, b: 5 })).toBe('a')
  })

  it('returns undefined for missing or empty records', () => {
    expect(mostCommonKey(undefined)).toBeUndefined()
    expect(mostCommonKey({})).toBeUndefined()
  })
})

describe('formatHourLabel', () => {
  it('uses 12-hour AM/PM for English', () => {
    expect(formatHourLabel('0', 'en')).toBe('12 AM')
    expect(formatHourLabel('1', 'en')).toBe('1 AM')
    expect(formatHourLabel('12', 'en')).toBe('12 PM')
    expect(formatHourLabel('13', 'en')).toBe('1 PM')
    expect(formatHourLabel('23', 'en')).toBe('11 PM')
  })

  it('uses 24-hour format for es/it/pt', () => {
    expect(formatHourLabel('0', 'es')).toBe('00:00')
    expect(formatHourLabel('13', 'it')).toBe('13:00')
    expect(formatHourLabel('23', 'pt')).toBe('23:00')
  })

  it('defaults to English when no locale is given', () => {
    expect(formatHourLabel('13')).toBe('1 PM')
  })
})
