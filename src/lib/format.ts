import type { Locale } from '../i18n/locale'

/** Bare number, one decimal place — callers append the localized unit word. */
export function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1)
}

const DATE_LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-BR',
}

export function formatDate(iso: string, locale: Locale = 'en'): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE_TAGS[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** e.g. 1984 -> "1980s". */
export function decadeLabel(year: number): string {
  return `${Math.floor(year / 10) * 10}s`
}

export function mostCommonKey(
  record: Record<string, number> | undefined,
): string | undefined {
  if (!record) return undefined
  const entries = Object.entries(record)
  if (entries.length === 0) return undefined
  return entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0]
}

/** English uses 12-hour AM/PM; es/it/pt conventionally use 24-hour time. */
export function formatHourLabel(hour: string, locale: Locale = 'en'): string {
  const h = Number(hour)
  if (locale === 'en') {
    const period = h < 12 ? 'AM' : 'PM'
    const displayHour = h % 12 === 0 ? 12 : h % 12
    return `${displayHour} ${period}`
  }
  return `${h.toString().padStart(2, '0')}:00`
}
