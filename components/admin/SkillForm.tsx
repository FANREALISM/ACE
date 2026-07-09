'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Skill } from '@/lib/types'

interface SkillFormProps {
  initial?: Partial<Skill>
  onSubmit: (data: Omit<Skill, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

// Ikon yang relevan untuk tech stack — dikurasi, bukan daftar penuh
// lucide-react, sama alasannya dengan ICON_OPTIONS di AboutSectionForm.
const ICON_OPTIONS = [
  'Code2',
  'Braces',
  'Database',
  'Server',
  'Cloud',
  'GitBranch',
  'Terminal',
  'Layers',
  'Box',
  'Palette',
  'Smartphone',
  'Globe',
  'Cpu',
  'Blocks',
  'Wrench',
] as const

function resolveIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Code2
}

export default function SkillForm({
  initial,
  onSubmit,
  onCancel,
}: SkillFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? 'Code2')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      name,
      icon,
      category: category || null,
      display_order: initial?.display_order ?? 0,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Nama Skill
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="mis. React, PHP, Figma"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label className="block text-sm text-white/50 mb-1">
          Kategori (opsional)
        </label>
        <input
          value={category ?? ''}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="mis. Frontend, Backend, Tools"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label className="block text-sm text-white/50 mb-2">Ikon</label>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {ICON_OPTIONS.map((opt) => {
            const Icon = resolveIcon(opt)
            const active = icon === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setIcon(opt)}
                title={opt}
                aria-label={`Pilih ikon ${opt}`}
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
