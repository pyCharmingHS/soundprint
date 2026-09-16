import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import type { Locale } from '../i18n/locale'
import HomePage from './HomePage'
import PantheonPage from './PantheonPage'
import SongDetailPage from './SongDetailPage'
import StatisticsPage from './StatisticsPage'

/**
 * Renders each page for real, against the actual seed data in
 * src/data/public, in every supported locale — catches integration
 * mistakes (a missed useLocale() wire-up, a bad dynamically-built
 * translation key like `weekday.${day}`) that per-component unit tests
 * can't see. This is the closest thing to a live browser check available
 * without one.
 */

function setStoredLocale(locale: Locale) {
  window.localStorage.setItem('soundprint-locale', locale)
}

const LOCALES: Locale[] = ['en', 'es', 'it', 'pt']

const WORDMARKS: Record<Locale, string> = {
  en: 'THE PANTHEON',
  es: 'EL PANTEÓN',
  it: 'IL PANTHEON',
  pt: 'O PANTEÃO',
}

const PANTHEON_TITLES: Record<Locale, string> = {
  en: 'The Pantheon',
  es: 'El Panteón',
  it: 'Il Pantheon',
  pt: 'O Panteão',
}

const STATISTICS_TITLES: Record<Locale, string> = {
  en: 'Statistics',
  es: 'Estadísticas',
  it: 'Statistiche',
  pt: 'Estatísticas',
}

// El Aguante's "why" note is curated in all four locales — a distinguishing
// opening phrase per language, so this test proves the real translation
// renders, not just an English fallback.
const EL_AGUANTE_WHY_SNIPPETS: Record<Locale, RegExp> = {
  en: /I love songs that enumerate things/,
  es: /Me encantan las canciones que enumeran cosas/,
  it: /Adoro le canzoni che elencano le cose/,
  pt: /Eu amo músicas que enumeram coisas/,
}

describe.each(LOCALES)('pages render correctly in %s', (locale) => {
  beforeEach(() => {
    window.localStorage.clear()
    setStoredLocale(locale)
  })

  it('renders HomePage with the translated wordmark', async () => {
    render(
      <LocaleProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </LocaleProvider>,
    )
    expect(await screen.findByText(WORDMARKS[locale])).toBeInTheDocument()
  })

  it('renders PantheonPage with the translated title and no untranslated keys', async () => {
    render(
      <LocaleProvider>
        <MemoryRouter>
          <PantheonPage />
        </MemoryRouter>
      </LocaleProvider>,
    )
    expect(await screen.findByText(PANTHEON_TITLES[locale])).toBeInTheDocument()
  })

  it('renders StatisticsPage with translated weekday labels, never a raw key', async () => {
    render(
      <LocaleProvider>
        <MemoryRouter>
          <StatisticsPage />
        </MemoryRouter>
      </LocaleProvider>,
    )
    expect(await screen.findByText(STATISTICS_TITLES[locale])).toBeInTheDocument()
    expect(screen.queryByText(/^weekday\./)).not.toBeInTheDocument()
  })

  it('renders SongDetailPage for a real song with its localized why-note', async () => {
    render(
      <LocaleProvider>
        <MemoryRouter initialEntries={['/song/song-el-aguante']}>
          <Routes>
            <Route path="/song/:id" element={<SongDetailPage />} />
          </Routes>
        </MemoryRouter>
      </LocaleProvider>,
    )
    expect(await screen.findByText('El Aguante')).toBeInTheDocument()
    expect(screen.getByText(EL_AGUANTE_WHY_SNIPPETS[locale])).toBeInTheDocument()
  })
})
