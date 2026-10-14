'use client'

import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TimelineEntry, TimelineEntryType } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

/** Cari komponen ikon Lucide berdasarkan nama string dari database.
 *  Fallback mengikuti tipe entri (Briefcase / GraduationCap) kalau nama
 *  tidak dikenali, mis. data lama atau typo dari Table Editor. */
function resolveIcon(iconName: string, type: TimelineEntryType): LucideIcon {
  const matchedIcon = (Icons as unknown as Record<string, LucideIcon>)[
    iconName
  ]
  if (matchedIcon) return matchedIcon
  return type === 'education' ? Icons.GraduationCap : Icons.Briefcase
}

/** Format "YYYY-MM-DD" → "Mar 2022" tanpa lewat timezone lokal.
 *  new Date("2022-03-01") dibaca sebagai UTC; kalau diformat dengan zona
 *  lokal pengunjung (mis. UTC-8) hasilnya bisa mundur ke bulan lalu.
 *  Makanya tanggal dibangun dari Date.UTC dan diformat dengan
 *  timeZone: 'UTC' — bulan yang tampil selalu bulan yang disimpan. */
function formatMonthYear(isoDate: string, locale: 'id' | 'en'): string {
  const [yearPart, monthPart] = isoDate.split('-').map(Number)
  if (!yearPart || !monthPart) return isoDate
  return new Date(Date.UTC(yearPart, monthPart - 1, 1)).toLocaleDateString(
    locale === 'id' ? 'id-ID' : 'en-US',
    { month: 'short', year: 'numeric', timeZone: 'UTC' }
  )
}

/** Warna per tipe. Sengaja hanya memakai kombinasi class cyan (karir) dan
 *  purple (pendidikan) yang SUDAH dipetakan ke tema light di globals.css —
 *  class warna baru di luar daftar itu akan tetap cyan/ungu di tema putih
 *  merah dan terlihat asing. */
const TYPE_STYLES: Record<
  TimelineEntryType,
  { node: string; badge: string; cardHover: string; accentText: string }
> = {
  career: {
    node: 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300',
    badge: 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300',
    cardHover: 'hover:border-cyan-400/40',
    accentText: 'text-cyan-300',
  },
  education: {
    node: 'bg-purple-500/10 border-purple-400/30 text-purple-300',
    badge: 'bg-purple-500/10 border-purple-400/30 text-purple-300',
    cardHover: 'hover:border-purple-400/50',
    accentText: 'text-purple-300',
  },
}

/**
 * Section "Timeline Karir & Pendidikan" — garis vertikal dengan node
 * menyala. Di desktop, pendidikan di sisi kiri dan karir di sisi kanan
 * garis tengah (pemisahan tipe terbaca dari posisi, bukan cuma warna);
 * di mobile garis pindah ke kiri dan semua kartu di sisi kanannya,
 * dibedakan lewat warna + badge. Urutan data (terbaru dulu) ditentukan
 * query di app/page.tsx. Section hilang (return null) kalau belum ada
 * entri.
 */
export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { translations, locale } = useLanguage()

  if (entries.length === 0) return null

  const typeLabels: Record<TimelineEntryType, string> = {
    career: translations.timeline.career,
    education: translations.timeline.education,
  }

  return (
    <section
      id="timeline"
      className="py-32 px-6 max-w-5xl mx-auto scroll-mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-3">
          [ {translations.timeline.label} ]
        </p>
        <h2 className="text-4xl font-bold">
          {translations.timeline.heading}{' '}
          <span className="text-gradient">
            {translations.timeline.headingAccent}
          </span>
        </h2>

        {/* Legenda — menjelaskan arti warna/sisi sekali di atas, supaya
            kartu tidak perlu mengulang penjelasan. */}
        <div className="flex flex-wrap gap-3 mt-6">
          {(['career', 'education'] as const).map((legendType) => (
            <span
              key={legendType}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[11px] uppercase tracking-widest ${TYPE_STYLES[legendType].badge}`}
            >
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
              {typeLabels[legendType]}
            </span>
          ))}
        </div>
      </motion.div>

      <ol className="relative">
        {/* Garis vertikal: satu lapis tipis + satu lapis blur di belakangnya
            untuk efek glow. Pakai CSS var tema supaya ikut berubah ke
            merah di light theme. */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-5 md:left-1/2 w-px -translate-x-1/2 opacity-60"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--gradient-from) 6%, var(--gradient-via) 50%, var(--gradient-to) 94%, transparent)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-5 md:left-1/2 w-[3px] -translate-x-1/2 opacity-25 blur-[3px]"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--gradient-from) 6%, var(--gradient-via) 50%, var(--gradient-to) 94%, transparent)',
          }}
        />

        {entries.map((entry) => {
          const EntryIcon = resolveIcon(entry.icon, entry.type)
          const styles = TYPE_STYLES[entry.type]
          const isCareer = entry.type === 'career'
          const startLabel = formatMonthYear(entry.start_date, locale)
          const endLabel = entry.is_current
            ? translations.timeline.present
            : entry.end_date
              ? formatMonthYear(entry.end_date, locale)
              : null

          return (
            <li
              key={entry.id}
              className="relative pl-14 md:pl-0 md:grid md:grid-cols-2 md:gap-x-16 pb-12 last:pb-0"
            >
              {/* Node. bg-black (dipetakan ke putih di light theme) sebagai
                  alas solid supaya garis tidak tembus lewat latar node
                  yang semi-transparan. */}
              <div className="absolute left-5 md:left-1/2 top-5 -translate-x-1/2 rounded-xl bg-black">
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-xl border ${styles.node}`}
                  style={{ boxShadow: '0 0 18px -4px currentColor' }}
                >
                  {entry.is_current && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-current opacity-20 animate-ping"
                    />
                  )}
                  <EntryIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
              </div>

              <motion.article
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className={`glass-card hover-lift p-5 md:p-6 ${styles.cardHover} ${
                  isCareer
                    ? 'md:col-start-2'
                    : 'md:col-start-1 md:row-start-1 md:text-right'
                }`}
              >
                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 mb-3 ${
                    isCareer ? '' : 'md:justify-end'
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded-md border font-mono text-[10px] uppercase tracking-widest ${styles.badge}`}
                  >
                    {typeLabels[entry.type]}
                  </span>
                  <p className="font-mono text-xs uppercase tracking-widest text-white/40">
                    <time dateTime={entry.start_date}>{startLabel}</time>
                    {endLabel && (
                      <>
                        {' — '}
                        {entry.is_current || !entry.end_date ? (
                          <span className={entry.is_current ? styles.accentText : ''}>
                            {endLabel}
                          </span>
                        ) : (
                          <time dateTime={entry.end_date}>{endLabel}</time>
                        )}
                      </>
                    )}
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-white/90">
                  {entry.title}
                </h3>
                <p className="text-white/50 mt-1">{entry.organization}</p>

                {entry.description && (
                  <p className="text-white/60 text-sm leading-relaxed mt-4 whitespace-pre-line">
                    {entry.description}
                  </p>
                )}
              </motion.article>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
