import type { Locale, Dictionary } from './types'
import id from './id'
import en from './en'

export const dictionaries: Record<Locale, Dictionary> = { id, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export * from './types'
