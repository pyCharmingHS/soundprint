import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LocaleProvider, useLocale } from './LocaleContext'

function Probe() {
  const { locale, setLocale, t, localize } = useLocale()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="nav-home">{t('nav.home')}</span>
      <span data-testid="plural-one">{t('common.plays', { count: 1 })}</span>
      <span data-testid="plural-other">{t('common.plays', { count: 5 })}</span>
      <span data-testid="localized">{localize({ en: 'Hello', es: 'Hola' }) ?? ''}</span>
      <button onClick={() => setLocale('es')}>Switch to Spanish</button>
    </div>
  )
}

describe('useLocale without a Provider', () => {
  it('falls back to sensible English defaults', () => {
    render(<Probe />)
    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    expect(screen.getByTestId('nav-home')).toHaveTextContent('Home')
  })
})

describe('LocaleProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('switches locale and re-renders translated text', () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('nav-home')).toHaveTextContent('Home')
    fireEvent.click(screen.getByText('Switch to Spanish'))
    expect(screen.getByTestId('locale')).toHaveTextContent('es')
    expect(screen.getByTestId('nav-home')).toHaveTextContent('Inicio')
  })

  it('persists the chosen locale to localStorage', () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )
    fireEvent.click(screen.getByText('Switch to Spanish'))
    expect(window.localStorage.getItem('soundprint-locale')).toBe('es')
  })

  it('restores a persisted locale on mount', () => {
    window.localStorage.setItem('soundprint-locale', 'it')
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('it')
  })

  it('ignores an invalid persisted value and falls back to English', () => {
    window.localStorage.setItem('soundprint-locale', 'fr')
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('en')
  })

  it('picks the correct plural form', () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('plural-one')).toHaveTextContent('1 play')
    expect(screen.getByTestId('plural-other')).toHaveTextContent('5 plays')
  })

  it('localizes with English fallback when the active locale is missing', () => {
    window.localStorage.setItem('soundprint-locale', 'pt')
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )
    // The probe's localized value only has en/es, no pt — falls back to en.
    expect(screen.getByTestId('localized')).toHaveTextContent('Hello')
  })
})
