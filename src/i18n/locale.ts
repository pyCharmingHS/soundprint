export type Locale = 'en' | 'es' | 'it' | 'pt'

/**
 * A piece of user-curated content (a song's `why`, a category's name/
 * description) in whichever locales it's been written in. Missing locales
 * are expected — the site falls back to English rather than requiring a
 * full translation before content can ship.
 */
export type LocalizedString = Partial<Record<Locale, string>>

/** Hand-drawn SVG flags (see src/components/FlagIcon.tsx) — not Unicode
 * flag emoji, whose regional-indicator glyph pairs render unreliably
 * across OSes (Windows in particular often shows literal letter pairs
 * instead of a combined flag). */
export type FlagCode = 'us' | 'gb' | 'au' | 'do' | 'mx' | 'es' | 'it' | 'br' | 'pt'

export interface LocaleMeta {
  code: Locale
  nativeName: string
  /** One or more small flags representing the language — deliberately not
   * a single "correct" flag, since most of these languages are spoken
   * across many countries. */
  flags: FlagCode[]
}

export const LOCALES: LocaleMeta[] = [
  { code: 'en', nativeName: 'English', flags: ['us', 'gb', 'au'] },
  { code: 'es', nativeName: 'Español', flags: ['do', 'mx', 'es'] },
  { code: 'pt', nativeName: 'Português', flags: ['br', 'pt'] },
  { code: 'it', nativeName: 'Italiano', flags: ['it'] },
]

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value)
}
