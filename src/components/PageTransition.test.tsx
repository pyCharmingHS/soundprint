import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import songsData from '../data/public/songs.json'
import type { Song } from '../types'
import PageTransition from './PageTransition'

function songLinks() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href')?.includes('/song/'))
}

// Computed from the real data rather than hardcoded, so this doesn't need
// hand-updating every time a song is added.
const THINKERS_COUNT = (songsData as Song[]).filter((s) =>
  s.personal.categories.includes('thinkers'),
).length

describe('PageTransition', () => {
  it('keeps an exiting page resolved against its own URL while it fades out, not the URL being navigated to', async () => {
    render(
      <LocaleProvider>
        <MemoryRouter initialEntries={['/pantheon?category=thinkers']}>
          <PageTransition />
        </MemoryRouter>
      </LocaleProvider>,
    )

    // The category filter has narrowed the grid down from all Pantheon
    // songs to just those tagged "thinkers".
    const filteredLinks = await screen.findAllByRole('link', {}, { timeout: 2000 })
    const filteredCount = filteredLinks.filter((l) => l.getAttribute('href')?.includes('/song/')).length
    expect(filteredCount).toBe(THINKERS_COUNT)

    // Navigate away by clicking into a song. react-router-dom updates the
    // global location synchronously here, but mode="wait" keeps the old
    // (Pantheon) page mounted, mid fade-out, for its exit animation. If
    // that exiting page's useSearchParams() picked up the *new* location
    // (no `category` param), it would re-render showing every Pantheon
    // song instead of just the "thinkers" it was actually displaying —
    // the bug this guards against.
    fireEvent.click(songLinks()[0])
    expect(songLinks().length).toBe(THINKERS_COUNT)
  })
})
