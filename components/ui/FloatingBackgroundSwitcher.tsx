'use client'

import { usePathname } from 'next/navigation'
import BackgroundSwitcher from './BackgroundSwitcher'
import UISwitcher from './UISwitcher'

/**
 * Tombol `[ UI: … ]` dan `[ BKG: … ]` yang melayang di pojok kanan bawah dan terlihat di
 * semua halaman publik (Hero, section, halaman proyek). Dipasang SEKALI di
 * app/layout.tsx — tidak perlu ditaruh di tiap halaman.
 *
 * - env(safe-area-inset-*) menjaga tombol tidak tertutup home-indicator
 *   iPhone atau notch saat landscape.
 * - z-40: di atas konten, di bawah navbar (z-50), command palette dan
 *   modal (z-100), jadi tidak pernah menimpa overlay.
 * - Tidak dirender di /secret-cmd (panel admin tidak punya latar ini).
 */
export default function FloatingBackgroundSwitcher() {
  const pathname = usePathname()
  if (pathname?.startsWith('/secret-cmd')) return null

  return (
    // <aside> = landmark "complementary": konten popover (daftar pilihan) tidak
    // lagi berada di luar landmark mana pun (aturan axe "region").
    <aside
      aria-label="Pengaturan tampilan"
      data-tutorial="display-controls"
      className="fixed z-40 flex flex-wrap items-end justify-end gap-2"
      style={{
        right: 'max(1rem, env(safe-area-inset-right))',
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <UISwitcher />
      <BackgroundSwitcher variant="floating" placement="up" align="right" />
    </aside>
  )
}
