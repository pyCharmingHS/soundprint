import { useLocale } from '../i18n/LocaleContext'
import { GRID_SIZES, type GridSize, type ViewMode } from '../lib/songDisplay'

function GridGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function ListGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1.8" width="14" height="2.4" rx="1" />
      <rect x="1" y="6.8" width="14" height="2.4" rx="1" />
      <rect x="1" y="11.8" width="14" height="2.4" rx="1" />
    </svg>
  )
}

const SIZE_LABEL: Record<GridSize, string> = { small: 'S', medium: 'M', large: 'L' }

interface ViewControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  gridSize: GridSize
  onGridSizeChange: (size: GridSize) => void
}

function ViewControls({ viewMode, onViewModeChange, gridSize, onGridSizeChange }: ViewControlsProps) {
  const { t } = useLocale()

  return (
    <div className="flex items-center gap-2">
      {viewMode === 'grid' && (
        <div className="flex overflow-hidden rounded-full border border-border text-sm">
          {GRID_SIZES.map((size, i) => (
            <button
              key={size}
              type="button"
              aria-label={t(`pantheon.size.${size}`)}
              aria-pressed={gridSize === size}
              onClick={() => onGridSizeChange(size)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center transition-colors ${
                i > 0 ? 'border-l border-border' : ''
              } ${gridSize === size ? 'bg-gold/10 text-gold' : 'text-muted hover:text-foreground'}`}
            >
              {SIZE_LABEL[size]}
            </button>
          ))}
        </div>
      )}
      <div className="flex overflow-hidden rounded-full border border-border">
        <button
          type="button"
          aria-label={t('pantheon.viewGrid')}
          aria-pressed={viewMode === 'grid'}
          onClick={() => onViewModeChange('grid')}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center transition-colors ${
            viewMode === 'grid' ? 'bg-gold/10 text-gold' : 'text-muted hover:text-foreground'
          }`}
        >
          <GridGlyph />
        </button>
        <button
          type="button"
          aria-label={t('pantheon.viewList')}
          aria-pressed={viewMode === 'list'}
          onClick={() => onViewModeChange('list')}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center border-l border-border transition-colors ${
            viewMode === 'list' ? 'bg-gold/10 text-gold' : 'text-muted hover:text-foreground'
          }`}
        >
          <ListGlyph />
        </button>
      </div>
    </div>
  )
}

export default ViewControls
