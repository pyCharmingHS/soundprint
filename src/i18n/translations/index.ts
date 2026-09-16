import type { Locale } from '../locale'
import en from './en'
import es from './es'
import it from './it'
import pt from './pt'
import type { TranslationValue } from './types'

export type { TranslationKey } from './en'
export type { TranslationValue } from './types'

const DICTIONARIES: Record<Locale, Record<string, TranslationValue>> = { en, es, it, pt }

export default DICTIONARIES
