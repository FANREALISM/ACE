import type { Locale, Dictionary } from './types'
import id from './id'
import en from './en'

/** Registry semua dictionary yang tersedia, keyed by locale code. */
export const dictionaries: Record<Locale, Dictionary> = { id, en }

/** Ambil dictionary terjemahan untuk locale tertentu. Dipakai
 *  LanguageProvider untuk menyediakan `translations` lewat useLanguage(). */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export * from './types'
