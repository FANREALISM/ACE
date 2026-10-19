import type { BackgroundMode } from './useBackground'

/**
 * Deteksi kemampuan perangkat untuk memilih latar belakang awal, dua tahap:
 *
 * 1. TEBAKAN STATIS (`detectInitialMode`) — murah, sebelum render.
 *    Memakai sinyal yang tersedia di browser: Save-Data, koneksi 2G,
 *    prefers-reduced-motion, deviceMemory (Chrome/Android), jumlah core.
 *    Logikanya DIDUPLIKASI di inline script app/layout.tsx (script itu
 *    harus jalan sebelum hydrate agar tidak ada kedip) — ubah keduanya
 *    bersamaan.
 *    Keterbatasan: deviceMemory & hardwareConcurrency tidak ada di
 *    Safari/Firefox dan nilainya dibulatkan; jumlah core juga menyesatkan
 *    (Samsung J7 Pro punya 8 core lemah). Karena itu tebakan ini hanya
 *    menangkap kasus yang jelas.
 *
 * 2. UKUR LANGSUNG (`startPerformanceProbe`) — akurat. Setelah PS2
 *    benar-benar berjalan, ukur frame rate sebenarnya. Kalau terlalu
 *    rendah dua kali berturut-turut, turunkan ke ambient. Ini yang
 *    menangkap HP seperti J7 Pro yang lolos tebakan statis.
 */

/** Kunci terpisah dari pilihan manual: pilihan manual pengunjung tidak
 *  pernah ditimpa oleh deteksi otomatis. */
export const AUTO_BACKGROUND_STORAGE_KEY = 'portfolio-bkg-auto'

interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}

export function detectInitialMode(): BackgroundMode {
  try {
    const nav = navigator as Navigator & {
      connection?: NetworkInformationLike
      deviceMemory?: number
    }
    const connection = nav.connection
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (connection?.saveData || prefersReducedMotion) return 'normal'

    const isSlowNetwork = /^(slow-2g|2g)$/.test(connection?.effectiveType ?? '')
    const isLowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2
    const isLowCores =
      typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2
    if (isSlowNetwork || isLowMemory || isLowCores) return 'ambient'
  } catch {
    // Abaikan — jatuh ke default.
  }
  return 'ps2'
}

const SAMPLE_WINDOW_MS = 2500
const MIN_FRAMES_PER_WINDOW = 15
const SLOW_MEDIAN_FRAME_MS = 40 // median > 40ms ≈ di bawah 25 fps
const JANK_FRAME_MS = 50
const JANK_SHARE_LIMIT = 0.4
const SLOW_WINDOWS_REQUIRED = 2

function isWindowSlow(frameDeltas: number[]): boolean {
  const sorted = [...frameDeltas].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const jankShare =
    frameDeltas.filter((delta) => delta > JANK_FRAME_MS).length /
    frameDeltas.length
  return median > SLOW_MEDIAN_FRAME_MS || jankShare > JANK_SHARE_LIMIT
}

/**
 * Ukur frame rate lewat requestAnimationFrame. Memanggil `onSlow` kalau
 * `SLOW_WINDOWS_REQUIRED` jendela berturut-turut terlalu lambat; berhenti
 * sendiri begitu satu jendela dinilai cukup lancar (tidak mengukur
 * selamanya). Tab yang disembunyikan membatalkan jendela berjalan —
 * rAF dihentikan browser di tab latar, jadi bukan sinyal perangkat lemah.
 * Mengembalikan fungsi pembatal.
 */
export function startPerformanceProbe(
  onSlow: () => void,
  warmupMs = 2000,
): () => void {
  let isCancelled = false
  let rafHandle = 0
  let warmupHandle = 0
  let lastTimestamp = 0
  let windowStart = 0
  let frameDeltas: number[] = []
  let consecutiveSlowWindows = 0

  function resetWindow() {
    lastTimestamp = 0
    windowStart = 0
    frameDeltas = []
  }

  function onFrame(timestamp: number) {
    if (isCancelled) return
    if (document.hidden) {
      resetWindow()
    } else {
      if (windowStart === 0) windowStart = timestamp
      if (lastTimestamp !== 0) frameDeltas.push(timestamp - lastTimestamp)
      lastTimestamp = timestamp

      if (timestamp - windowStart >= SAMPLE_WINDOW_MS) {
        if (frameDeltas.length >= MIN_FRAMES_PER_WINDOW) {
          if (isWindowSlow(frameDeltas)) {
            consecutiveSlowWindows += 1
            if (consecutiveSlowWindows >= SLOW_WINDOWS_REQUIRED) {
              onSlow()
              return
            }
          } else {
            return // lancar → selesai mengukur
          }
        }
        resetWindow()
      }
    }
    rafHandle = window.requestAnimationFrame(onFrame)
  }

  // Beri waktu chunk PS2 diunduh & diinisialisasi sebelum mengukur.
  warmupHandle = window.setTimeout(() => {
    rafHandle = window.requestAnimationFrame(onFrame)
  }, warmupMs)

  return () => {
    isCancelled = true
    window.clearTimeout(warmupHandle)
    window.cancelAnimationFrame(rafHandle)
  }
}
