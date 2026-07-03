'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AboutSection } from '@/lib/types'
import ImageUpload from './ImageUpload'
import { translateToEnglish } from '@/lib/translate'
import { Languages } from 'lucide-react'

interface AboutSectionFormProps {
  initial?: Partial<AboutSection>
  onSubmit: (data: Omit<AboutSection, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

// Set ikon yang relevan untuk konten developer/portofolio.
// Dibatasi sengaja — daftar penuh lucide-react (>1000 ikon) di dropdown
// akan lebih sulit dipakai daripada pilihan terkurasi.
const ICON_OPTIONS = [
  'Cpu',
  'Code2',
  'Terminal',
  'Rocket',
  'Layers',
  'Database',
  'Gamepad2',
  'Sparkles',
  'GraduationCap',
  'Award',
  'Zap',
  'Blocks',
  'Brain',
  'Globe',
  'Wrench',
] as const

function resolveIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Cpu
}

export default function AboutSectionForm({
  initial,
  onSubmit,
  onCancel,
}: AboutSectionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [contentEn, setContentEn] = useState(initial?.content_en ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? 'Cpu')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

  async function handleAutoTranslate() {
    if (!content.trim()) {
      setTranslateError('Isi paragraf Indonesia dulu sebelum translate.')
      return
    }
    setTranslating(true)
    setTranslateError(null)
    try {
      const result = await translateToEnglish(content)
      setContentEn(result)
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : 'Gagal translate.')
    } finally {
      setTranslating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      title,
      content,
      content_en: contentEn || null,
      icon,
      image_url: imageUrl || null,
      display_order: initial?.display_order ?? 0,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Judul (format: SYSTEM_LABEL // SUBTITLE)
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="SYSTEM INITIALIZATION // THE FOUNDATION"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white/50">Isi Paragraf</label>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white/50">
            Isi Paragraf (English) — opsional
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
          value={contentEn}
          onChange={(e) => setContentEn(e.target.value)}
          rows={6}
          placeholder="Kosong = fallback ke teks Indonesia saat visitor pilih EN"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-purple-400"
        />
        {translateError && (
          <p className="text-xs text-red-400 mt-1">{translateError}</p>
        )}
        <p className="text-xs text-white/30 mt-1">
          Hasil auto-translate bisa diedit manual sebelum disimpan — jangan
          asumsikan mesin selalu benar, terutama istilah teknis.
        </p>
      </div>

      <div>
        <label className="block text-sm text-white/50 mb-2">Ikon</label>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {ICON_OPTIONS.map((name) => {
            const Icon = resolveIcon(name)
            const active = icon === name
            return (
              <button
                key={name}
                type="button"
                onClick={() => setIcon(name)}
                title={name}
                aria-label={`Pilih ikon ${name}`}
                aria-pressed={active}
                className={`flex items-center justify-center h-10 rounded-lg border transition-colors ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30'
                }`}
              >
                <Icon size={16} />
              </button>
            )
          })}
        </div>
      </div>

      <ImageUpload
        bucket="about-images"
        currentUrl={imageUrl || null}
        onUploaded={(url) => setImageUrl(url)}
        label="Gambar Section (opsional)"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
