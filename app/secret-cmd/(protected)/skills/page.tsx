'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SkillForm from '@/components/admin/SkillForm'
import type { Skill } from '@/lib/types'
import { Pencil, Trash2, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function resolveIcon(iconName: string): LucideIcon {
  return (
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ?? Icons.Code2
  )
}

/** Halaman admin CRUD untuk Skills — pola sama dengan
 *  ProjectsAdminPage/CertificatesAdminPage, tapi layout list-nya chip
 *  wrap (bukan baris vertikal) karena skill lebih cocok ditampilkan
 *  ringkas seperti tag, sama seperti tampilan publiknya. */
export default function SkillsAdminPage() {
  const supabase = createClient()
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadSkills() {
    setIsLoading(true)
    setErrorMessage(null)
    const { data: skillsData, error: loadError } = await supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true })
    if (loadError) {
      setErrorMessage('Gagal memuat skills: ' + loadError.message)
      setIsLoading(false)
      return
    }
    setSkills(skillsData ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadSkills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(skillData: Omit<Skill, 'id' | 'created_at'>) {
    setErrorMessage(null)
    // Skill baru selalu ditaruh di urutan paling akhir (display_order
    // tertinggi + 1) — admin bisa reorder manual lewat Table Editor
    // Supabase kalau perlu urutan spesifik.
    const nextDisplayOrder =
      skills.length > 0
        ? Math.max(...skills.map((skill) => skill.display_order)) + 1
        : 0
    const { error: insertError } = await supabase
      .from('skills')
      .insert({ ...skillData, display_order: nextDisplayOrder })
    if (insertError) {
      setErrorMessage('Gagal menambah skill: ' + insertError.message)
      return
    }
    setIsFormVisible(false)
    loadSkills()
  }

  async function handleUpdate(skillData: Omit<Skill, 'id' | 'created_at'>) {
    if (!editingSkill) return
    setErrorMessage(null)
    const { error: updateError } = await supabase
      .from('skills')
      .update(skillData)
      .eq('id', editingSkill.id)
    if (updateError) {
      setErrorMessage('Gagal menyimpan skill: ' + updateError.message)
      return
    }
    setEditingSkill(null)
    loadSkills()
  }

  async function handleDelete(skillId: string) {
    if (!confirm('Yakin hapus skill ini?')) return
    setErrorMessage(null)
    const { error: deleteError } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId)
    if (deleteError) {
      setErrorMessage('Gagal menghapus skill: ' + deleteError.message)
      return
    }
    loadSkills()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Tech Stack / Skills</h1>
        {!isFormVisible && !editingSkill && (
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Skill
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
          {errorMessage}
        </p>
      )}

      {isFormVisible && (
        <div className="mb-8">
          <SkillForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormVisible(false)}
          />
        </div>
      )}

      {editingSkill && (
        <div className="mb-8">
          <SkillForm
            initial={editingSkill}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSkill(null)}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-white/40">Memuat...</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => {
            const SkillIcon = resolveIcon(skill.icon)
            return (
              <div
                key={skill.id}
                className="glass-card px-4 py-2 flex items-center gap-3"
              >
                <SkillIcon size={16} className="text-cyan-300" />
                <span className="text-sm">{skill.name}</span>
                {skill.category && (
                  <span className="text-xs text-white/30">
                    {skill.category}
                  </span>
                )}
                <div className="flex gap-1 ml-1">
                  <button
                    onClick={() => {
                      setEditingSkill(skill)
                      setIsFormVisible(false)
                    }}
                    aria-label={`Edit skill ${skill.name}`}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-cyan-400"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    aria-label={`Hapus skill ${skill.name}`}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
          {skills.length === 0 && (
            <p className="text-white/40">Belum ada skill ditambahkan.</p>
          )}
        </div>
      )}
    </div>
  )
}
