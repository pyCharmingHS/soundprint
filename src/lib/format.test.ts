import { describe, expect, it } from 'vitest'
import { formatDate, formatHourLabel, formatHours, mostCommonKey } from './format'

describe('formatHours', () => {
  it('converts minutes to hours with one decimal place', () => {
    expect(formatHours(90)).toBe('1.5 hours')
    expect(formatHours(0)).toBe('0.0 hours')
    expect(formatHours(60)).toBe('1.0 hours')
  })
})

describe('formatDate', () => {
  it('round-trips to the same calendar date regardless of locale formatting', () => {
    const iso = '2026-08-15T10:00:00.000Z'
    const parsedBack = new Date(formatDate(iso))
    const original = new Date(iso)
    expect(parsedBack.getFullYear()).toBe(original.getFullYear())
    expect(parsedBack.getMonth()).toBe(original.getMonth())
    expect(parsedBack.getDate()).toBe(original.getDate())
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
  it('converts 24-hour values to a 12-hour label', () => {
    expect(formatHourLabel('0')).toBe('12 AM')
    expect(formatHourLabel('1')).toBe('1 AM')
    expect(formatHourLabel('12')).toBe('12 PM')
    expect(formatHourLabel('13')).toBe('1 PM')
    expect(formatHourLabel('23')).toBe('11 PM')
  })
})
