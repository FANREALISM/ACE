'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { hasInteracted, onFirstInteraction } from '@/lib/interaction'
import { DEFAULT_UI_THEME, useUITheme, type UITheme } from '@/lib/ui/UIThemeContext'
import { TUTORIAL_STEPS, TUTORIAL_STORAGE_KEYS, type TutorialStep } from './steps'

/** Event global untuk memulai ulang tutorial dari komponen mana pun
 *  (pola yang sama dengan 'open-command-palette'). */
export const START_TUTORIAL_EVENT = 'start-tutorial'

/** Jeda sebelum tutorial otomatis muncul (setelah interaksi pertama):
 *  biarkan transisi ganti-UI (kilatan) selesai dulu. */
const AUTO_START_DELAY_MS = 900

export interface TutorialApi {
  isActive: boolean
  /** Mulai dari langkah pertama, mengabaikan status "sudah pernah lihat". */
  start: () => void
  next: () => void
  back: () => void
  /** Tutup tanpa menyelesaikan — tetap dianggap sudah dilihat. */
  skip: () => void
  finish: () => void
  stepIndex: number
  steps: TutorialStep[]
  ui: UITheme
}

export const TutorialContext = createContext<TutorialApi | null>(null)

/** Hook publik: baca/ubah tutorial dari komponen mana pun di dalam
 *  <TutorialProvider>. */
export function useTutorial(): TutorialApi {
  const contextValue = useContext(TutorialContext)
  if (!contextValue) throw new Error('useTutorial must be used within TutorialProvider')
  return contextValue
}

// --- Penyimpanan "sudah dilihat" -------------------------------------------
// localStorage bisa melempar (mode privat / kebijakan cookie). Tanpa
// cadangan, tutorial akan muncul di SETIAP pindah halaman. Jadi: coba
// localStorage → sessionStorage → memori. Persisten bila bisa, minimal
// tidak berulang selama sesi.
const memorySeen = new Set<string>()

function readSeen(ui: UITheme): boolean {
  const key = TUTORIAL_STORAGE_KEYS[ui]
  if (memorySeen.has(key)) return true
  for (const storage of ['localStorage', 'sessionStorage'] as const) {
    try {
      if (window[storage].getItem(key) === '1') return true
    } catch {
      // coba penyimpanan berikutnya
    }
  }
  return false
}

function writeSeen(ui: UITheme) {
  const key = TUTORIAL_STORAGE_KEYS[ui]
  memorySeen.add(key)
  for (const storage of ['localStorage', 'sessionStorage'] as const) {
    try {
      window[storage].setItem(key, '1')
    } catch {
      // abaikan
    }
  }
}

/**
 * Logika tutorial (dipakai SATU kali oleh TutorialProvider):
 *  - kunjungan pertama PER UI → mulai otomatis (hanya di halaman '/')
 *  - ganti UI saat tutorial berjalan → tutup (tanpa menandai dilihat),
 *    lalu mulai versi UI baru bila belum pernah dilihat
 *  - tidak pernah jalan di /secret-cmd
 */
export function useTutorialController(): TutorialApi {
  const { ui: resolvedUI } = useUITheme()
  const pathname = usePathname()
  const ui: UITheme = resolvedUI ?? DEFAULT_UI_THEME
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = TUTORIAL_STEPS[ui]
  const isAdminRoute = pathname?.startsWith('/secret-cmd') ?? false
  const isHome = pathname === '/'

  // Ref: closure timer/event tidak basi.
  const stateRef = useRef({ ui, resolvedUI, isAdminRoute })
  stateRef.current = { ui, resolvedUI, isAdminRoute }

  const start = useCallback(() => {
    const { resolvedUI: currentUI, isAdminRoute: onAdmin } = stateRef.current
    if (!currentUI || onAdmin) return
    setStepIndex(0)
    setIsActive(true)
  }, [])

  const close = useCallback(() => {
    setIsActive(false)
    if (stateRef.current.resolvedUI) writeSeen(stateRef.current.resolvedUI)
  }, [])

  const next = useCallback(() => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }, [steps.length])

  const back = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0))
  }, [])

  // Auto-start / reset saat UI atau halaman berubah. Tutorial otomatis TIDAK
  // muncul saat halaman dimuat: dialog yang muncul sendiri di tengah
  // pemuatan menjadi elemen LCP terbesar dan menambah CLS/TBT (terukur di
  // Lighthouse: LCP 3,5 dtk dari dialog ini). Belum ada interaksi → tunggu
  // interaksi pertama. Sudah ada (mis. baru menekan tombol ganti UI) →
  // langsung (setelah jeda singkat).
  useEffect(() => {
    setIsActive(false)
    if (!resolvedUI || isAdminRoute || !isHome) return
    if (readSeen(resolvedUI)) return

    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(start, AUTO_START_DELAY_MS)
    }
    const cancelInteractionWait = hasInteracted()
      ? (schedule(), () => {})
      : onFirstInteraction(schedule)
    return () => {
      window.clearTimeout(timer)
      cancelInteractionWait()
    }
  }, [resolvedUI, isAdminRoute, isHome, start])

  // Replay dari tombol / command palette. Jeda singkat supaya fokus yang
  // dikembalikan palette (saat menutup) tidak merebut fokus dialog.
  useEffect(() => {
    let timer = 0
    function handleStartRequest() {
      window.clearTimeout(timer)
      timer = window.setTimeout(start, 350)
    }
    window.addEventListener(START_TUTORIAL_EVENT, handleStartRequest)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(START_TUTORIAL_EVENT, handleStartRequest)
    }
  }, [start])

  return useMemo(
    () => ({ isActive, start, next, back, skip: close, finish: close, stepIndex, steps, ui }),
    [isActive, start, next, back, close, stepIndex, steps, ui],
  )
}
