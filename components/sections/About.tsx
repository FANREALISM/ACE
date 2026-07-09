'use client'

import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AboutSection } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name]
  return icon ?? Icons.Cpu
}

export default function About({ sections }: { sections: AboutSection[] }) {
  const { t, locale } = useLanguage()
  return (
    <section id="about" className="py-32 px-6 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-3">
          {t.about.label}
        </p>
        <h2 className="text-4xl font-bold">
          {t.about.heading} <span className="text-gradient">{t.about.headingAccent}</span>
        </h2>
      </motion.div>

      {sections.length === 0 ? (
        <p className="text-white/40">{t.about.empty}</p>
      ) : (
        <div className="space-y-20">
          {sections.map((section, i) => {
            const Icon = resolveIcon(section.icon)
            const reversed = i % 2 === 1

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className={`flex flex-col ${
                  section.image_url
                    ? reversed
                      ? 'md:flex-row-reverse'
                      : 'md:flex-row'
                    : ''
                } gap-8 items-center`}
              >
                {section.image_url && (
                  <div className="w-full md:w-2/5 shrink-0">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={section.image_url}
                        alt={section.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </div>
                )}

                <div className={section.image_url ? 'md:w-3/5' : 'w-full'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shrink-0">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                  </div>

                  <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">
                    {section.title}
                  </p>
                  <p className="text-white/70 text-lg leading-relaxed">
                    {locale === 'en' && section.content_en
                      ? section.content_en
                      : section.content}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
