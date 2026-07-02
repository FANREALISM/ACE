'use client'

import { useState } from 'react'
import type { AboutSection } from '@/lib/types'

interface AboutSectionFormProps {
  initial?: Partial<AboutSection>
  onSubmit: (data: Omit<AboutSection, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

export default function AboutSectionForm({
  initial,
  onSubmit,
  onCancel,
}: AboutSectionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      title,
      content,
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
        <label className="block text-sm text-white/50 mb-1">Isi Paragraf</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

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
