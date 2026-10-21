'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'
import ImageUpload from './ImageUpload'
import { translateToEnglish } from '@/lib/translate'
import { Languages } from 'lucide-react'
import { Btn } from '@/components/admin/AdminUI'

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
    <form onSubmit={handleSubmit} className="adm-panel space-y-5 p-5 sm:p-6">
      <h2 className="adm-panel-title">
        <span aria-hidden="true">▸</span>[ {initial ? 'EDIT_DATA' : 'NEW_ENTRY'} ]
      </h2>
      <div>
        <label htmlFor="projectform-1" className="adm-label">
          Judul Proyek
        </label>
        <input id="projectform-1"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          required
          className="adm-input"
        />
      </div>

      <div>
        <label htmlFor="projectform-2" className="adm-label">Deskripsi</label>
        <textarea id="projectform-2"
          value={description}
          onChange={(changeEvent) => setDescription(changeEvent.target.value)}
          required
          rows={3}
          className="adm-input"
        />
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="projectform-en" className="adm-label !mb-0">
            Deskripsi (English) — opsional
          </label>
          <Btn
            variant="violet"
            size="sm"
            onClick={handleAutoTranslate}
            disabled={isTranslating}
            icon={<Languages size={13} aria-hidden="true" />}
          >
            {isTranslating ? 'MENERJEMAHKAN...' : 'AUTO_TRANSLATE_EN'}
          </Btn>
        </div>
        <textarea
          id="projectform-en"
          value={descriptionEn}
          onChange={(changeEvent) => setDescriptionEn(changeEvent.target.value)}
          rows={3}
          placeholder="Kosong = fallback ke deskripsi Indonesia saat visitor pilih EN"
          className="adm-input" data-accent="violet"
        />
        {translateErrorMessage && (
          <p className="adm-hint !text-adm-red">{translateErrorMessage}</p>
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
          <label htmlFor="projectform-3" className="adm-label">
            Atau URL Gambar (dari internet)
          </label>
          <input id="projectform-3"
            value={imageUrl}
            onChange={(changeEvent) => setImageUrl(changeEvent.target.value)}
            placeholder="https://..."
            className="adm-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="projectform-4" className="adm-label">
          Teknologi (pisahkan dengan koma)
        </label>
        <input id="projectform-4"
          value={techStack}
          onChange={(changeEvent) => setTechStack(changeEvent.target.value)}
          placeholder="React, Tailwind, Supabase"
          className="adm-input"
        />
      </div>

      <label className="adm-input flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(changeEvent) => setIsFeatured(changeEvent.target.checked)}
          className="adm-check"
        />
        <span className="text-sm text-adm-text">
          Tandai sebagai proyek unggulan (tampil lebih dulu + badge di
          halaman public)
        </span>
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="projectform-5" className="adm-label">
            Live Demo URL
          </label>
          <input id="projectform-5"
            value={projectUrl}
            onChange={(changeEvent) => setProjectUrl(changeEvent.target.value)}
            className="adm-input"
          />
        </div>
        <div>
          <label htmlFor="projectform-6" className="adm-label">
            GitHub URL
          </label>
          <input id="projectform-6"
            value={githubUrl}
            onChange={(changeEvent) => setGithubUrl(changeEvent.target.value)}
            className="adm-input"
          />
        </div>
      </div>

      <details className="adm-details">
        <summary className="adm-summary">
          Case Study (opsional) — untuk 1-2 proyek unggulan yang mau
          ditulis lebih dalam
        </summary>
        <div className="space-y-5 border-t border-adm-line/15 p-4">
          <p className="adm-hint !mt-0">
            Isi minimal satu field di bawah untuk memunculkan tombol
            "Read Case Study" di kartu proyek, membuka halaman tersendiri
            di <code className="adm-mono text-adm-cyan">/projects/[id]</code>.
            Kosongkan semua kalau proyek ini tidak perlu case study.
          </p>
          <div>
            <label htmlFor="projectform-7" className="adm-label">
              The Problem
            </label>
            <textarea id="projectform-7"
              value={caseStudyProblem}
              onChange={(changeEvent) => setCaseStudyProblem(changeEvent.target.value)}
              rows={3}
              placeholder="Masalah apa yang proyek ini selesaikan? Kenapa itu penting?"
              className="adm-input"
            />
          </div>
          <div>
            <label htmlFor="projectform-8" className="adm-label">
              The Approach
            </label>
            <textarea id="projectform-8"
              value={caseStudyApproach}
              onChange={(changeEvent) => setCaseStudyApproach(changeEvent.target.value)}
              rows={3}
              placeholder="Bagaimana kamu mendekati masalahnya? Keputusan teknis apa yang diambil?"
              className="adm-input"
            />
          </div>
          <div>
            <label htmlFor="projectform-9" className="adm-label">
              The Tradeoff
            </label>
            <textarea id="projectform-9"
              value={caseStudyTradeoff}
              onChange={(changeEvent) => setCaseStudyTradeoff(changeEvent.target.value)}
              rows={3}
              placeholder="Tradeoff nyata yang kamu ambil — bukan cuma 'semua berjalan lancar'. Apa yang dikorbankan?"
              className="adm-input"
            />
          </div>
          <div>
            <label htmlFor="projectform-10" className="adm-label">
              What I'd Do Differently
            </label>
            <textarea id="projectform-10"
              value={caseStudyLearnings}
              onChange={(changeEvent) => setCaseStudyLearnings(changeEvent.target.value)}
              rows={3}
              placeholder="Dengan yang kamu tahu sekarang, apa yang akan diubah?"
              className="adm-input"
            />
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-3 border-t border-adm-line/10 pt-5">
        <Btn type="submit" disabled={isSaving}>{isSaving ? 'MENYIMPAN...' : 'SIMPAN'}</Btn>
        {onCancel && (
          <Btn variant="ghost" onClick={onCancel}>BATAL</Btn>
        )}
      </div>
    </form>
  )
}
