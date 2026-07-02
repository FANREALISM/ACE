'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import type { Profile } from '@/lib/types'

interface MenuItem {
  label: string
  href: string
  isAnchor: boolean
}

const menuItems: MenuItem[] = [
  { label: 'START_JOURNEY', href: '#about', isAnchor: true },
  { label: 'LOAD_PROJECTS', href: '#projects', isAnchor: true },
  { label: 'ACHIEVEMENTS', href: '#certificates', isAnchor: true },
  { label: 'SYSTEM_ADMIN', href: '/secret-cmd', isAnchor: false },
]

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
      {/* Cursor indicator box */}
      <motion.span
        animate={{
          opacity: hovered ? 1 : 0,
          scale: hovered ? 1 : 0.6,
        }}
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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Title block (right side gets negative space on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-mono font-bold uppercase text-4xl md:text-6xl tracking-tight text-white mb-3">
            {profile?.name ?? 'AFFAN RABBANI'}
          </h1>
          <h2 className="font-mono uppercase text-sm md:text-base tracking-widest text-cyan-400/80">
            {profile?.role ?? 'SOFTWARE ENGINEER // REKAYASA PERANGKAT LUNAK'}
          </h2>
        </motion.div>

        {/* Right: Vertical menu */}
        <nav aria-label="Main menu" className="flex flex-col">
          {menuItems.map((item, i) => (
            <MenuButton key={item.label} item={item} index={i} />
          ))}
        </nav>
      </div>

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
