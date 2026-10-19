'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TimelineEntry, TimelineEntryType } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import Reveal from '@/components/ui/Reveal'

/** Jumlah entri yang tampil per kategori sebelum "Tampilkan Lebih Banyak".
 *  Ubah angka ini kalau mau batas yang berbeda. */
const TIMELINE_LIMIT = 3

/** Batas baris deskripsi per entri sebelum dipotong + tombol "Tampilkan
 *  Lebih Banyak". */
const DESCRIPTION_LINES = 3

/** Urutan tab. Karir lebih dulu karena itu yang paling dicari recruiter. */
const TYPE_ORDER: TimelineEntryType[] = ['career', 'education']

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
  { node: string; tabActive: string; cardHover: string; accentText: string }
> = {
  career: {
    node: 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300',
    tabActive: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300',
    cardHover: 'hover:border-cyan-400/40',
    accentText: 'text-cyan-300',
  },
  education: {
    node: 'bg-purple-500/10 border-purple-400/30 text-purple-300',
    tabActive: 'bg-purple-500/20 border-purple-400/50 text-purple-300',
    cardHover: 'hover:border-purple-400/50',
    accentText: 'text-purple-300',
  },
}

/**
 * Deskripsi yang dibatasi {DESCRIPTION_LINES} baris. Seluruh teks TETAP ada
 * di DOM (hanya dipotong secara visual dengan max-height), jadi crawler dan
 * screen reader membaca semuanya. Tombol baru muncul kalau teksnya memang
 * lebih panjang dari batas — diukur di browser, karena jumlah baris
 * bergantung pada lebar layar dan font (tidak bisa ditebak dari jumlah
 * karakter). ResizeObserver mengukur ulang saat layar diputar/di-resize
 * atau bahasa diganti.
 *
 * Animasi buka/tutup memakai max-height antara dua angka piksel hasil
 * ukur (bukan line-clamp, yang tidak bisa dianimasikan dan melompat).
 */
