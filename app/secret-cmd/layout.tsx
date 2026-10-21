import type { Metadata } from 'next'
import './admin.css'

/**
 * Layout ini membungkus SEMUA route di bawah /secret-cmd — login DAN
 * semua halaman (protected) — karena ditaruh satu level di atas
 * keduanya. Satu-satunya tugasnya: pasang metadata noindex di sini,
 * supaya berlaku otomatis ke seluruh segment tanpa perlu diulang di
 * tiap halaman.
 *
 * Ini LAPISAN KEDUA proteksi dari indexing, bukan yang pertama.
 * `robots.txt` (app/robots.ts) sudah men-disallow /secret-cmd, tapi itu
 * cuma instruksi ke crawler yang PATUH — kalau ada crawler yang
 * mengabaikannya, atau halaman ini ke-link dari luar dan ter-crawl
 * lewat jalur lain, meta tag `robots: noindex` di sini adalah
 * pertahanan langsung di level halaman itu sendiri, yang jauh lebih
 * sulit diabaikan search engine dibanding robots.txt.
 */
export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function SecretCmdSegmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
