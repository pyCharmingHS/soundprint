/** A plain string, or a {one, other} pair for count-based pluralization
 * (all four supported languages use simple singular/plural — no language
 * here needs the extra CLDR plural categories like "few" or "many"). */
export type TranslationValue = string | { one: string; other: string }
