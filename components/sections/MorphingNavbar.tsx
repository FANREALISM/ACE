'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Profile } from '@/lib/types'
import { menuItems } from '@/lib/menuItems'
import { Menu } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import ThemeToggle from '@/components/ui/ThemeToggle'
import BackgroundSwitcher from '@/components/ui/BackgroundSwitcher'

/**
 * Navbar yang "muncul" (fade-in dari atas) setelah pengunjung scroll
 * melewati sebagian besar Hero section — sebelum itu, navigasi utama
 * datang dari menu vertikal di dalam Hero sendiri, bukan navbar ini.
 */
export default function MorphingNavbar({
  profile,
}: {
  profile: Profile | null
}) {
  const { translations } = useLanguage()
  const { scrollY } = useScroll()

  // Sebelumnya [350, 550] — angka piksel absolut yang sama masalahnya
  // dengan bug fade Hero: tidak proporsional ke tinggi viewport. Di layar
  // pendek, threshold ini bisa kepicu padahal Hero belum benar-benar
  // "selesai", atau di layar tinggi malah baru muncul telat. Dihitung
  // dari tinggi viewport saat mount (window hanya ada di client, aman
  // karena komponen ini 'use client' dan baris ini jalan saat render
  // browser, bukan SSR pass pertama — tidak butuh useEffect karena nilai
  // ini cuma dipakai sebagai konstanta range, bukan re-computed tiap resize).
  // Range digeser dari [0.4, 0.65] ke [0.7, 0.95] tinggi viewport supaya
  // navbar baru muncul setelah Hero (yang kini bertahan lebih lama) mulai
  // memudar — tidak bertumpuk dengan konten Hero yang masih terlihat.
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const navbarOpacity = useTransform(
    scrollY,
    [viewportHeight * 0.7, viewportHeight * 0.95],
    [0, 1]
  )
  const navbarTranslateY = useTransform(
    scrollY,
    [viewportHeight * 0.7, viewportHeight * 0.95],
    [-16, 0]
  )

  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent('open-command-palette'))
  }

  return (
    <motion.header
      style={{
        opacity: navbarOpacity,
        y: navbarTranslateY,
        // env() resolve ke 0 di device tanpa notch — ini tidak menambah
        // padding apa pun di mayoritas device, cuma aktif di device yang
        // benar-benar butuh (notch/Dynamic Island, terutama saat
        // landscape di mana notch bisa menjorok dari SAMPING, bukan
        // cuma dari atas).
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav pointer-events-none"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          {profile?.avatar_url && (
            <Image
              src={profile.avatar_url}
              alt={profile?.name ?? 'Foto profil'}
              width={32}
              height={32}
              // Ukuran tetap (bukan responsive), jadi width/height
              // eksplisit lebih tepat daripada fill — tidak butuh
              // wrapper relative tambahan.
              loading="lazy"
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
          )}
          <span className="font-mono font-bold text-sm uppercase tracking-widest text-white/90">
            {profile?.name ?? 'AFFAN RABBANI'}
          </span>
        </div>

        <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-wider">
          {/* Link penuh cuma di layar >= 1024px (lg) — dengan 6 link + pill
              bahasa + tema + ⌘K, lebar total ~800px: di tablet 768px sudah
              meluber keluar layar (terukur 819px). Di bawah lg, satu tombol
              menu membuka command palette. Di layar sempit, 5 link + pill
              bahasa + badge ⌘K dijamin overflow horizontal kalau tetap
              dipaksa satu baris tanpa wrap atau menu mobile. */}
          <div className="hidden lg:flex items-center gap-5">
            {menuItems.map((menuItem) =>
              menuItem.isAnchor ? (
                <a
                  key={menuItem.key}
                  href={menuItem.href}
                  // relative + group: pembungkus untuk underline animasi
                  // di bawah. Murni CSS — scale-x-0 ke scale-x-100 lewat
                  // group-hover, transform-only (scaleX), tidak ada JS
                  // atau listener tambahan sama sekali.
                  className="relative group text-white/60 hover:text-cyan-400 transition-colors"
                >
                  {translations.nav[menuItem.key]}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-cyan-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200"
                  />
                </a>
              ) : (
                <Link
                  key={menuItem.key}
                  href={menuItem.href}
                  className="relative group text-white/60 hover:text-cyan-400 transition-colors"
                >
                  {translations.nav[menuItem.key]}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-cyan-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200"
                  />
                </Link>
              )
            )}
            <LanguageSwitcher variant="compact" />
            <ThemeToggle variant="compact" />
            <BackgroundSwitcher variant="compact" placement="down" align="right" />
            <button
              onClick={openCommandPalette}
              aria-label="Buka command palette"
              title="Command palette (Ctrl/Cmd + K)"
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border border-white/15 text-white/50 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
            >
              <kbd className="text-[10px]">⌘K</kbd>
            </button>
          </div>

          {/* Di mobile, satu tombol menu membuka command palette — yang
              sudah punya navigasi ke semua section + toggle bahasa + link
              admin, jadi dipakai ulang sebagai menu mobile alih-alih
              membangun drawer terpisah. */}
          <button
            onClick={openCommandPalette}
            aria-label="Buka menu navigasi"
            className="lg:hidden flex items-center justify-center min-w-11 min-h-11 rounded-lg border border-white/15 text-white/70 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
          >
            <Menu size={16} />
          </button>
        </nav>
      </div>
    </motion.header>
  )
}
