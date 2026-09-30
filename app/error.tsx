'use client'

import { useEffect } from 'react'

/**
 * Error boundary halaman (Next.js App Router error.tsx convention) —
 * menangkap error React yang tidak tertangani di mana pun dalam tree
 * halaman ini, menampilkan UI fallback yang konsisten dengan desain
 * situs (bukan halaman crash generik Next.js).
 *
 * `error` dan `reset` adalah nama prop yang WAJIB persis seperti ini —
 * ini konvensi Next.js sendiri, bukan pilihan penamaan bebas.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black text-white text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-red-400/80 mb-4">
          [ System Error ]
        </p>
        <h1 className="text-3xl font-bold mb-3">Ada yang salah.</h1>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          Terjadi error yang tidak terduga. Coba muat ulang halaman — kalau
          masih terjadi, kemungkinan ada masalah di sisi server.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
