'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_STORAGE_KEY = 'portfolio-theme'

/**
 * Provider tema light/dark — bungkus seluruh app di layout.tsx.
 * Simpan pilihan tema ke localStorage supaya persist antar kunjungan,
 * dan sinkronkan ke attribute `data-theme` di <html> yang jadi target
 * semua override warna light-mode di globals.css.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default 'dark' — identitas asli situs. Nilai sebenarnya (kalau ada
  // preferensi tersimpan) dibaca lewat inline script anti-flash di
  // layout.tsx SEBELUM React hydrate, jadi attribute data-theme di <html>
  // sudah benar duluan; state ini cuma menyusul supaya UI toggle (misal
  // tombol matahari/bulan) tahu status yang benar untuk di-render.
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme)
    } else {
      // Belum pernah pilih — hormati preferensi OS/browser kalau ada,
      // tapi tetap fallback ke 'dark' (bukan 'light') supaya konsisten
      // dengan identitas default situs untuk pengunjung baru.
      const prefersLightMode = window.matchMedia(
        '(prefers-color-scheme: light)'
      ).matches
      if (prefersLightMode) setThemeState('light')
    }
  }, [])

  // Setiap kali theme berubah, sinkronkan ke attribute HTML yang jadi
  // target semua CSS override tema light di globals.css.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /** Set tema secara eksplisit (dipakai kalau nanti ada UI pilih tema
   *  langsung, bukan cuma toggle dua arah). */
  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  /** Balik ke tema sebaliknya — ini yang dipanggil tombol toggle. */
  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook untuk baca/ubah tema aktif dari komponen manapun di bawah
 * ThemeProvider. Lempar error kalau dipanggil di luar provider — lebih
 * baik gagal jelas saat development daripada diam-diam undefined.
 */
export function useTheme() {
  const themeContextValue = useContext(ThemeContext)
  if (!themeContextValue) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return themeContextValue
}
