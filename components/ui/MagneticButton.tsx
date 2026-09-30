'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useHoverCapable } from '@/lib/useHoverCapable'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  /** Seberapa jauh tombol "tertarik" ke arah kursor, dalam piksel.
   *  Nilai kecil (8-16px) terasa halus/premium; nilai besar terasa
   *  norak. Default 10px dipilih supaya efeknya kerasa tapi subtle. */
  strength?: number
}

/**
 * Wrapper "magnetic" — elemen di dalamnya sedikit tertarik ke arah
 * kursor saat di-hover, lalu pegas kembali ke posisi semula saat kursor
 * keluar. Dipakai untuk tombol utama (CV download, submit form) supaya
 * terasa lebih hidup/interaktif tanpa menambah beban render:
 * useMotionValue + useSpring dari Framer Motion menulis langsung ke
 * transform CSS elemen di luar siklus render React — sama prinsipnya
 * dengan spotlight card (lihat ProjectsGrid.tsx), cuma API-nya beda
 * (motion value vs direct DOM mutation) karena di sini kita memang
 * sudah pakai <motion.div> dan Framer Motion punya cara bawaan yang
 * sama efisiennya.
 *
 * Otomatis nonaktif di perangkat tanpa hover asli (touchscreen) lewat
 * useHoverCapable — di HP, elemen ini render statis tanpa listener
 * tambahan sama sekali.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 10,
}: MagneticButtonProps) {
  const supportsHover = useHoverCapable()
  const offsetX = useMotionValue(0)
  const offsetY = useMotionValue(0)
  // useSpring membungkus motion value mentah dengan fisika pegas —
  // gerakannya jadi halus/elastis, bukan langsung "nempel" ke posisi
  // kursor. Ini juga GPU-accelerated (transform), bukan animasi yang
  // memicu layout reflow.
  const springX = useSpring(offsetX, { stiffness: 150, damping: 15 })
  const springY = useSpring(offsetY, { stiffness: 150, damping: 15 })

  function handleMouseMove(mouseEvent: React.MouseEvent<HTMLDivElement>) {
    if (!supportsHover) return
    const bounds = mouseEvent.currentTarget.getBoundingClientRect()
    const relativeX = mouseEvent.clientX - (bounds.left + bounds.width / 2)
    const relativeY = mouseEvent.clientY - (bounds.top + bounds.height / 2)
    offsetX.set((relativeX / bounds.width) * strength * 2)
    offsetY.set((relativeY / bounds.height) * strength * 2)
  }

  function handleMouseLeave() {
    offsetX.set(0)
    offsetY.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}
