import type { Metadata } from 'next'
import Link from 'next/link'

/** Judul jelas untuk tab/riwayat browser. noindex dipasang otomatis oleh
 *  Next.js untuk halaman not-found, tidak perlu diulang di sini. */
export const metadata: Metadata = {
  title: 'Halaman tidak ditemukan',
}

/** Halaman 404 kustom (Next.js App Router not-found.tsx convention) —
 *  dipicu otomatis lewat notFound() (mis. di /projects/[id] untuk
 *  proyek yang tidak ada) atau URL yang genuinely tidak cocok route
 *  manapun. */
export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus-visible:outline-none min-h-screen flex items-center justify-center px-6 bg-black text-white text-center"
    >
      <div>
        <p className="font-mono text-6xl font-bold text-gradient mb-4">404</p>
        <h1 className="text-2xl font-bold mb-3">Halaman tidak ditemukan.</h1>
        <p className="text-white/50 mb-8">
          URL yang kamu tuju tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  )
}
