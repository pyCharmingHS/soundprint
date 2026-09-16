import type { LocalizedString } from '../i18n/locale'

export interface Category {
  id: string
  name: LocalizedString
  emoji?: string
  description?: LocalizedString
}
