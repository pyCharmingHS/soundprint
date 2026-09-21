import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import PageTransition from './PageTransition'

function songLinks() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href')?.includes('/song/'))
}

describe('PageTransition', () => {
  it('keeps an exiting page resolved against its own URL while it fades out, not the URL being navigated to', async () => {
    render(
      <LocaleProvider>
        <MemoryRouter initialEntries={['/pantheon?category=thinkers']}>
          <PageTransition />
        </MemoryRouter>
      </LocaleProvider>,
    )

    // The category filter has narrowed the grid down from all 15 Pantheon
    // songs to the 9 tagged "thinkers".
    const filteredLinks = await screen.findAllByRole('link', {}, { timeout: 2000 })
    const filteredCount = filteredLinks.filter((l) => l.getAttribute('href')?.includes('/song/')).length
    expect(filteredCount).toBe(9)

    // Navigate away by clicking into a song. react-router-dom updates the
    // global location synchronously here, but mode="wait" keeps the old
    // (Pantheon) page mounted, mid fade-out, for its exit animation. If
    // that exiting page's useSearchParams() picked up the *new* location
    // (no `category` param), it would re-render showing all 15 songs
    // instead of the 9 it was actually displaying — the bug this guards
    // against.
    fireEvent.click(songLinks()[0])
    expect(songLinks().length).toBe(9)
  })
})
