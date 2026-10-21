'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * Template (bukan layout): di-mount ULANG di setiap navigasi antar menu
 * admin, jadi animasi masuk berjalan tiap pindah halaman. Fade + naik
 * tipis, hanya transform/opacity; dimatikan untuk prefers-reduced-motion.
 */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
