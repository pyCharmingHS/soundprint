import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import SongSortMenu from './SongSortMenu'

function renderMenu(value: Parameters<typeof SongSortMenu>[0]['value'] = 'curated') {
  const onChange = vi.fn()
  render(
    <LocaleProvider>
      <SongSortMenu value={value} onChange={onChange} />
    </LocaleProvider>,
  )
  return onChange
}

describe('SongSortMenu', () => {
  it('shows the current sort option on the trigger button', () => {
    renderMenu('title-asc')
    expect(screen.getByRole('button')).toHaveTextContent('Title (A–Z)')
  })

  it('opens a menu listing every sort option', () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Year (oldest first)')).toBeInTheDocument()
    expect(screen.getByText('Year (newest first)')).toBeInTheDocument()
    expect(screen.getByText('Title (Z–A)')).toBeInTheDocument()
  })

  it('calls onChange with the picked option and closes the menu', async () => {
    const onChange = renderMenu()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Year (newest first)'))

    expect(onChange).toHaveBeenCalledWith('year-desc')
    await waitFor(() => expect(screen.queryByText('Title (Z–A)')).not.toBeInTheDocument())
  })

  it('closes the menu on an outside click', async () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Title (Z–A)')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(screen.queryByText('Title (Z–A)')).not.toBeInTheDocument())
  })
})
