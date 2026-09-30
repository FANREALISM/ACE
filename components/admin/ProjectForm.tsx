'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'
import ImageUpload from './ImageUpload'
import { translateToEnglish } from '@/lib/translate'
import { Languages } from 'lucide-react'

interface ProjectFormProps {
  initial?: Partial<Project>
  onSubmit: (data: Omit<Project, 'id' | 'created_at'>) => Promise<void>
  onCancel?: () => void
}

/**
 * Form admin untuk satu proyek — judul/deskripsi/link/tech-stack, plus
 * section case study opsional yang bisa dilipat (details/summary), dan
 * checkbox is_featured. Dipakai untuk create DAN edit lewat prop
 * `initial` yang sama; `onCancel` opsional karena halaman create tidak
 * selalu butuh tombol batal.
 */
export default function ProjectForm({
  initial,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [descriptionEn, setDescriptionEn] = useState(
    initial?.description_en ?? ''
  )
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [projectUrl, setProjectUrl] = useState(initial?.project_url ?? '')
  const [githubUrl, setGithubUrl] = useState(initial?.github_url ?? '')
  const [techStack, setTechStack] = useState(
    initial?.tech_stack?.join(', ') ?? ''
  )
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false)
  const [caseStudyProblem, setCaseStudyProblem] = useState(
    initial?.case_study_problem ?? ''
  )
  const [caseStudyApproach, setCaseStudyApproach] = useState(
    initial?.case_study_approach ?? ''
  )
  const [caseStudyTradeoff, setCaseStudyTradeoff] = useState(
    initial?.case_study_tradeoff ?? ''
  )
  const [caseStudyLearnings, setCaseStudyLearnings] = useState(
    initial?.case_study_learnings ?? ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateErrorMessage, setTranslateErrorMessage] = useState<
    string | null
  >(null)

  async function handleAutoTranslate() {
    if (!description.trim()) {
      setTranslateErrorMessage('Isi deskripsi Indonesia dulu sebelum translate.')
      return
    }
    setIsTranslating(true)
    setTranslateErrorMessage(null)
    try {
      const translatedText = await translateToEnglish(description)
      setDescriptionEn(translatedText)
    } catch (caughtError) {
      setTranslateErrorMessage(
        caughtError instanceof Error ? caughtError.message : 'Gagal translate.'
      )
    } finally {
      setIsTranslating(false)
    }
  }

  /** Form ini dipakai untuk create DAN edit — dibedakan lewat ada/tidaknya
   *  prop `initial` dan `onCancel` (halaman create tidak selalu butuh
   *  tombol batal). */
  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setIsSaving(true)
    await onSubmit({
      title,
      title_en: null,
      description,
      description_en: descriptionEn || null,
      image_url: imageUrl || null,
      project_url: projectUrl || null,
      github_url: githubUrl || null,
      tech_stack: techStack
        .split(',')
        .map((techItem) => techItem.trim())
        .filter(Boolean),
      is_featured: isFeatured,
      case_study_problem: caseStudyProblem || null,
      case_study_approach: caseStudyApproach || null,
      case_study_tradeoff: caseStudyTradeoff || null,
      case_study_learnings: caseStudyLearnings || null,
      display_order: initial?.display_order ?? 0,
    })
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Judul Proyek
        </label>
        <input
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label className="block text-sm text-white/50 mb-1">Deskripsi</label>
        <textarea
          value={description}
          onChange={(changeEvent) => setDescription(changeEvent.target.value)}
          required
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white/50">
            Deskripsi (English) — opsional
          </label>
          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={isTranslating}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/30 text-purple-300 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
          >
            <Languages size={13} />
            {isTranslating ? 'Menerjemahkan...' : 'Auto-translate to EN'}
          </button>
        </div>
        <textarea
          value={descriptionEn}
          onChange={(changeEvent) => setDescriptionEn(changeEvent.target.value)}
          rows={3}
          placeholder="Kosong = fallback ke deskripsi Indonesia saat visitor pilih EN"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-purple-400"
        />
        {translateErrorMessage && (
          <p className="text-xs text-red-400 mt-1">{translateErrorMessage}</p>
        )}
      </div>

      <div className="space-y-3">
        <ImageUpload
          bucket="project-images"
          currentUrl={imageUrl || null}
          onUploaded={(uploadedUrl) => setImageUrl(uploadedUrl)}
          label="Upload Gambar Proyek"
        />
        <div>
          <label className="block text-sm text-white/50 mb-1">
            Atau URL Gambar (dari internet)
          </label>
          <input
            value={imageUrl}
            onChange={(changeEvent) => setImageUrl(changeEvent.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/50 mb-1">
          Teknologi (pisahkan dengan koma)
        </label>
        <input
          value={techStack}
          onChange={(changeEvent) => setTechStack(changeEvent.target.value)}
          placeholder="React, Tailwind, Supabase"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-black/40 border border-white/10 cursor-pointer">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(changeEvent) => setIsFeatured(changeEvent.target.checked)}
          className="w-4 h-4 accent-cyan-400"
        />
        <span className="text-sm text-white/70">
          Tandai sebagai proyek unggulan (tampil lebih dulu + badge di
          halaman public)
        </span>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/50 mb-1">
            Live Demo URL
          </label>
          <input
            value={projectUrl}
            onChange={(changeEvent) => setProjectUrl(changeEvent.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-1">
            GitHub URL
          </label>
          <input
            value={githubUrl}
            onChange={(changeEvent) => setGithubUrl(changeEvent.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <details className="rounded-lg border border-white/10 overflow-hidden">
        <summary className="px-4 py-3 bg-black/40 cursor-pointer text-sm text-white/70 hover:text-white transition-colors select-none">
          Case Study (opsional) — untuk 1-2 proyek unggulan yang mau
          ditulis lebih dalam
        </summary>
        <div className="p-4 space-y-4 border-t border-white/10">
          <p className="text-xs text-white/40">
            Isi minimal satu field di bawah untuk memunculkan tombol
            "Read Case Study" di kartu proyek, membuka halaman tersendiri
            di <code className="text-white/60">/projects/[id]</code>.
            Kosongkan semua kalau proyek ini tidak perlu case study.
          </p>
          <div>
            <label className="block text-sm text-white/50 mb-1">
              The Problem
            </label>
            <textarea
              value={caseStudyProblem}
              onChange={(changeEvent) => setCaseStudyProblem(changeEvent.target.value)}
              rows={3}
              placeholder="Masalah apa yang proyek ini selesaikan? Kenapa itu penting?"
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">
              The Approach
            </label>
            <textarea
              value={caseStudyApproach}
              onChange={(changeEvent) => setCaseStudyApproach(changeEvent.target.value)}
              rows={3}
              placeholder="Bagaimana kamu mendekati masalahnya? Keputusan teknis apa yang diambil?"
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">
              The Tradeoff
            </label>
            <textarea
              value={caseStudyTradeoff}
              onChange={(changeEvent) => setCaseStudyTradeoff(changeEvent.target.value)}
              rows={3}
              placeholder="Tradeoff nyata yang kamu ambil — bukan cuma 'semua berjalan lancar'. Apa yang dikorbankan?"
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">
              What I'd Do Differently
            </label>
            <textarea
              value={caseStudyLearnings}
              onChange={(changeEvent) => setCaseStudyLearnings(changeEvent.target.value)}
              rows={3}
              placeholder="Dengan yang kamu tahu sekarang, apa yang akan diubah?"
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </details>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  )
}
