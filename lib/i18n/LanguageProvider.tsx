'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import type { Locale, Dictionary } from './types'
import { getDictionary } from './index'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'portfolio-locale'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  // Baca preferensi tersimpan setelah mount (localStorage tidak tersedia
  // saat server-render, jadi ini sengaja dijalankan di useEffect).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'id' || saved === 'en') {
      setLocaleState(saved)
    }
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  // Screen reader pronunciation depends on lang attribute matching the
  // actual text language. Without this, switching to EN still announces
  // English words using Indonesian phoneme rules.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  function toggleLocale() {
    setLocale(locale === 'id' ? 'en' : 'id')
  }

  const value: LanguageContextValue = {
    locale,
    setLocale,
    toggleLocale,
    t: getDictionary(locale),
  }

  return (
    <LanguageContext.Provider value={value}>
      {/* reducedMotion="user" reads prefers-reduced-motion and
          automatically disables transform/animate on motion.* components —
          a plain CSS media query cannot reach JS-driven Framer animations. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
