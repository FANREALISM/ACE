'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { useHoverCapable } from '@/lib/useHoverCapable'

/**
 * Grid proyek dengan filter tech-stack, hover-preview bubble yang
 * mengikuti kursor, dan klik-card yang navigasi langsung ke website
 * proyek (bukan modal — lihat catatan di handleCardClick).
 */
export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const { translations, locale } = useLanguage()
  const supportsHover = useHoverCapable()
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null)
  const [activeTechFilter, setActiveTechFilter] = useState<string | null>(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [bubbleWidth, setBubbleWidth] = useState(360)
  const pendingAnimationFrameRef = useRef<number | null>(null)
  // Elemen card yang sedang di-hover — dipakai untuk efek spotlight
  // (radial-gradient mengikuti kursor). SENGAJA disimpan lewat ref, BUKAN
  // React state: posisi spotlight di-update dengan langsung menulis ke
  // CSS custom property elemen (style.setProperty), melewati siklus
  // render React sepenuhnya. Kalau ini pakai setState, tiap gerakan
  // mouse akan trigger re-render seluruh grid — untuk efek visual murni
  // dekoratif yang tidak mengubah struktur DOM, itu kerja yang tidak
  // perlu. Ini teknik standar untuk cursor-follow effect yang benar-benar
  // tidak menambah beban render.
  const hoveredCardElementRef = useRef<HTMLDivElement | null>(null)

  // Kalau komponen ini unmount (mis. user navigasi ke /secret-cmd lewat
  // command palette) SAAT rAF masih pending dari mousemove terakhir,
  // callback-nya tetap akan fire dan panggil setState di komponen yang
  // sudah unmounted — React warning, berpotensi jadi hard error di versi
  // React mendatang. Cancel eksplisit di cleanup.
  useEffect(() => {
    return () => {
      if (pendingAnimationFrameRef.current !== null) {
        cancelAnimationFrame(pendingAnimationFrameRef.current)
      }
    }
  }, [])

  const BUBBLE_MARGIN_FROM_VIEWPORT_EDGE = 12
  // Bubble harus lebih besar dari card aslinya, bukan cuma "lebih besar
  // dari sebelumnya" — 1.35x lebar card yang di-hover.
  const BUBBLE_SIZE_MULTIPLIER = 1.35

  /** Dipanggil saat kursor masuk ke sebuah card — ukur lebar card asli
   *  (lewat getBoundingClientRect, bukan angka tebakan) supaya bubble
   *  preview-nya bisa di-skalakan proporsional lebih besar dari itu. */
  function handleCardMouseEnter(projectId: string, cardElement: HTMLElement) {
    if (!supportsHover) return
    const cardBounds = cardElement.getBoundingClientRect()
    setBubbleWidth(Math.round(cardBounds.width * BUBBLE_SIZE_MULTIPLIER))
    setHoveredProjectId(projectId)
    hoveredCardElementRef.current = cardElement as HTMLDivElement
  }

  function handleCardMouseLeave() {
    if (!supportsHover) return
    setHoveredProjectId(null)
    hoveredCardElementRef.current = null
  }

  /** Update posisi bubble mengikuti kursor — di-throttle lewat
   *  requestAnimationFrame supaya tidak re-render di setiap event
   *  mousemove mentah (bisa puluhan-ratusan kali/detik), cukup maksimal
   *  sekali per frame yang benar-benar di-render browser. Frame yang
   *  sama juga dipakai untuk update posisi spotlight (lihat komentar di
   *  hoveredCardElementRef) — satu rAF, dua efek, bukan dua listener
   *  terpisah yang bersaing. */
  function handleCardMouseMove(mouseEvent: React.MouseEvent) {
    if (!supportsHover) return
    const cursorX = mouseEvent.clientX
    const cursorY = mouseEvent.clientY
    if (pendingAnimationFrameRef.current !== null) return
    pendingAnimationFrameRef.current = requestAnimationFrame(() => {
      setCursorPosition({ x: cursorX, y: cursorY })

      // Spotlight: tulis langsung ke CSS custom property, TIDAK lewat
      // setState — lihat catatan lengkap di deklarasi
      // hoveredCardElementRef di atas.
      const cardElement = hoveredCardElementRef.current
      if (cardElement) {
        const cardBounds = cardElement.getBoundingClientRect()
        const relativeX = ((cursorX - cardBounds.left) / cardBounds.width) * 100
        const relativeY = ((cursorY - cardBounds.top) / cardBounds.height) * 100
        cardElement.style.setProperty('--spotlight-x', `${relativeX}%`)
        cardElement.style.setProperty('--spotlight-y', `${relativeY}%`)
      }

      pendingAnimationFrameRef.current = null
    })
  }

  /** Hitung posisi fixed bubble berdasarkan posisi kursor terakhir.
   *  Sengaja pakai angka piksel polos (bukan CSS transform) untuk
   *  centering horizontal — Framer Motion menulis langsung ke
   *  elemen.style.transform tiap frame buat animasi enter/exit, jadi
   *  transform statis lain akan tumpang tindih dengan itu. */
  function computeBubblePosition(
    cursorX: number,
    cursorY: number
  ): React.CSSProperties {
    // Clamp lebar bubble sendiri ke lebar viewport dulu, SEBELUM hitung
    // posisi left — tanpa ini, di viewport sempit tapi hover-capable
    // (mis. iPad dengan trackpad, tablet Windows kecil), bubbleWidth
    // (1.35x lebar card) bisa lebih lebar dari viewport itu sendiri.
    // Itu bikin Math.max/Math.min di bawah menghasilkan `left` negatif —
    // bubble terdorong sebagian ke luar layar kiri, bukan cuma "kurang
    // pas", benar-benar terpotong.
    const clampedBubbleWidth = Math.min(
      bubbleWidth,
      window.innerWidth - BUBBLE_MARGIN_FROM_VIEWPORT_EDGE * 2
    )
    const bubbleLeft = Math.min(
      Math.max(
        cursorX - clampedBubbleWidth / 2,
        BUBBLE_MARGIN_FROM_VIEWPORT_EDGE
      ),
      window.innerWidth - clampedBubbleWidth - BUBBLE_MARGIN_FROM_VIEWPORT_EDGE
    )
    // Default: bubble muncul DI ATAS kursor (anchor lewat `bottom`).
    // Kalau kursor terlalu dekat ke puncak viewport, `bottom` jadi
    // sangat besar dan bubble akan terdorong ke luar layar ke atas — di
    // situasi itu, flip ke bawah kursor pakai `top` sebagai gantinya.
    const MIN_VERTICAL_ROOM_ABOVE_CURSOR = 300
    if (cursorY < MIN_VERTICAL_ROOM_ABOVE_CURSOR) {
      return {
        position: 'fixed',
        left: bubbleLeft,
        top: cursorY + 20,
        width: clampedBubbleWidth,
      }
    }
    const bubbleBottom = window.innerHeight - cursorY + 20
    return {
      position: 'fixed',
      left: bubbleLeft,
      bottom: bubbleBottom,
      width: clampedBubbleWidth,
    }
  }

  // Klik card sekarang langsung navigasi ke website proyek (project_url),
  // bukan buka modal — modal untuk project sudah dihapus. Fallback ke
  // github_url kalau tidak ada link live demo, supaya klik tidak jadi
  // aksi mati kalau kamu belum isi project_url. Kalau dua-duanya kosong,
  // card tetap tidak melakukan apa-apa saat diklik (tidak ada tujuan).
  function handleCardClick(project: Project) {
    const destinationUrl = project.project_url || project.github_url
    if (destinationUrl) {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (projects.length === 0) {
    return (
      <section id="projects" className="py-24 px-6 text-center scroll-mt-20">
        <p className="text-white/40">{translations.projects.empty}</p>
      </section>
    )
  }

  // Array.prototype.sort is stable (ES2019+), jadi urutan display_order
  // di dalam masing-masing grup (featured / non-featured) tetap terjaga —
  // ini cuma mengangkat grup featured ke atas, bukan re-shuffle semuanya.
  const projectsSortedByFeatured = [...projects].sort(
    (projectA, projectB) =>
      Number(projectB.is_featured) - Number(projectA.is_featured)
  )

  // Daftar tech unik dari semua proyek, dipakai sebagai chip filter.
  // Diurutkan berdasarkan frekuensi (paling sering dipakai muncul duluan)
  // supaya chip yang paling berguna ada di kiri, bukan urutan alfabet acak.
  const techUsageCounts = new Map<string, number>()
  for (const project of projects) {
    for (const tech of project.tech_stack) {
      techUsageCounts.set(tech, (techUsageCounts.get(tech) ?? 0) + 1)
    }
  }
  const allTechTags = [...techUsageCounts.entries()]
    .sort((countEntryA, countEntryB) => countEntryB[1] - countEntryA[1])
    .map(([tech]) => tech)

  const filteredProjects = activeTechFilter
    ? projectsSortedByFeatured.filter((project) =>
        project.tech_stack.includes(activeTechFilter)
      )
    : projectsSortedByFeatured

  return (
    <section id="projects" className="py-32 px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-8 text-center">
        {translations.projects.heading}{' '}
        <span className="text-gradient">
          {translations.projects.headingAccent}
        </span>
      </h2>

      {allTechTags.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-14">
          <button
            onClick={() => setActiveTechFilter(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeTechFilter === null
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
            }`}
          >
            {translations.projects.allFilter}
          </button>
          {allTechTags.map((tech) => (
            <button
              key={tech}
              onClick={() =>
                setActiveTechFilter(activeTechFilter === tech ? null : tech)
              }
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeTechFilter === tech
                  ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <p className="text-white/40 text-center">{translations.projects.empty}</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, projectIndex) => {
          const projectDescription =
            locale === 'en' && project.description_en
              ? project.description_en
              : project.description
          const hasExternalLink = Boolean(
            project.project_url || project.github_url
          )
          const hasCaseStudy = Boolean(
            project.case_study_problem ||
              project.case_study_approach ||
              project.case_study_tradeoff ||
              project.case_study_learnings
          )

          return (
            <div key={project.id} className="relative">
              {/* Hover preview bubble — desktop-only (see useHoverCapable).
                  pointer-events-none so it never intercepts the click.
                  Posisinya fixed & ngikutin kursor, lebih besar dari card
                  aslinya (1.35x, diukur lewat getBoundingClientRect). */}
              <AnimatePresence>
                {supportsHover && hoveredProjectId === project.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={computeBubblePosition(
                      cursorPosition.x,
                      cursorPosition.y
                    )}
                    className="pointer-events-none z-20"
                  >
                    <div className="glass-card p-4 shadow-xl border-cyan-400/30">
                      {project.image_url && (
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-white/5">
                          <Image
                            src={project.image_url}
                            alt={project.title}
                            fill
                            sizes="360px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <p className="text-base font-semibold text-white/90 truncate">
                        {project.title}
                      </p>
                      <p className="text-sm text-white/50 line-clamp-3 mt-1.5">
                        {projectDescription}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                // whileTap: feedback taktil sekejap saat card ditekan —
                // Framer cuma menerapkan ini SELAMA jari/klik ditahan,
                // otomatis kembali begitu lepas. transform-only (scale),
                // tidak ada listener tambahan yang perlu dikelola manual.
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.5, delay: projectIndex * 0.1 }}
                onMouseEnter={(mouseEvent) =>
                  handleCardMouseEnter(project.id, mouseEvent.currentTarget)
                }
                onMouseLeave={handleCardMouseLeave}
                onMouseMove={handleCardMouseMove}
                onClick={() => handleCardClick(project)}
                className={`relative glass-card p-6 hover:border-cyan-400/40 transition-colors group h-full ${
                  hasExternalLink ? 'cursor-pointer' : ''
                }`}
              >
                {/* Spotlight — radial-gradient lembut mengikuti kursor,
                    cuma tampak pas card di-hover (opacity via CSS,
                    bukan conditional render, supaya transisinya halus).
                    Posisi (--spotlight-x/-y) di-update langsung ke DOM
                    lewat handleCardMouseMove, bukan React state — lihat
                    komentar di hoveredCardElementRef. Radial-gradient
                    polos itu MURAH: beda jauh dari filter:blur() yang
                    mahal, ini cuma definisi gradient warna, tanpa
                    kalkulasi sampling blur tambahan sama sekali.
                    rounded-2xl di sini (BUKAN overflow-hidden di parent)
                    supaya sudut gradient ikut membulat mengikuti card —
                    overflow-hidden di parent akan memotong badge
                    "Featured" yang sengaja diposisikan sedikit di luar
                    tepi card (-top-2 -right-2). */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(34, 211, 238, 0.08), transparent 70%)',
                  }}
                />
                {project.is_featured && (
                  <span
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, var(--gradient-from), var(--gradient-to))',
                    }}
                    className="absolute -top-2 -right-2 z-10 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full text-black font-bold shadow-lg"
                  >
                    {translations.projects.featured}
                  </span>
                )}
                {project.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-5 bg-white/5">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-3">{project.title}</h3>
                <p className="text-white/60 text-sm mb-5 line-clamp-2">
                  {projectDescription}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {project.tech_stack.map((tech) => (
                    <button
                      key={tech}
                      onClick={(clickEvent) => {
                        // stopPropagation supaya klik chip tech TIDAK ikut
                        // memicu handleCardClick di card pembungkusnya
                        // (yang akan membuka tab baru ke website proyek).
                        clickEvent.stopPropagation()
                        setActiveTechFilter(tech)
                      }}
                      className="text-xs px-2 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 hover:bg-purple-500/20 transition-colors"
                    >
                      {tech}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 text-sm">
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(clickEvent) => clickEvent.stopPropagation()}
                      className="text-cyan-400 hover:underline"
                    >
                      {translations.projects.liveDemo}
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(clickEvent) => clickEvent.stopPropagation()}
                      className="text-white/50 hover:text-white"
                    >
                      {translations.projects.github}
                    </a>
                  )}
                  {hasCaseStudy && (
                    <Link
                      href={`/projects/${project.id}`}
                      onClick={(clickEvent) => clickEvent.stopPropagation()}
                      className="text-purple-300 hover:underline ml-auto"
                    >
                      Read Case Study →
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
      )}
    </section>
  )
}
