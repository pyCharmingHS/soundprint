import { describe, expect, it } from 'vitest'
import { GRID_SIZES, GRID_SIZE_CLASSES, isGridSize, isViewMode } from './songDisplay'

describe('isViewMode', () => {
  it('accepts grid and list, rejects everything else', () => {
    expect(isViewMode('grid')).toBe(true)
    expect(isViewMode('list')).toBe(true)
    expect(isViewMode('table')).toBe(false)
    expect(isViewMode('')).toBe(false)
  })
})

describe('isGridSize', () => {
  it('accepts small/medium/large, rejects everything else', () => {
    expect(isGridSize('small')).toBe(true)
    expect(isGridSize('medium')).toBe(true)
    expect(isGridSize('large')).toBe(true)
    expect(isGridSize('huge')).toBe(false)
  })
})

describe('GRID_SIZE_CLASSES', () => {
  it('has a class string for every declared size', () => {
    for (const size of GRID_SIZES) {
      expect(GRID_SIZE_CLASSES[size]).toMatch(/grid-cols-\d/)
    }
  })
})
