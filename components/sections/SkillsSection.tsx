'use client'

import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Skill } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

function resolveIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Code2
}

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const { t } = useLanguage()

  if (skills.length === 0) return null

  return (
    <section id="skills" className="py-24 px-6 max-w-5xl mx-auto scroll-mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-12 text-center"
      >
        {t.skills.heading} <span className="text-gradient">{t.skills.headingAccent}</span>
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-3">
        {skills.map((skill, i) => {
          const Icon = resolveIcon(skill.icon)
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="glass-card px-4 py-2.5 flex items-center gap-2.5 hover:border-cyan-400/40 transition-colors"
              title={skill.category ?? undefined}
            >
              <Icon size={16} className="text-cyan-300" />
              <span className="text-sm text-white/80">{skill.name}</span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
