'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { useHoverCapable } from '@/lib/useHoverCapable'
import Modal from '@/components/ui/Modal'

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const { t, locale } = useLanguage()
  const canHover = useHoverCapable()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openProject, setOpenProject] = useState<Project | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  // Lebar bubble tetap (match w-80 di className) — dipakai untuk hitung
  // posisi kiri manual di bawah, BUKAN pakai CSS transform:translateX(-50%)
  // untuk centering. Alasannya: Framer Motion menulis langsung ke
  // elemen.style.transform tiap frame buat animasi enter/exit (y, scale),
  // jadi transform statis lain yang ditaruh di style prop akan
  // tumpang-tindih/keprediksi hasilnya. Hitung "left" sebagai angka
  // piksel polos menghindari itu sama sekali.
  const BUBBLE_WIDTH = 320
  const BUBBLE_MARGIN = 12

  function bubbleStyle(x: number, y: number): React.CSSProperties {
    const left = Math.min(
      Math.max(x - BUBBLE_WIDTH / 2, BUBBLE_MARGIN),
      window.innerWidth - BUBBLE_WIDTH - BUBBLE_MARGIN
    )
    // Default: bubble muncul DI ATAS kursor (anchor lewat `bottom`, bukan
    // `top`, supaya tinggi bubble yang variabel — tergantung panjang
    // deskripsi — tumbuh ke atas dari titik kursor, bukan ke bawah
    // menutupi kursor). Kalau kursor terlalu dekat ke puncak viewport,
    // `bottom` jadi sangat besar dan bubble akan terdorong ke luar layar
    // ke atas — di situasi itu, flip ke bawah kursor pakai `top` sebagai
    // gantinya.
    const MIN_ROOM_ABOVE = 260
    if (y < MIN_ROOM_ABOVE) {
      return { position: 'fixed', left, top: y + 20, width: BUBBLE_WIDTH }
    }
    const bottom = window.innerHeight - y + 20
    return { position: 'fixed', left, bottom, width: BUBBLE_WIDTH }
  }

  if (projects.length === 0) {
    return (
      <section id="projects" className="py-24 px-6 text-center scroll-mt-20">
        <p className="text-white/40">{t.projects.empty}</p>
      </section>
    )
  }

  // Array.prototype.sort is stable (ES2019+), jadi urutan display_order
  // di dalam masing-masing grup (featured / non-featured) tetap terjaga —
  // ini cuma mengangkat grup featured ke atas, bukan re-shuffle semuanya.
  const sortedProjects = [...projects].sort(
    (a, b) => Number(b.is_featured) - Number(a.is_featured)
  )

  // Daftar tech unik dari semua proyek, dipakai sebagai chip filter.
  // Diurutkan berdasarkan frekuensi (paling sering dipakai muncul duluan)
  // supaya chip yang paling berguna ada di kiri, bukan urutan alfabet acak.
  const techCounts = new Map<string, number>()
  for (const p of projects) {
    for (const tech of p.tech_stack) {
      techCounts.set(tech, (techCounts.get(tech) ?? 0) + 1)
    }
  }
  const allTechs = [...techCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tech]) => tech)

  const filteredProjects = activeFilter
    ? sortedProjects.filter((p) => p.tech_stack.includes(activeFilter))
    : sortedProjects

  return (
    <section id="projects" className="py-32 px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-8 text-center">
        {t.projects.heading} <span className="text-gradient">{t.projects.headingAccent}</span>
      </h2>

      {allTechs.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-14">
          <button
            onClick={() => setActiveFilter(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeFilter === null
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
            }`}
          >
            {t.projects.allFilter}
          </button>
          {allTechs.map((tech) => (
            <button
              key={tech}
              onClick={() => setActiveFilter(activeFilter === tech ? null : tech)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeFilter === tech
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
        <p className="text-white/40 text-center">{t.projects.empty}</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, i) => {
          const desc =
            locale === 'en' && project.description_en
              ? project.description_en
              : project.description

          return (
            <div key={project.id} className="relative">
              {/* Hover preview bubble — desktop-only (see useHoverCapable).
                  pointer-events-none so it never intercepts the click that
                  opens the modal underneath it. Posisinya fixed & ngikutin
                  kursor (bukan nempel di tengah card), diupdate lewat
                  onMouseMove di card di bawah. */}
              <AnimatePresence>
                {canHover && hoveredId === project.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={bubbleStyle(cursorPos.x, cursorPos.y)}
                    className="pointer-events-none z-20"
                  >
                    <div className="glass-card p-4 shadow-xl border-cyan-400/30">
                      {project.image_url && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-base font-semibold text-white/90 truncate">
                        {project.title}
                      </p>
                      <p className="text-sm text-white/50 line-clamp-3 mt-1.5">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => canHover && setHoveredId(project.id)}
                onMouseLeave={() => canHover && setHoveredId(null)}
                onMouseMove={(e) =>
                  canHover && setCursorPos({ x: e.clientX, y: e.clientY })
                }
                onClick={() => setOpenProject(project)}
                className="relative glass-card p-6 hover:border-cyan-400/40 transition-colors group cursor-pointer h-full"
              >
                {project.is_featured && (
                  <span
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, var(--gradient-from), var(--gradient-to))',
                    }}
                    className="absolute -top-2 -right-2 z-10 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full text-black font-bold shadow-lg"
                  >
                    {t.projects.featured}
                  </span>
                )}
                {project.image_url && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-5 bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-3">{project.title}</h3>
                <p className="text-white/60 text-sm mb-5 line-clamp-2">{desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {project.tech_stack.map((tech) => (
                    <button
                      key={tech}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveFilter(tech)
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
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-400 hover:underline"
                    >
                      {t.projects.liveDemo}
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-white/50 hover:text-white"
                    >
                      {t.projects.github}
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
      )}

      <Modal open={!!openProject} onClose={() => setOpenProject(null)}>
        {openProject && (
          <div>
            {openProject.image_url && (
              <div className="aspect-video bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openProject.image_url}
                  alt={openProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-3">{openProject.title}</h3>
              <p className="text-white/70 leading-relaxed mb-5">
                {locale === 'en' && openProject.description_en
                  ? openProject.description_en
                  : openProject.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {openProject.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                {openProject.project_url && (
                  <a
                    href={openProject.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm"
                  >
                    <ExternalLink size={15} /> {t.projects.liveDemo}
                  </a>
                )}
                {openProject.github_url && (
                  <a
                    href={openProject.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors text-sm"
                  >
                    <Github size={15} /> {t.projects.github}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
