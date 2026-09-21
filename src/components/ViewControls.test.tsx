import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import ViewControls from './ViewControls'

function renderControls(viewMode: 'grid' | 'list' = 'grid') {
  const onViewModeChange = vi.fn()
  const onGridSizeChange = vi.fn()
  render(
    <LocaleProvider>
      <ViewControls
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        gridSize="medium"
        onGridSizeChange={onGridSizeChange}
      />
    </LocaleProvider>,
  )
  return { onViewModeChange, onGridSizeChange }
}

describe('ViewControls', () => {
  it('shows size buttons in grid mode', () => {
    renderControls('grid')
    expect(screen.getByLabelText('Small')).toBeInTheDocument()
  })

  it('hides size buttons in list mode', () => {
    renderControls('list')
    expect(screen.queryByLabelText('Small')).not.toBeInTheDocument()
  })

  it('calls onViewModeChange when switching to list', () => {
    const { onViewModeChange } = renderControls('grid')
    fireEvent.click(screen.getByLabelText('List view'))
    expect(onViewModeChange).toHaveBeenCalledWith('list')
  })

  it('calls onGridSizeChange when picking a size', () => {
    const { onGridSizeChange } = renderControls('grid')
    fireEvent.click(screen.getByLabelText('Large'))
    expect(onGridSizeChange).toHaveBeenCalledWith('large')
  })

  it('marks the active size and view mode as pressed', () => {
    renderControls('grid')
    expect(screen.getByLabelText('Medium')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Grid view')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('List view')).toHaveAttribute('aria-pressed', 'false')
  })
})
