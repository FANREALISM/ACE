'use client'

import { motion } from 'framer-motion'
import type { AboutSection } from '@/lib/types'

export default function About({ sections }: { sections: AboutSection[] }) {
  return (
    <section id="about" className="py-24 px-6 max-w-3xl mx-auto scroll-mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-10"
      >
        Tentang <span className="text-gradient">Saya</span>
      </motion.h2>

      {sections.length === 0 ? (
        <p className="text-white/40">Belum ada konten.</p>
      ) : (
        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-cyan-400/70 mb-3">
                [ {section.title} ]
              </p>
              <p className="text-white/60 text-lg leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}