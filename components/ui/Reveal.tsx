'use client'

import { motion, useReducedMotion } from 'framer-motion'

export type RevealVariant = 'fade-up' | 'fade-left' | 'fade-right' | 'scale'

/** Kondisi awal (sebelum masuk viewport) per varian. Semuanya hanya
 *  transform + opacity — dikomposit GPU, tidak memicu layout. */
const HIDDEN_STATE: Record<
  RevealVariant,
  { opacity: number; x?: number; y?: number; scale?: number }
> = {
  'fade-up': { opacity: 0, y: 24 },
  'fade-left': { opacity: 0, x: -32 },
  'fade-right': { opacity: 0, x: 32 },
  scale: { opacity: 0, scale: 0.92 },
}

interface RevealProps {
  children: React.ReactNode
  variant?: RevealVariant
  /** Detik. Pakai delay bertingkat (0, 0.1, 0.2…) untuk efek stagger. */
  delay?: number
  duration?: number
  className?: string
}

/**
 * Pembungkus animasi "muncul saat di-scroll" yang bisa dipakai ulang di
 * section mana pun — sekali jalan (viewport once), jadi tidak berulang
 * tiap scroll naik-turun. Menghormati prefers-reduced-motion: kalau
 * pengguna memintanya, anak dirender apa adanya tanpa animasi (Framer
 * Motion tidak melakukan ini otomatis).
 */
export default function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  className,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={HIDDEN_STATE[variant]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
