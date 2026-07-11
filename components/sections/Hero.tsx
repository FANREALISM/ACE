'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import type { Profile } from '@/lib/types'
import { menuItems, type MenuItem } from '@/lib/menuItems'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import ThemeToggle from '@/components/ui/ThemeToggle'

function MenuButton({
  item,
  index,
  label,
}: {
  item: MenuItem
  index: number
  label: string
}) {
  const [hovered, setHovered] = useState(false)

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex items-center gap-4 py-4 cursor-pointer select-none"
    >
      <motion.span
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.15 }}
        className="w-3 h-3 bg-cyan-400 shrink-0"
        style={{ boxShadow: hovered ? '0 0 12px rgba(34,211,238,0.8)' : 'none' }}
      />
      <motion.span
        animate={{ x: hovered ? 12 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`font-mono font-bold text-2xl md:text-3xl tracking-wider uppercase transition-colors duration-150 ${
          hovered ? 'text-cyan-400' : 'text-white/80'
        }`}
      >
        [ {label} ]
      </motion.span>
    </motion.div>
  )

  if (item.isAnchor) {
    return (
      <a href={item.href} aria-label={label}>
        {content}
      </a>
    )
  }

  return (
    <Link href={item.href} aria-label={label}>
      {content}
    </Link>
  )
}

export default function Hero({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage()

  // Peta ukuran foto profil — dikontrol dari Settings admin panel.
  // Fallback ke 'md' kalau profile null, avatar_size belum diisi, atau
  // migrasi add_avatar_size.sql belum dijalankan (kolom belum ada).
  const AVATAR_SIZES: Record<string, string> = {
    sm: 'w-20 h-20 md:w-28 md:h-28',
    md: 'w-28 h-28 md:w-36 md:h-36',
    lg: 'w-36 h-36 md:w-44 md:h-44',
    xl: 'w-44 h-44 md:w-52 md:h-52',
  }
  const avatarSizeClass = AVATAR_SIZES[profile?.avatar_size ?? 'md'] ?? AVATAR_SIZES.md

  // Fade + shrink the hero menu as the user scrolls through the hero's own
  // height. Progress is 0 at top, 1 once scrolled past the hero viewport.
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const heroY = useTransform(scrollY, [0, 500], [0, -40])

  return (
    <section className="relative min-h-screen w-full bg-black flex items-center py-28 md:py-24">
      {/* Semua layer dekoratif dibungkus overflow-hidden-nya sendiri —
          supaya blur circle yang sengaja "meluber" (translate-x-32) tidak
          memicu horizontal scroll, TANPA ikut memotong konten asli kalau
          section ini jadi lebih tinggi dari viewport di layar pendek. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Scanline / grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, white 0px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Grid lines background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px]" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[110px] translate-x-32" />
        </div>
      </div>

      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center"
      >
        {/* Left: Photo + Title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-8"
        >
          {profile && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wide ${
                profile.is_available
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/15 bg-white/5 text-white/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  profile.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
                }`}
              />
              {profile.is_available
                ? t.hero.availableBadge
                : t.hero.unavailableBadge}
            </div>
          )}

          {profile?.avatar_url ? (
            <div
              className={`${avatarSizeClass} rounded-2xl overflow-hidden border border-white/10 bg-white/5`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url}
                alt={profile?.name ?? 'Foto profil'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`${avatarSizeClass} rounded-2xl border border-dashed border-white/15 bg-white/5 flex items-center justify-center`}
            >
              <span className="font-mono text-xs text-white/30 uppercase text-center px-2">
                No Photo
              </span>
            </div>
          )}

          <div>
            <h1 className="font-mono font-bold uppercase text-4xl md:text-6xl tracking-tight text-white mb-3">
              {profile?.name ?? 'AFFAN RABBANI'}
            </h1>
            <h2 className="font-mono uppercase text-sm md:text-base tracking-widest text-cyan-400/80">
              {profile?.role ?? t.hero.roleFallback}
            </h2>

            {profile?.cv_url && (
              <a
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="glow-btn inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors"
              >
                {t.hero.downloadCv}
              </a>
            )}
          </div>
        </motion.div>

        {/* Right: Vertical menu */}
        <nav aria-label="Main menu" className="flex flex-col">
          {menuItems.map((item, i) => (
            <MenuButton
              key={item.key}
              item={item}
              index={i}
              label={t.nav[item.key]}
            />
          ))}
          <div className="pt-2 border-t border-white/10 mt-2 flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-widest text-white/30"
      >
        {t.hero.scrollHint}
      </motion.div>
    </section>
  )
}