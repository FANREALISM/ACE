'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Skill } from '@/lib/types'
import { Btn } from '@/components/admin/AdminUI'

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

function resolveIcon(iconName: string): LucideIcon {
  return (
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ?? Icons.Code2
  )
}

/**
 * Form admin untuk satu skill/tech-stack chip — nama, ikon (dari daftar
 * terkurasi), kategori opsional (buat pengelompokan visual kalau nanti
 * dibutuhkan, belum dipakai di tampilan publik saat ini).
 */
export default function SkillForm({
  initial,
  onSubmit,
  onCancel,
}: SkillFormProps) {
  const [skillName, setSkillName] = useState(initial?.name ?? '')
  const [selectedIcon, setSelectedIcon] = useState(initial?.icon ?? 'Code2')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setIsSaving(true)
    await onSubmit({
      name: skillName,
      icon: selectedIcon,
      category: category || null,
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
        <label htmlFor="skillform-1" className="adm-label">
          Nama Skill
        </label>
        <input id="skillform-1"
          value={skillName}
          onChange={(changeEvent) => setSkillName(changeEvent.target.value)}
          required
          placeholder="mis. React, PHP, Figma"
          className="adm-input"
        />
      </div>

      <div>
        <label htmlFor="skillform-2" className="adm-label">
          Kategori (opsional)
        </label>
        <input id="skillform-2"
          value={category ?? ''}
          onChange={(changeEvent) => setCategory(changeEvent.target.value)}
          placeholder="mis. Frontend, Backend, Tools"
          className="adm-input"
        />
      </div>

      <div>
        <label className="adm-label">Ikon</label>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {ICON_OPTIONS.map((iconOption) => {
            const IconComponent = resolveIcon(iconOption)
            const isActiveIcon = selectedIcon === iconOption
            return (
              <button
                key={iconOption}
                type="button"
                onClick={() => setSelectedIcon(iconOption)}
                title={iconOption}
                aria-label={`Pilih ikon ${iconOption}`}
                aria-pressed={isActiveIcon}
                className="adm-choice h-10"
              >
                <IconComponent size={16} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Btn type="submit" disabled={isSaving}>{isSaving ? 'MENYIMPAN...' : 'SIMPAN'}</Btn>
        <Btn variant="ghost" onClick={onCancel}>BATAL</Btn>
      </div>
    </form>
  )
}
