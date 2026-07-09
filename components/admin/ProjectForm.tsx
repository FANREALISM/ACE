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
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

  async function handleAutoTranslate() {
    if (!description.trim()) {
      setTranslateError('Isi deskripsi Indonesia dulu sebelum translate.')
      return
    }
    setTranslating(true)
    setTranslateError(null)
    try {
      const result = await translateToEnglish(description)
      setDescriptionEn(result)
    } catch (err) {
      setTranslateError(
        err instanceof Error ? err.message : 'Gagal translate.'
      )
    } finally {
      setTranslating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
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
        .map((t) => t.trim())
        .filter(Boolean),
      is_featured: isFeatured,
      display_order: initial?.display_order ?? 0,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Judul Proyek
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label className="block text-sm text-white/50 mb-1">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
            disabled={translating}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/30 text-purple-300 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
          >
            <Languages size={13} />
            {translating ? 'Menerjemahkan...' : 'Auto-translate to EN'}
          </button>
        </div>
        <textarea
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          rows={3}
          placeholder="Kosong = fallback ke deskripsi Indonesia saat visitor pilih EN"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-purple-400"
        />
        {translateError && (
          <p className="text-xs text-red-400 mt-1">{translateError}</p>
        )}
      </div>

      <div className="space-y-3">
        <ImageUpload
          bucket="project-images"
          currentUrl={imageUrl || null}
          onUploaded={(url) => setImageUrl(url)}
          label="Upload Gambar Proyek"
        />
        <div>
          <label className="block text-sm text-white/50 mb-1">
            Atau URL Gambar (dari internet)
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
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
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="React, Tailwind, Supabase"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-black/40 border border-white/10 cursor-pointer">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
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
            onChange={(e) => setProjectUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-1">
            GitHub URL
          </label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
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
