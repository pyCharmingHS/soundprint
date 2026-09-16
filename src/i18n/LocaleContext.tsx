import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isLocale, type Locale, type LocalizedString } from './locale'
import DICTIONARIES from './translations'

const STORAGE_KEY = 'soundprint-locale'

type TranslationVars = Record<string, string | number>

function interpolate(raw: string, vars?: TranslationVars): string {
  if (!vars) return raw
  return raw.replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars[name] ?? ''))
}

function translate(locale: Locale, key: string, vars?: TranslationVars): string {
  const entry = DICTIONARIES[locale][key] ?? DICTIONARIES.en[key]
  if (entry === undefined) return key
  const raw = typeof entry === 'string' ? entry : vars?.count === 1 ? entry.one : entry.other
  return interpolate(raw, vars)
}

function localizeValue(locale: Locale, value: LocalizedString | undefined): string | undefined {
  if (!value) return undefined
  return value[locale] ?? value.en ?? Object.values(value).find(Boolean)
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Looks up a UI string by dotted key (e.g. 'nav.home'), with English
   * fallback and optional {{var}} interpolation / count-based pluralization. */
  t: (key: string, vars?: TranslationVars) => string
  /** Picks the current locale's copy of a user-curated field (a song's
   * `why`, a category's name/description), falling back to English and
   * then to whatever locale is actually present. */
  localize: (value: LocalizedString | undefined) => string | undefined
}

function buildContextValue(locale: Locale, setLocale: (locale: Locale) => void): LocaleContextValue {
  return {
    locale,
    setLocale,
    t: (key, vars) => translate(locale, key, vars),
    localize: (value) => localizeValue(locale, value),
  }
}

// A concrete default (not undefined) so components/tests can call useLocale()
// without wrapping in a Provider and still get sensible English output.
const LocaleReactContext = createContext<LocaleContextValue>(buildContextValue('en', () => {}))

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && isLocale(stored)) return stored
    } catch {
      // localStorage can throw in private-browsing/storage-blocked contexts
    }
    return 'en'
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // ignore — persistence is a nicety, not a requirement
    }
  }, [locale])

  const value = useMemo(() => buildContextValue(locale, setLocaleState), [locale])

  return <LocaleReactContext.Provider value={value}>{children}</LocaleReactContext.Provider>
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleReactContext)
}
