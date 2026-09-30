import type { Dictionary } from './i18n/types'

/**
 * Satu entri navigasi utama situs (dipakai di menu vertikal Hero dan
 * navbar setelah scroll — keduanya render dari array yang sama di
 * bawah, jadi menambah/menghapus item di sini otomatis ter-refleksi di
 * kedua tempat).
 */
export interface MenuItem {
  /** Key ke dictionary i18n (lib/i18n/types.ts) — label sebenarnya
   *  diambil dari situ, bukan disimpan langsung di sini, supaya ikut
   *  berubah saat bahasa di-toggle. */
  key: keyof Dictionary['nav']
  /** URL tujuan — bisa anchor (#about) atau path halaman (/secret-cmd). */
  href: string
  /** true = anchor link dalam satu halaman (pakai <a>), false = navigasi
   *  ke halaman lain (pakai next/link <Link> untuk client-side routing). */
  isAnchor: boolean
}

/**
 * Daftar menu navigasi publik. Item "SYSTEM_ADMIN" sengaja tidak ada di
 * sini lagi — akses admin sekarang lewat keyboard shortcut (Ctrl/Cmd+
 * Shift+A) atau command palette, bukan link yang terlihat.
 */
export const menuItems: MenuItem[] = [
  { key: 'startJourney', href: '#about', isAnchor: true },
  { key: 'techStack', href: '#skills', isAnchor: true },
  { key: 'loadProjects', href: '#projects', isAnchor: true },
  { key: 'achievements', href: '#certificates', isAnchor: true },
]
