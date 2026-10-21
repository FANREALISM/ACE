'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/**
 * Tema antarmuka (UI) global — BEDA dari tema warna (dark/light, lihat
 * lib/theme) dan dari latar (lib/background). Tiga sumbu independen:
 *
 *   data-theme  dark | light            → palet warna
 *   data-bkg    ps2 | ambient | normal  → latar belakang
 *   data-ui     terminal | game         → BENTUK komponen (sudut, border, dekorasi)
 *
 *   terminal — UI futuristik minimalis berkurung siku (default, identitas situs)
 *   game     — "Game HUD": sudut terpotong (chamfer), border neon asimetris,
 *              dekorasi barcode/kode, hover glitch/scanline
 *
 * SUMBER KEBENARAN = atribut `data-ui` di <html>. Inline script di
 * app/layout.tsx mengisinya dari localStorage SEBELUM React hydrate, jadi
 * CSS langsung benar di paint pertama (tanpa kedip Terminal→HUD). Provider
 * ini hanya MEMBACA atribut itu saat mount (state awal `null` di server &
 * client → tidak ada hydration mismatch) lalu menyinkronkannya.
 *
 * Komponen React TIDAK perlu tahu mode apa yang aktif: styling dilakukan
 * murni lewat CSS (varian Tailwind `game:` + kelas `hud-*`). Hook
 * `useUITheme` hanya untuk yang memang perlu membaca/mengubah pilihan
 * (UISwitcher, Command Palette).
 */

export type UITheme = 'terminal' | 'game'

export const UI_THEMES: readonly UITheme[] = ['terminal', 'game'] as const

export const UI_THEME_STORAGE_KEY = 'portfolio-ui'

export const DEFAULT_UI_THEME: UITheme = 'terminal'

export const UI_THEME_LABELS: Record<UITheme, { label: string; description: string }> = {
  terminal: { label: 'TERMINAL', description: 'Minimalis · kurung siku' },
  game: { label: 'GAME HUD', description: 'Sudut terpotong · neon' },
}

export function isUITheme(value: unknown): value is UITheme {
  return typeof value === 'string' && (UI_THEMES as readonly string[]).includes(value)
}

interface UIThemeContextValue {
  /** `null` = belum terbaca di client (SSR / render pertama). */
  ui: UITheme | null
  setUI: (nextUI: UITheme) => void
  toggleUI: () => void
}

const UIThemeContext = createContext<UIThemeContextValue | null>(null)

function readStoredUI(): UITheme | null {
  try {
    const storedValue = window.localStorage.getItem(UI_THEME_STORAGE_KEY)
    return isUITheme(storedValue) ? storedValue : null
  } catch {
    // localStorage bisa melempar (mode privat, kebijakan cookie ketat).
    return null
  }
}

/** Nyalakan kilatan transisi singkat (CSS: html.ui-switching). Sengaja
 *  bukan state React — murni kelas CSS sesaat, tanpa re-render. */
function playSwitchFlash() {
  const rootElement = document.documentElement
  rootElement.classList.remove('ui-switching')
  // Paksa reflow supaya animasi mulai ulang kalau diklik beruntun.
  void rootElement.offsetWidth
  rootElement.classList.add('ui-switching')
  window.setTimeout(() => rootElement.classList.remove('ui-switching'), 520)
}

export function UIThemeProvider({ children }: { children: React.ReactNode }) {
  const [ui, setUIState] = useState<UITheme | null>(null)

  // Mount: ambil nilai yang sudah ditetapkan inline script. Kalau atributnya
  // hilang/rusak (mis. script diblokir), hitung ulang dengan aturan yang sama.
  useEffect(() => {
    const attributeValue = document.documentElement.getAttribute('data-ui')
    const resolvedUI = isUITheme(attributeValue)
      ? attributeValue
      : (readStoredUI() ?? DEFAULT_UI_THEME)
    document.documentElement.setAttribute('data-ui', resolvedUI)
    setUIState(resolvedUI)
  }, [])

  // Sinkron antar-tab.
  useEffect(() => {
    function handleStorage(storageEvent: StorageEvent) {
      if (storageEvent.key !== UI_THEME_STORAGE_KEY) return
      const nextUI = isUITheme(storageEvent.newValue)
        ? storageEvent.newValue
        : DEFAULT_UI_THEME
      document.documentElement.setAttribute('data-ui', nextUI)
      setUIState(nextUI)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setUI = useCallback((nextUI: UITheme) => {
    if (document.documentElement.getAttribute('data-ui') !== nextUI) {
      playSwitchFlash()
    }
    setUIState(nextUI)
    document.documentElement.setAttribute('data-ui', nextUI)
    try {
      window.localStorage.setItem(UI_THEME_STORAGE_KEY, nextUI)
    } catch {
      // Storage ditolak — pilihan tetap berlaku selama sesi.
    }
  }, [])

  const toggleUI = useCallback(() => {
    const currentUI = document.documentElement.getAttribute('data-ui')
    setUI(currentUI === 'game' ? 'terminal' : 'game')
  }, [setUI])

  const contextValue = useMemo(() => ({ ui, setUI, toggleUI }), [ui, setUI, toggleUI])

  return <UIThemeContext.Provider value={contextValue}>{children}</UIThemeContext.Provider>
}

/** Hook pilihan UI — harus di dalam <UIThemeProvider>. */
export function useUITheme(): UIThemeContextValue {
  const contextValue = useContext(UIThemeContext)
  if (!contextValue) {
    throw new Error('useUITheme must be used within UIThemeProvider')
  }
  return contextValue
}
