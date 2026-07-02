'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import type { Profile } from '@/lib/types'
import { menuItems, type MenuItem } from '@/lib/menuItems'

function MenuButton({ item, index }: { item: MenuItem; index: number }) {
  const [hovered, setHovered] = useState(false)

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex items-center gap-4 py-3 cursor-pointer select-none"
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
        [ {item.label} ]
      </motion.span>
    </motion.div>
  )

  if (item.isAnchor) {
    return (
      <a href={item.href} aria-label={item.label}>
        {content}
      </a>
    )
  }

  return (
    <Link href={item.href} aria-label={item.label}>
      {content}
    </Link>
  )
}

export default function Hero({ profile }: { profile: Profile | null }) {
  // Fade + shrink the hero menu as the user scrolls through the hero's own
  // height. Progress is 0 at top, 1 once scrolled past the hero viewport.
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const heroY = useTransform(scrollY, [0, 500], [0, -40])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black flex items-center">
      {/* Scanline / grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, white 0px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Grid lines background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[110px] translate-x-32" />
      </div>

      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center"
      >
        {/* Left: Photo + Title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-6"
        >
          {profile?.avatar_url ? (
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url}
                alt={profile?.name ?? 'Foto profil'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border border-dashed border-white/15 bg-white/5 flex items-center justify-center">
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
              {profile?.role ?? 'SOFTWARE ENGINEER // REKAYASA PERANGKAT LUNAK'}
            </h2>
          </div>
        </motion.div>

        {/* Right: Vertical menu */}
        <nav aria-label="Main menu" className="flex flex-col">
          {menuItems.map((item, i) => (
            <MenuButton key={item.label} item={item} index={i} />
          ))}
        </nav>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-widest text-white/30"
      >
        scroll ↓
      </motion.div>
    </section>
  )
}