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
 * State pilihan latar belakang pengunjung.
 *
 *   ps2     — animasi canvas bergaya boot screen (default, paling berat)
 *   ambient — gradient mesh CSS yang bergerak lambat (ringan)
 *   normal  — statis: hitam pekat + grid samar + noise tipis (paling ringan)
 *
 * SUMBER KEBENARAN = atribut `data-bkg` di <html>. Inline script di
 * app/layout.tsx mengisinya SEBELUM React hydrate (dari localStorage),
 * jadi CSS langsung menampilkan latar yang benar tanpa kedip, dan
 * provider ini hanya MEMBACA atribut itu saat mount lalu
 * menyinkronkannya. Akibatnya:
 *   - Tidak ada hydration mismatch (state awal `null` di server & client).
 *   - Pengunjung yang memilih "normal"/"ambient" tidak pernah mengunduh
 *     chunk JS animasi PS2 — Background.tsx baru memuatnya kalau mode
 *     sudah terpastikan 'ps2'.
 */

export type BackgroundMode = 'ps2' | 'ambient' | 'normal'

export const BACKGROUND_MODES: readonly BackgroundMode[] = [
  'ps2',
  'ambient',
  'normal',
] as const

export const BACKGROUND_STORAGE_KEY = 'portfolio-bkg'

/** Mode default untuk pengunjung baru (belum pernah memilih). */
export const DEFAULT_BACKGROUND_MODE: BackgroundMode = 'ps2'

export function isBackgroundMode(value: unknown): value is BackgroundMode {
  return (
    typeof value === 'string' &&
    (BACKGROUND_MODES as readonly string[]).includes(value)
  )
}

interface BackgroundContextValue {
  /** `null` = belum terbaca di client (SSR / render pertama). Komponen
   *  yang butuh nilai pasti sebaiknya menunggu sampai non-null. */
  mode: BackgroundMode | null
  setMode: (nextMode: BackgroundMode) => void
  /** Pindah ke mode berikutnya (ps2 → ambient → normal → ps2). */
  cycleMode: () => void
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null)

/** Baca localStorage dengan aman — bisa melempar di mode privat /
 *  kebijakan cookie ketat, jadi selalu dibungkus try/catch. */
function readStoredMode(): BackgroundMode | null {
  try {
    const storedValue = window.localStorage.getItem(BACKGROUND_STORAGE_KEY)
    return isBackgroundMode(storedValue) ? storedValue : null
  } catch {
    return null
  }
}

export function BackgroundProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mode, setModeState] = useState<BackgroundMode | null>(null)

  // Mount: ambil nilai yang sudah ditetapkan inline script. Kalau
  // atributnya hilang/rusak (mis. script diblokir), hitung ulang dengan
  // aturan yang sama.
  useEffect(() => {
    const attributeValue = document.documentElement.getAttribute('data-bkg')
    const resolvedMode = isBackgroundMode(attributeValue)
      ? attributeValue
      : (readStoredMode() ?? DEFAULT_BACKGROUND_MODE)
    document.documentElement.setAttribute('data-bkg', resolvedMode)
    setModeState(resolvedMode)
  }, [])

  // Sinkron antar-tab: ubah pilihan di satu tab, tab lain ikut berubah.
  useEffect(() => {
    function handleStorage(storageEvent: StorageEvent) {
      if (storageEvent.key !== BACKGROUND_STORAGE_KEY) return
      const nextMode = isBackgroundMode(storageEvent.newValue)
        ? storageEvent.newValue
        : DEFAULT_BACKGROUND_MODE
      document.documentElement.setAttribute('data-bkg', nextMode)
      setModeState(nextMode)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setMode = useCallback((nextMode: BackgroundMode) => {
    setModeState(nextMode)
    document.documentElement.setAttribute('data-bkg', nextMode)
    try {
      window.localStorage.setItem(BACKGROUND_STORAGE_KEY, nextMode)
    } catch {
      // Storage ditolak — pilihan tetap berlaku selama sesi, hanya
      // tidak persisten. Tidak perlu mengganggu pengunjung dengan error.
    }
  }, [])

  const cycleMode = useCallback(() => {
    const currentMode =
      (document.documentElement.getAttribute('data-bkg') as BackgroundMode) ??
      DEFAULT_BACKGROUND_MODE
    const currentIndex = BACKGROUND_MODES.indexOf(currentMode)
    setMode(BACKGROUND_MODES[(currentIndex + 1) % BACKGROUND_MODES.length])
  }, [setMode])

  const contextValue = useMemo(
    () => ({ mode, setMode, cycleMode }),
    [mode, setMode, cycleMode]
  )

  return (
    <BackgroundContext.Provider value={contextValue}>
      {children}
    </BackgroundContext.Provider>
  )
}

/** Hook pilihan background — harus di dalam <BackgroundProvider>. */
export function useBackground(): BackgroundContextValue {
  const contextValue = useContext(BackgroundContext)
  if (!contextValue) {
    throw new Error('useBackground must be used within BackgroundProvider')
  }
  return contextValue
}
