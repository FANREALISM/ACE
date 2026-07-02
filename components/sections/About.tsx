'use client'

import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types'

export default function About({ profile }: { profile: Profile | null }) {
  return (
    <section id="about" className="py-24 px-6 max-w-3xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6">
          Tentang <span className="text-gradient">Saya</span>
        </h2>
        <p className="text-white/60 text-lg leading-relaxed">
          {profile?.long_description ??
            profile?.short_description ??
            'Software Engineer yang fokus membangun produk web & mobile yang elegan, fungsional, dan futuristik.'}
        </p>
      </motion.div>
    </section>
  )
}
