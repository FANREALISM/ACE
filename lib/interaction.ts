'use client'

import { useEffect, useState } from 'react'

/**
 * "Pengunjung sudah benar-benar berinteraksi" — satu sumber kebenaran untuk
 * menunda pekerjaan dekoratif/tidak mendesak sampai ada yang menyentuh
 * halaman:
 *   - latar PS2 (canvas animasi yang berat),
 *   - tutorial otomatis.
 *
 * KENAPA: pekerjaan itu berebut main thread dengan hydrate, LCP, dan input
 * pertama. Di HP lemah (CPU 4x lebih lambat di emulasi mobile Lighthouse)
 * itu langsung terbaca sebagai TBT/LCP tinggi. Menundanya sampai interaksi
 * pertama tidak mengurangi apa pun bagi pengunjung yang aktif (animasi
 * muncul dalam hitungan detik setelah mulai scroll/ketuk), tapi memberi
 * pemuatan awal seluruh kapasitas CPU.
 *
 * Catatan: pointermove sengaja TIDAK dihitung (gerakan mouse tak sengaja
 * bukan tanda niat membaca).
 */
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const

let interacted = false
let listenersInstalled = false
const pendingCallbacks = new Set<() => void>()

function handleInteraction() {
  if (interacted) return
  interacted = true
  for (const eventName of INTERACTION_EVENTS) {
    window.removeEventListener(eventName, handleInteraction, true)
  }
  const callbacks = Array.from(pendingCallbacks)
  pendingCallbacks.clear()
  for (const callback of callbacks) callback()
}

function installListeners() {
  if (listenersInstalled || typeof window === 'undefined') return
  listenersInstalled = true
  for (const eventName of INTERACTION_EVENTS) {
    window.addEventListener(eventName, handleInteraction, { passive: true, capture: true })
  }
}

export function hasInteracted(): boolean {
  return interacted
}

/** Panggil `callback` pada interaksi pertama (langsung kalau sudah terjadi).
 *  Mengembalikan fungsi pembatal. */
export function onFirstInteraction(callback: () => void): () => void {
  if (interacted) {
    callback()
    return () => {}
  }
  installListeners()
  pendingCallbacks.add(callback)
  return () => {
    pendingCallbacks.delete(callback)
  }
}

/** Hook: false di server & render pertama, true setelah interaksi pertama. */
export function useHasInteracted(): boolean {
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  useEffect(() => onFirstInteraction(() => setHasUserInteracted(true)), [])
  return hasUserInteracted
}
