'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useBackground } from '@/lib/background/useBackground'

/**
 * Chunk PS2 dipisah dari bundle utama lewat next/dynamic dengan
 * `ssr: false`:
 *   - tidak ikut di JS yang dibutuhkan untuk render pertama (HTML konten
 *     + hydrate), jadi tidak menambah TBT/INP;
 *   - tidak dirender di server — canvas memang tidak ada gunanya di SSR;
 *   - TIDAK diunduh sama sekali kalau pengunjung memilih ambient/normal
 *     (komponen ini baru me-render <PS2Background /> setelah mode
 *     terpastikan 'ps2').
 *
 * `ssr: false` hanya diizinkan di Client Component — itulah alasan file
 * ini 'use client' dan layout.tsx (Server Component) memanggilnya, bukan
 * memanggil dynamic() langsung.
 */
const PS2Background = dynamic(() => import('./PS2Background'), {
  ssr: false,
  loading: () => null,
})

/** Jalankan callback saat browser idle SETELAH halaman selesai dimuat,
 *  supaya animasi berat tidak berebut dengan render konten / LCP.
 *  Mengembalikan fungsi pembatal untuk cleanup effect. */
function runWhenIdle(callback: () => void, timeoutMs: number): () => void {
  let isCancelled = false
  let idleHandle: number | null = null
  let timeoutHandle: number | null = null

  function schedule() {
    if (isCancelled) return
    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleHandle = idleWindow.requestIdleCallback(
        () => {
          if (!isCancelled) callback()
        },
        { timeout: timeoutMs }
      )
    } else {
      // Safari belum punya requestIdleCallback — setTimeout cukup.
      timeoutHandle = window.setTimeout(() => {
        if (!isCancelled) callback()
      }, 600)
    }
  }

  if (document.readyState === 'complete') {
    schedule()
  } else {
    window.addEventListener('load', schedule, { once: true })
  }

  return () => {
    isCancelled = true
    window.removeEventListener('load', schedule)
    if (idleHandle !== null) {
      ;(window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(idleHandle)
    }
    if (timeoutHandle !== null) window.clearTimeout(timeoutHandle)
  }
}

/**
 * Latar belakang global — dipasang SEKALI di app/layout.tsx.
 *
 * Tiga lapis statis (fallback PS2, ambient CSS, normal) SELALU ada di
 * HTML hasil server dan ditampilkan/disembunyikan murni oleh CSS lewat
 * atribut `data-bkg` di <html> (diisi inline script sebelum hydrate).
 * Jadi sejak paint pertama sudah ada latar yang benar, tanpa menunggu
 * JavaScript — dan layer yang tidak aktif `display: none`, artinya tidak
 * ada biaya render/animasi untuk mereka.
 *
 * Untuk mode 'ps2', canvas animasi di-lazy-load di atas layer fallback
 * (nebula biru statis) dan di-fade-in setelah frame pertama siap, jadi
 * tidak ada lompatan visual.
 *
 * Tidak dirender di /secret-cmd (panel admin menutup latar dengan
 * background solid, jadi animasi di sana cuma buang CPU).
 */
export default function Background() {
  const pathname = usePathname()
  const { mode } = useBackground()
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => runWhenIdle(() => setIsIdle(true), 2500), [])

  if (pathname?.startsWith('/secret-cmd')) return null

  return (
    <>
      <div aria-hidden="true" className="bkg-root">
        <div className="bkg-layer bkg-ps2-fallback" />

        <div className="bkg-layer bkg-ambient">
          <i className="bkg-blob bkg-blob-a" />
          <i className="bkg-blob bkg-blob-b" />
          <i className="bkg-blob bkg-blob-c" />
          <i className="bkg-blob bkg-blob-d" />
        </div>

        <div className="bkg-layer bkg-normal" />
      </div>

      {mode === 'ps2' && isIdle && <PS2Background />}
    </>
  )
}