function ExpandableDescription({
  text,
  accentText,
  showMoreLabel,
  showLessLabel,
  entryTitle,
}: {
  text: string
  accentText: string
  showMoreLabel: string
  showLessLabel: string
  entryTitle: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [metrics, setMetrics] = useState({
    fullHeight: 0,
    collapsedHeight: 0,
    isOverflowing: false,
  })
  const textRef = useRef<HTMLParagraphElement>(null)
  const regionId = useId()

  useEffect(() => {
    const textElement = textRef.current
    if (!textElement) return

    function measure() {
      if (!textElement) return
      const computedStyle = getComputedStyle(textElement)
      let lineHeight = parseFloat(computedStyle.lineHeight)
      // line-height "normal" → NaN; text-sm + leading-relaxed = 1.625em.
      if (Number.isNaN(lineHeight)) {
        lineHeight = parseFloat(computedStyle.fontSize) * 1.625
      }
      const collapsedHeight = lineHeight * DESCRIPTION_LINES
      const fullHeight = textElement.offsetHeight
      const isOverflowing = fullHeight > collapsedHeight + 2
      setMetrics((previous) =>
        previous.fullHeight === fullHeight &&
        previous.collapsedHeight === collapsedHeight &&
        previous.isOverflowing === isOverflowing
          ? previous
          : { fullHeight, collapsedHeight, isOverflowing }
      )
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(textElement)
    return () => resizeObserver.disconnect()
  }, [text])

  const isClamped = metrics.isOverflowing && !isExpanded
  // Sebelum ukuran terbaca (render server / paint pertama) pakai rumus CSS
  // yang sama dengan hasil ukur, jadi tidak ada lompatan layout.
  const maxHeight =
    metrics.isOverflowing && isExpanded
      ? metrics.fullHeight
      : metrics.collapsedHeight ||
        `calc(${DESCRIPTION_LINES} * 1.625 * 0.875rem)`

  return (
    <div className="mt-3">
      <div
        id={regionId}
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{
          maxHeight,
          // Memudar di baris terakhir sebagai petunjuk "masih ada lanjutan"
          // — pengganti "…" yang tidak bisa dipakai tanpa line-clamp.
          ...(isClamped
            ? {
                WebkitMaskImage:
                  'linear-gradient(to bottom, #000 calc(100% - 1.4rem), transparent)',
                maskImage:
                  'linear-gradient(to bottom, #000 calc(100% - 1.4rem), transparent)',
              }
            : {}),
        }}
      >
        <p
          ref={textRef}
          className="text-white/60 text-sm leading-relaxed whitespace-pre-line break-words"
        >
          {text}
        </p>
      </div>

      {metrics.isOverflowing && (
        <button
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
          aria-expanded={isExpanded}
          aria-controls={regionId}
          aria-label={`${isExpanded ? showLessLabel : showMoreLabel}: ${entryTitle}`}
          className={`group mt-2 inline-flex items-center gap-1.5 min-h-8 font-mono text-[11px] uppercase tracking-widest hover:opacity-80 transition-opacity ${accentText}`}
        >
          <span>{isExpanded ? showLessLabel : showMoreLabel}</span>
          <Icons.ChevronDown
            size={12}
            aria-hidden="true"
            className={`transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'
            }`}
          />
        </button>
      )}
    </div>
  )
}

/** Satu kartu entri + node ikon di garis vertikal. */
function TimelineItem({
  entry,
  locale,
  presentLabel,
  showMoreLabel,
  showLessLabel,
}: {
  entry: TimelineEntry
  locale: 'id' | 'en'
  presentLabel: string
  showMoreLabel: string
  showLessLabel: string
}) {
  const EntryIcon = resolveIcon(entry.icon, entry.type)
  const styles = TYPE_STYLES[entry.type]
  const startLabel = formatMonthYear(entry.start_date, locale)
  const endLabel = entry.is_current
    ? presentLabel
    : entry.end_date
      ? formatMonthYear(entry.end_date, locale)
      : null

  return (
    <li className="relative pl-14 pb-4 md:pb-5">
      {/* Node. bg-black (dipetakan ke putih di light theme) sebagai alas
          solid supaya garis tidak tembus lewat latar node yang semi-
          transparan. */}
      <div className="absolute left-5 top-4 -translate-x-1/2 rounded-xl bg-black">
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

      <article
        className={`glass-card hover-lift p-4 md:p-5 min-w-0 ${styles.cardHover}`}
      >
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/40 mb-2">
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

        {/* break-words: judul panjang dunia nyata ("Internship Developer -
            Aplikasi Warehouse Management System (WMS T-Connect)") harus
            turun baris, bukan meluber keluar kartu di layar sempit. */}
        <h3 className="text-base sm:text-lg font-semibold text-white/90 leading-snug break-words">
          {entry.title}
        </h3>
        <p className="text-sm text-white/50 mt-1 break-words">
          {entry.organization}
        </p>

        {entry.description && (
          <ExpandableDescription
            text={entry.description}
            accentText={styles.accentText}
            showMoreLabel={showMoreLabel}
            showLessLabel={showLessLabel}
            entryTitle={entry.title}
          />
        )}
      </article>
    </li>
  )
}

/**
 * Section "Karir & Pendidikan" — dua tab pill ([ KARIR ] / [ PENDIDIKAN ]),
 * hanya {TIMELINE_LIMIT} entri teratas per tab, sisanya dibuka lewat tombol
 * "Tampilkan Lebih Banyak".
 *
 * SEO: kedua panel dan semua entri TETAP ada di HTML hasil server. Panel
 * tab yang tidak aktif memakai atribut `hidden`, entri tambahan hanya
 * disembunyikan secara visual (tinggi 0 + invisible) — bukan tidak
 * dirender — jadi crawler tetap membaca seluruh isi CMS. Urutan data
 * (terbaru dulu) ditentukan query di app/page.tsx. Section hilang (return
 * null) kalau belum ada entri.
 */
export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { translations, locale } = useLanguage()
  const baseId = useId()
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const headRef = useRef<HTMLDivElement>(null)

  const entriesByType: Record<TimelineEntryType, TimelineEntry[]> = {
    career: entries.filter((entry) => entry.type === 'career'),
    education: entries.filter((entry) => entry.type === 'education'),
  }
  // Tab hanya untuk kategori yang punya data — tab kosong membingungkan.
  const availableTypes = TYPE_ORDER.filter(
    (type) => entriesByType[type].length > 0
  )

  const [activeType, setActiveType] = useState<TimelineEntryType>(
    availableTypes[0] ?? 'career'
  )
  const [expandedByType, setExpandedByType] = useState<
    Record<TimelineEntryType, boolean>
  >({ career: false, education: false })
  // overflow-hidden hanya dibutuhkan SELAMA animasi buka/tutup. Kalau terus
  // dipasang, hover-lift kartu (naik 3px + bayangan lebar) terpotong di
  // tepi pembungkus. "settled" = animasi buka sudah selesai → overflow
  // dilepas.
  const [settledByType, setSettledByType] = useState<
    Record<TimelineEntryType, boolean>
  >({ career: false, education: false })

  if (entries.length === 0) return null

  const typeLabels: Record<TimelineEntryType, string> = {
    career: translations.timeline.career,
    education: translations.timeline.education,
  }

  function selectTab(nextType: TimelineEntryType, shouldFocus: boolean) {
    setActiveType(nextType)
    if (shouldFocus) tabRefs.current[nextType]?.focus()
  }

  /** Pola WAI-ARIA tabs: panah kiri/kanan pindah tab, Home/End ke ujung. */
  function handleTabKeyDown(
    keyboardEvent: React.KeyboardEvent,
    currentIndex: number
  ) {
    const lastIndex = availableTypes.length - 1
    let nextIndex: number | null = null
    if (keyboardEvent.key === 'ArrowRight')
      nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1
    else if (keyboardEvent.key === 'ArrowLeft')
      nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1
    else if (keyboardEvent.key === 'Home') nextIndex = 0
    else if (keyboardEvent.key === 'End') nextIndex = lastIndex
    if (nextIndex === null) return
    keyboardEvent.preventDefault()
    selectTab(availableTypes[nextIndex], true)
  }

  function toggleExpanded(type: TimelineEntryType) {
    const willCollapse = expandedByType[type]
    setExpandedByType((previous) => ({ ...previous, [type]: !previous[type] }))
    if (willCollapse) {
      setSettledByType((previous) => ({ ...previous, [type]: false }))
    }
    // Menutup daftar dari tombol di bawah memendekkan halaman; tanpa ini
    // pengunjung "terlempar" jauh dari tempat tadi membaca. 'nearest' =
    // hanya scroll kalau judul section sudah keluar layar.
    if (willCollapse) {
      headRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const gradientLine =
    'linear-gradient(to bottom, transparent, var(--gradient-from) 6%, var(--gradient-via) 50%, var(--gradient-to) 94%, transparent)'

  return (
    <section
      id="timeline"
      aria-labelledby="timeline-heading"
      className="section-y px-6 max-w-3xl mx-auto scroll-mt-20"
    >
      <Reveal>
      <div ref={headRef} className="mb-6 md:mb-8 scroll-mt-24">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-3">
          [ {translations.timeline.label} ]
        </p>
        <h2
          id="timeline-heading"
          className="text-3xl sm:text-4xl font-bold"
        >
          {translations.timeline.heading}{' '}
          <span className="text-gradient">
            {translations.timeline.headingAccent}
          </span>
        </h2>
      </div>
      </Reveal>

      <Reveal delay={0.1}>
        {/* Tab pill. Indikator aktif = pil bergeser (layoutId) + border &
            warna berubah + glow currentColor, jadi terbaca walau tanpa
            membedakan warna saja. */}
        <div
          role="tablist"
          aria-label={`${translations.timeline.heading} ${translations.timeline.headingAccent}`}
          className="relative inline-flex max-w-full p-1 mb-6 rounded-full border border-white/10 bg-white/5"
        >
          {availableTypes.map((type, typeIndex) => {
            const isActive = activeType === type
            return (
              <button
                key={type}
                ref={(element) => {
                  tabRefs.current[type] = element
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${type}`}
                aria-selected={isActive}
                aria-controls={`${baseId}-panel-${type}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(type, false)}
                onKeyDown={(keyboardEvent) =>
                  handleTabKeyDown(keyboardEvent, typeIndex)
                }
                className={`relative min-h-11 px-4 sm:px-5 rounded-full font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                  isActive
                    ? TYPE_STYLES[type].accentText
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId={`${baseId}-tab-pill`}
                    aria-hidden="true"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className={`absolute inset-0 rounded-full border ${TYPE_STYLES[type].tabActive}`}
                    style={{ boxShadow: '0 0 16px -4px currentColor' }}
                  />
                )}
                <span className="relative">
                  [ {typeLabels[type].toUpperCase()} ]
                </span>
                <span className="relative ml-2 text-[10px] tabular-nums opacity-70">
                  {entriesByType[type].length}
                </span>
              </button>
            )
          })}
        </div>

        {availableTypes.map((type) => {
          const typeEntries = entriesByType[type]
          const visibleEntries = typeEntries.slice(0, TIMELINE_LIMIT)
          const extraEntries = typeEntries.slice(TIMELINE_LIMIT)
          const isExpanded = expandedByType[type]
          const extrasId = `${baseId}-extras-${type}`

          return (
            <div
              key={type}
              role="tabpanel"
              id={`${baseId}-panel-${type}`}
              aria-labelledby={`${baseId}-tab-${type}`}
              hidden={activeType !== type}
              className="tl-panel-in"
            >
              <div className="relative">
                {/* Garis vertikal: satu lapis tipis + satu lapis blur untuk
                    glow. Pakai CSS var tema supaya ikut merah di light. */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 left-5 w-px -translate-x-1/2 opacity-60"
                  style={{ background: gradientLine }}
                />
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 left-5 w-[3px] -translate-x-1/2 opacity-25 blur-[3px]"
                  style={{ background: gradientLine }}
                />

                <ol className="relative">
                  {visibleEntries.map((entry) => (
                    <TimelineItem
                      key={entry.id}
                      entry={entry}
                      locale={locale}
                      presentLabel={translations.timeline.present}
                      showMoreLabel={translations.timeline.showMore}
                      showLessLabel={translations.timeline.showLess}
                    />
                  ))}
                </ol>

                {extraEntries.length > 0 && (
                  // Buka/tutup mulus: grid-template-rows 0fr↔1fr
                  // menganimasikan tinggi "auto" tanpa mengukur DOM atau
                  // JS (max-height butuh angka tebakan yang bikin
                  // animasi tersendat). invisible = tidak bisa difokus
                  // saat tertutup, tapi teksnya tetap ada di HTML.
                  <div
                    id={extrasId}
                    onTransitionEnd={(transitionEvent) => {
                      if (
                        isExpanded &&
                        transitionEvent.target === transitionEvent.currentTarget &&
                        transitionEvent.propertyName === 'grid-template-rows'
                      ) {
                        setSettledByType((previous) => ({
                          ...previous,
                          [type]: true,
                        }))
                      }
                    }}
                    className={`grid transition-[grid-template-rows,opacity,visibility] duration-500 ease-in-out ${
                      isExpanded
                        ? 'grid-rows-[1fr] opacity-100 visible'
                        : 'grid-rows-[0fr] opacity-0 invisible'
                    }`}
                  >
                    {/* -mx-4 px-4: selama animasi, overflow-hidden memotong
                        glow node di tepi kiri; padding ini memberi
                        ruangnya kembali. */}
                    <div
                      className={`min-h-0 -mx-4 px-4 ${
                        isExpanded && settledByType[type]
                          ? 'overflow-visible'
                          : 'overflow-hidden'
                      }`}
                    >
                      <ol start={TIMELINE_LIMIT + 1} className="relative">
                        {extraEntries.map((entry) => (
                          <TimelineItem
                            key={entry.id}
                            entry={entry}
                            locale={locale}
                            presentLabel={translations.timeline.present}
                            showMoreLabel={translations.timeline.showMore}
                            showLessLabel={translations.timeline.showLess}
                          />
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {extraEntries.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleExpanded(type)}
                  aria-expanded={isExpanded}
                  aria-controls={extrasId}
                  className="group mt-2 ml-14 inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-white/15 bg-transparent font-mono text-[11px] sm:text-xs uppercase tracking-widest text-white/60 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors"
                  style={{ boxShadow: 'none' }}
                >
                  <span>
                    {isExpanded
                      ? translations.timeline.showLess
                      : `${translations.timeline.showMore} (+${extraEntries.length})`}
                  </span>
                  <Icons.ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'
                    }`}
                  />
                </button>
              )}
            </div>
          )
        })}
      </Reveal>
    </section>
  )
}
