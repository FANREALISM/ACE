'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

/**
 * Tautan "Lewati ke konten utama" — tautan fokusable PERTAMA di setiap
 * halaman, tampil hanya saat difokus keyboard (lihat .skip-link di
 * globals.css). Memungkinkan pengguna keyboard/screen reader melompati
 * navigasi (WCAG 2.4.1).
 *
 * Hanya dirender kalau halaman memang punya target #main-content —
 * tautan ke target yang tidak ada lebih buruk daripada tidak ada tautan.
 * Teks mengikuti bahasa aktif (versi lama hard-coded bahasa Inggris).
 */
export default function SkipLink() {
  const { translations } = useLanguage()
  const pathname = usePathname()
  const [hasTarget, setHasTarget] = useState(true)

  useEffect(() => {
    setHasTarget(document.getElementById('main-content') !== null)
  }, [pathname])

  if (!hasTarget) return null

  return (
    <a href="#main-content" className="skip-link">
      {translations.navbar.skipToContent}
    </a>
  )
}
