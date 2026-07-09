'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import type { Profile } from '@/lib/types'
import { menuItems } from '@/lib/menuItems'
import { Menu } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function MorphingNavbar({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage()
  const { scrollY } = useScroll()
  // Starts appearing once the Hero menu (fades out 0-500px) is mostly gone.
  const navOpacity = useTransform(scrollY, [350, 550], [0, 1])
  const navY = useTransform(scrollY, [350, 550], [-16, 0])

  return (
    <motion.header
      style={{ opacity: navOpacity, y: navY }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav pointer-events-none"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          {profile?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile?.name ?? 'Foto profil'}
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
          )}
          <span className="font-mono font-bold text-sm uppercase tracking-widest text-white/90">
            {profile?.name ?? 'AFFAN RABBANI'}
          </span>
        </div>

        <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-wider">
          {/* Link penuh cuma di desktop — di layar sempit, 5 link + pill
              bahasa + badge ⌘K dijamin overflow horizontal kalau tetap
              dipaksa satu baris tanpa wrap atau menu mobile. */}
          <div className="hidden md:flex items-center gap-5">
            {menuItems.map((item) =>
              item.isAnchor ? (
                <a
                  key={item.key}
                  href={item.href}
                  className="text-white/60 hover:text-cyan-400 transition-colors"
                >
                  {t.nav[item.key]}
                </a>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-white/60 hover:text-cyan-400 transition-colors"
                >
                  {t.nav[item.key]}
                </Link>
              )
            )}
            <LanguageSwitcher variant="compact" />
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent('open-command-palette'))
              }
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
            onClick={() =>
              window.dispatchEvent(new CustomEvent('open-command-palette'))
            }
            aria-label="Buka menu navigasi"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 text-white/70 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
          >
            <Menu size={16} />
          </button>
        </nav>
      </div>
    </motion.header>
  )
}
