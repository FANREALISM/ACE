'use client'

import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types'

export default function Hero({ profile }: { profile: Profile | null }) {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-2xl"
      >
        <p className="text-cyan-400 font-mono text-sm mb-4 tracking-widest">
          {profile?.role ?? 'Full-Stack Developer'}
        </p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
          {profile?.name ?? 'Nama Kamu'}
        </h1>
        <p className="text-white/60 text-lg mb-10 leading-relaxed">
          {profile?.short_description ??
            'Membangun pengalaman digital yang elegan dan futuristik.'}
        </p>
        <motion.a
          href="#projects"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glow-btn inline-block px-8 py-3 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-medium"
        >
          Lihat Proyek Saya
        </motion.a>
      </motion.div>
    </section>
  )
}
