'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SkillForm from '@/components/admin/SkillForm'
import type { Skill } from '@/lib/types'
import { Pencil, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Alert,
  Btn,
  CardGrid,
  ConfirmDeleteButton,
  EmptyState,
  IconBtn,
  LoadingState,
  PageHeader,
  StatusTag,
} from '@/components/admin/AdminUI'

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

  const isEditorOpen = isFormVisible || editingSkill !== null

  return (
    <div>
      <PageHeader
        code="SKILL_TREE"
        title="Kelola Tech Stack / Skills"
        description="Ikon dan nama skill yang tampil di marquee halaman publik."
        actions={
          !isEditorOpen && (
            <Btn icon={<Plus size={15} aria-hidden="true" />} onClick={() => setIsFormVisible(true)}>
              TAMBAH_SKILL
            </Btn>
          )
        }
      />

      {errorMessage && (
        <div className="mb-6">
          <Alert>{errorMessage}</Alert>
        </div>
      )}

      {isFormVisible && (
        <div className="mb-8">
          <SkillForm onSubmit={handleCreate} onCancel={() => setIsFormVisible(false)} />
        </div>
      )}

      {editingSkill && (
        <div className="mb-8">
          <SkillForm
            key={editingSkill.id}
            initial={editingSkill}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSkill(null)}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : skills.length === 0 ? (
        <EmptyState code="NO_SKILLS">Belum ada skill ditambahkan.</EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => {
            const SkillIcon = resolveIcon(skill.icon)
            return (
              <li key={skill.id} className="adm-card flex items-center gap-3 p-3">
                <div className="adm-thumb h-10 w-10 !border-solid !text-adm-cyan">
                  <SkillIcon size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-adm-text">{skill.name}</p>
                  {skill.category && (
                    <p className="adm-mono truncate text-[0.65rem] uppercase tracking-[0.12em] text-adm-dim">
                      {skill.category}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <IconBtn
                    label={`Edit skill ${skill.name}`}
                    onClick={() => {
                      setEditingSkill(skill)
                      setIsFormVisible(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </IconBtn>
                  <ConfirmDeleteButton
                    itemName={`skill ${skill.name}`}
                    onConfirm={() => handleDelete(skill.id)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
