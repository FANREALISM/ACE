'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AboutSection } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

/** Cari komponen ikon Lucide berdasarkan nama string (disimpan di
 *  database sebagai text, dipilih admin lewat icon picker). Fallback ke
 *  Cpu kalau nama tidak dikenali (mis. data lama atau typo). */
function resolveIcon(iconName: string): LucideIcon {
  const matchedIcon = (Icons as unknown as Record<string, LucideIcon>)[
    iconName
  ]
  return matchedIcon ?? Icons.Cpu
}

/**
 * Section "Tentang Saya" — daftar paragraf yang bisa diedit dari admin
 * panel, masing-masing dengan ikon dan gambar opsional. Layout gambar
 * berselang-seling kiri/kanan berdasarkan urutan paragraf.
 */
export default function About({ sections }: { sections: AboutSection[] }) {
  const { translations, locale } = useLanguage()

  return (
    <section id="about" aria-labelledby="about-heading" className="section-y px-6 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="section-head-gap"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-3">
          {translations.about.label}
        </p>
        <h2 id="about-heading" className="text-3xl sm:text-4xl font-bold">
          {translations.about.heading}{' '}
          <span className="text-gradient">
            {translations.about.headingAccent}
          </span>
        </h2>
      </motion.div>

      {sections.length === 0 ? (
        <p className="text-white/40">{translations.about.empty}</p>
      ) : (
        <div className="space-y-12 md:space-y-20">
          {sections.map((section, sectionIndex) => {
            const SectionIcon = resolveIcon(section.icon)
            // Selang-seling posisi gambar kiri/kanan tiap paragraf ganjil
            // — murni variasi visual, tidak ada makna fungsional.
            const isImageReversed = sectionIndex % 2 === 1

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className={`flex flex-col ${
                  section.image_url
                    ? isImageReversed
                      ? 'md:flex-row-reverse'
                      : 'md:flex-row'
                    : ''
                } gap-6 md:gap-8 items-center`}
              >
                {section.image_url && (
                  <div className="w-full md:w-2/5 shrink-0">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                      {/* Parent sudah punya position:relative +
                          aspect-[4/3] (lihat className-nya di atas), jadi
                          fill langsung bisa dipakai tanpa wrapper
                          tambahan. */}
                      <Image
                        src={section.image_url}
                        alt={section.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        loading="lazy"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </div>
                )}

                <div className={section.image_url ? 'md:w-3/5' : 'w-full'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shrink-0">
                      <SectionIcon size={18} strokeWidth={1.75} />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                  </div>

                  <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">
                    {section.title}
                  </p>
                  <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                    {/* Konten Inggris cuma dipakai kalau memang diisi
                        (translate-on-write via tombol admin) — kalau
                        kosong, fallback ke Bahasa Indonesia daripada
                        menampilkan teks kosong. */}
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
