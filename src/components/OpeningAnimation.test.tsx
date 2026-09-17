import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import OpeningAnimation from './OpeningAnimation'

function renderIntro() {
  return render(
    <LocaleProvider>
      <OpeningAnimation />
    </LocaleProvider>,
  )
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('OpeningAnimation', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not render if the intro was already seen this session', () => {
    sessionStorage.setItem('soundprint-intro-seen', '1')
    const { container } = renderIntro()
    expect(container).toBeEmptyDOMElement()
  })

  it('does not render when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const { container } = renderIntro()
    expect(container).toBeEmptyDOMElement()
  })

  it('reveals the wordmark and tagline progressively, then exits', () => {
    renderIntro()
    expect(screen.queryByText('THE')).not.toBeInTheDocument()

    advance(500) // -> word1
    expect(screen.getByText('THE')).toBeInTheDocument()
    expect(screen.queryByText('P')).not.toBeInTheDocument()

    advance(800) // -> word2 at 1300ms total
    expect(screen.getByText('P')).toBeInTheDocument() // first letter of PANTHEON

    advance(1300) // -> tagline1 at 2600ms total
    expect(screen.getByText("I don't have a favorite song.")).toBeInTheDocument()

    advance(900) // -> tagline2 at 3500ms total
    expect(screen.getByText('I have several.')).toBeInTheDocument()
    expect(sessionStorage.getItem('soundprint-intro-seen')).toBeNull()

    // The overlay's own exit fade (Framer Motion's AnimatePresence) depends
    // on real elapsed time via performance.now(), which advancing fake
    // timers doesn't move — so the DOM node lingers past this point in a
    // test environment even though the app's phase state has correctly
    // reached 'done'. Assert on that state directly rather than on when
    // Framer Motion gets around to unmounting the node.
    advance(1300) // -> done at 4800ms total
    expect(sessionStorage.getItem('soundprint-intro-seen')).toBe('1')
  })

  it('can be skipped by clicking, marks the session seen, and ignores stale timers', () => {
    const { container } = renderIntro()
    advance(500) // mid-sequence, so pending timers for later phases still exist
    fireEvent.click(container.firstChild as Element)

    expect(sessionStorage.getItem('soundprint-intro-seen')).toBe('1')

    // Advance well past every remaining scheduled phase timer. None of them
    // should be able to revive the intro after skip — tagline1 was never
    // shown before the click, so it must never appear at all.
    advance(10_000)
    expect(screen.queryByText("I don't have a favorite song.")).not.toBeInTheDocument()
  })
})
