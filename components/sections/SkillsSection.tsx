'use client'

import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Skill } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

/** Cari komponen ikon Lucide berdasarkan nama string dari database.
 *  Fallback ke Code2 (bukan Cpu seperti About.tsx — dipilih beda supaya
 *  ikon default section ini terasa relevan dengan "skill/tech" kalau
 *  admin belum sempat pilih ikon spesifik). */
function resolveIcon(iconName: string): LucideIcon {
  return (
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ?? Icons.Code2
  )
}

/**
 * Section "Tech Stack" — kumpulan chip skill dengan ikon, ditampilkan
 * sebagai awan tag yang wrap otomatis. Section ini hilang sepenuhnya
 * (return null) kalau belum ada skill diisi, bukan tampil kosong.
 */
export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const { translations } = useLanguage()

  if (skills.length === 0) return null

  return (
    <section id="skills" className="py-32 px-6 max-w-5xl mx-auto scroll-mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-16 text-center"
      >
        {translations.skills.heading}{' '}
        <span className="text-gradient">
          {translations.skills.headingAccent}
        </span>
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-4">
        {skills.map((skill, skillIndex) => {
          const SkillIcon = resolveIcon(skill.icon)
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              // Delay bertahap kecil per chip supaya kemunculannya
              // terasa seperti gelombang, bukan semua chip muncul
              // bersamaan sekaligus.
              transition={{ duration: 0.3, delay: skillIndex * 0.03 }}
              className="glass-card px-5 py-3 flex items-center gap-3 hover:border-cyan-400/40 hover:scale-105 transition-all"
              title={skill.category ?? undefined}
            >
              <SkillIcon size={16} className="text-cyan-300" />
              <span className="text-sm text-white/80">{skill.name}</span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
