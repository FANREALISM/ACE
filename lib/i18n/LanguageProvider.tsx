'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import type { Locale, Dictionary } from './types'
import { getDictionary } from './index'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  /** Kamus terjemahan untuk locale aktif saat ini — diakses sebagai
   *  `translations.nav.startJourney`, dst di komponen manapun lewat
   *  useLanguage(). */
  translations: Dictionary
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const LOCALE_STORAGE_KEY = 'portfolio-locale'

/**
 * Provider bahasa ID/EN — bungkus seluruh app di layout.tsx. Simpan
 * pilihan bahasa ke localStorage, sinkronkan attribute `lang` di <html>
 * untuk screen reader, dan sediakan dictionary terjemahan lewat
 * useLanguage() ke komponen manapun di bawahnya.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  // Baca preferensi tersimpan setelah mount (localStorage tidak tersedia
  // saat server-render, jadi ini sengaja dijalankan di useEffect).
  useEffect(() => {
    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (savedLocale === 'id' || savedLocale === 'en') {
      setLocaleState(savedLocale)
    }
  }, [])

  /** Set bahasa secara eksplisit dan simpan ke localStorage. */
  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  }

  // Screen reader pronunciation depends on lang attribute matching the
  // actual text language. Without this, switching to EN still announces
  // English words using Indonesian phoneme rules.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  /** Balik antara 'id' dan 'en' — ini yang dipanggil tombol toggle. */
  function toggleLocale() {
    setLocale(locale === 'id' ? 'en' : 'id')
  }

  const languageContextValue: LanguageContextValue = {
    locale,
    setLocale,
    toggleLocale,
    translations: getDictionary(locale),
  }

  return (
    <LanguageContext.Provider value={languageContextValue}>
      {/* reducedMotion="user" reads prefers-reduced-motion and
          automatically disables transform/animate on motion.* components —
          a plain CSS media query cannot reach JS-driven Framer animations. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  )
}

/**
 * Hook untuk baca/ubah bahasa aktif dan akses dictionary terjemahan dari
 * komponen manapun di bawah LanguageProvider. Lempar error kalau
 * dipanggil di luar provider.
 */
export function useLanguage() {
  const languageContextValue = useContext(LanguageContext)
  if (!languageContextValue) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return languageContextValue
}
