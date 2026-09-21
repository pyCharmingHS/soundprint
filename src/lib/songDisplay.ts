export type ViewMode = 'grid' | 'list'
export type GridSize = 'small' | 'medium' | 'large'

export function isViewMode(value: string): value is ViewMode {
  return value === 'grid' || value === 'list'
}

export function isGridSize(value: string): value is GridSize {
  return value === 'small' || value === 'medium' || value === 'large'
}

export const GRID_SIZES: GridSize[] = ['small', 'medium', 'large']

/** Column counts per size, at each breakpoint. `large` caps at 3 even on
 * desktop (the "awesome size" the Home page's old 2-up section had) —
 * `small` packs in more than the default for browsing on a phone. */
export const GRID_SIZE_CLASSES: Record<GridSize, string> = {
  small: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
  medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  large: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3',
}
