export type Locale = 'en' | 'es' | 'it' | 'pt'

/**
 * A piece of user-curated content (a song's `why`, a category's name/
 * description) in whichever locales it's been written in. Missing locales
 * are expected — the site falls back to English rather than requiring a
 * full translation before content can ship.
 */
export type LocalizedString = Partial<Record<Locale, string>>

export interface LocaleMeta {
  code: Locale
  nativeName: string
  /** One or more small flags representing the language — deliberately not
   * a single "correct" flag, since most of these languages are spoken
   * across many countries. */
  flags: string[]
}

export const LOCALES: LocaleMeta[] = [
  { code: 'en', nativeName: 'English', flags: ['🇺🇸', '🇬🇧', '🇦🇺'] },
  { code: 'es', nativeName: 'Español', flags: ['🇩🇴', '🇲🇽', '🇪🇸'] },
  { code: 'it', nativeName: 'Italiano', flags: ['🇮🇹'] },
  { code: 'pt', nativeName: 'Português', flags: ['🇧🇷', '🇵🇹'] },
]

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value)
}
