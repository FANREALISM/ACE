'use client'

import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Skill } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import Reveal from '@/components/ui/Reveal'

/** Cari komponen ikon Lucide berdasarkan nama string dari database.
 *  Fallback ke Code2 (bukan Cpu seperti About.tsx — dipilih beda supaya
 *  ikon default section ini terasa relevan dengan "skill/tech" kalau
 *  admin belum sempat pilih ikon spesifik). */
function resolveIcon(iconName: string): LucideIcon {
  return (
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ?? Icons.Code2
  )
}

/** Jumlah minimum chip dalam satu "putaran" marquee. Kalau skill cuma
 *  3–4, satu putaran akan lebih pendek dari lebar layar dan terlihat
 *  ada celah kosong di ujung — makanya daftar diulang sampai cukup. */
const MIN_CHIPS_PER_LOOP = 10

/** Detik per chip. ~3.2s per chip ≈ 40px/detik dengan lebar chip rata-
 *  rata — cukup pelan untuk dibaca, cukup gerak untuk terasa hidup. */
const SECONDS_PER_CHIP = 3.2

/** Ulangi daftar skill sampai minimal MIN_CHIPS_PER_LOOP. */
function buildLoop(skills: Skill[]): Skill[] {
  const loop: Skill[] = []
  while (loop.length < MIN_CHIPS_PER_LOOP) loop.push(...skills)
  return loop
}

function SkillChip({ skill }: { skill: Skill }) {
  const SkillIcon = resolveIcon(skill.icon)
  return (
    <div
      className="glass-card px-5 py-3 flex items-center gap-3 shrink-0 hover:border-cyan-400/40 transition-colors"
      title={skill.category ?? undefined}
    >
      <SkillIcon size={16} className="text-cyan-300" aria-hidden="true" />
      <span className="text-sm text-white/80 whitespace-nowrap">
        {skill.name}
      </span>
    </div>
  )
}

/**
 * Satu baris marquee. Track berisi DUA salinan identik dari daftar chip
 * berdampingan; animasi menggeser track sejauh -50% (tepat satu salinan)
 * lalu mengulang, sehingga lompatan reset tidak terlihat. Salinan kedua
 * aria-hidden supaya screen reader tidak membaca setiap skill dua kali.
 * Berhenti saat di-hover/fokus (dan saat disentuh di layar sentuh).
 */
function MarqueeRow({
  skills,
  isReversed,
}: {
  skills: Skill[]
  isReversed: boolean
}) {
  const loopSkills = buildLoop(skills)
  const durationSeconds = loopSkills.length * SECONDS_PER_CHIP

  return (
    <div className="marquee-row" role="group" tabIndex={0} aria-label="Skills">
      <div
        className={`marquee-track ${isReversed ? 'marquee-reverse' : ''}`}
        style={{ ['--marquee-duration' as string]: `${durationSeconds}s` }}
      >
        <div className="marquee-group">
          {loopSkills.map((skill, chipIndex) => (
            <SkillChip key={`a-${skill.id}-${chipIndex}`} skill={skill} />
          ))}
        </div>
        <div className="marquee-group" aria-hidden="true">
          {loopSkills.map((skill, chipIndex) => (
            <SkillChip key={`b-${skill.id}-${chipIndex}`} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Section "Tech Stack" — carousel marquee tak berujung. Skill >= 8 dibagi
 * ke dua baris yang bergerak berlawanan arah; kurang dari itu satu baris
 * saja. Section ini hilang sepenuhnya (return null) kalau belum ada skill
 * diisi, bukan tampil kosong.
 */
export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const { translations } = useLanguage()

  if (skills.length === 0) return null

  const useTwoRows = skills.length >= 8
  const firstRowSkills = useTwoRows
    ? skills.filter((_, skillIndex) => skillIndex % 2 === 0)
    : skills
  const secondRowSkills = useTwoRows
    ? skills.filter((_, skillIndex) => skillIndex % 2 === 1)
    : []

  return (
    <section id="skills" aria-labelledby="skills-heading" className="section-y scroll-mt-20">
      <Reveal className="px-6 max-w-5xl mx-auto">
        <h2 id="skills-heading" className="text-2xl sm:text-3xl font-bold section-head-gap text-center">
          {translations.skills.heading}{' '}
          <span className="text-gradient">
            {translations.skills.headingAccent}
          </span>
        </h2>
      </Reveal>

      <Reveal delay={0.1} className="space-y-4">
        <MarqueeRow skills={firstRowSkills} isReversed={false} />
        {secondRowSkills.length > 0 && (
          <MarqueeRow skills={secondRowSkills} isReversed />
        )}
      </Reveal>
    </section>
  )
}
