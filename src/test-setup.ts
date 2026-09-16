import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

afterEach(cleanup)

// jsdom doesn't implement IntersectionObserver, which Framer Motion's
// whileInView (used by ListeningClock, TimelineChart, PantheonVsReality)
// needs to mount at all. Real browsers all have it — this is purely a test
// environment gap, not an app-level dependency.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

// @ts-expect-error -- minimal stub, not a full IntersectionObserver implementation
window.IntersectionObserver = IntersectionObserverStub
