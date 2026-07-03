'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import type { Profile } from '@/lib/types'
import { menuItems } from '@/lib/menuItems'
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
        </nav>
      </div>
    </motion.header>
  )
}
