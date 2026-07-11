'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'portfolio-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default 'dark' — identitas asli situs. Nilai sebenarnya (kalau ada
  // preferensi tersimpan) dibaca lewat inline script anti-flash di
  // layout.tsx SEBELUM React hydrate, jadi attribute data-theme di <html>
  // sudah benar duluan; state ini cuma menyusul supaya UI toggle (misal
  // tombol matahari/bulan) tahu status yang benar untuk di-render.
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved)
    } else {
      // Belum pernah pilih — hormati preferensi OS/browser kalau ada,
      // tapi tetap fallback ke 'dark' (bukan 'light') supaya konsisten
      // dengan identitas default situs untuk pengunjung baru.
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
      if (prefersLight) setThemeState('light')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function setTheme(next: Theme) {
    setThemeState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
