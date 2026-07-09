'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SkillForm from '@/components/admin/SkillForm'
import type { Skill } from '@/lib/types'
import { Pencil, Trash2, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function resolveIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Code2
}

export default function SkillsAdminPage() {
  const supabase = createClient()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadSkills() {
    setLoading(true)
    setError(null)
    const { data, error: loadError } = await supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true })
    if (loadError) {
      setError('Gagal memuat skills: ' + loadError.message)
      setLoading(false)
      return
    }
    setSkills(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadSkills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(data: Omit<Skill, 'id' | 'created_at'>) {
    setError(null)
    const nextOrder =
      skills.length > 0
        ? Math.max(...skills.map((s) => s.display_order)) + 1
        : 0
    const { error: insertError } = await supabase
      .from('skills')
      .insert({ ...data, display_order: nextOrder })
    if (insertError) {
      setError('Gagal menambah skill: ' + insertError.message)
      return
    }
    setShowForm(false)
    loadSkills()
  }

  async function handleUpdate(data: Omit<Skill, 'id' | 'created_at'>) {
    if (!editing) return
    setError(null)
    const { error: updateError } = await supabase
      .from('skills')
      .update(data)
      .eq('id', editing.id)
    if (updateError) {
      setError('Gagal menyimpan skill: ' + updateError.message)
      return
    }
    setEditing(null)
    loadSkills()
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus skill ini?')) return
    setError(null)
    const { error: deleteError } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)
    if (deleteError) {
      setError('Gagal menghapus skill: ' + deleteError.message)
      return
    }
    loadSkills()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Tech Stack / Skills</h1>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Skill
          </button>
        )}
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {showForm && (
        <div className="mb-8">
          <SkillForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <SkillForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-white/40">Memuat...</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => {
            const Icon = resolveIcon(skill.icon)
            return (
              <div
                key={skill.id}
                className="glass-card px-4 py-2 flex items-center gap-3"
              >
                <Icon size={16} className="text-cyan-300" />
                <span className="text-sm">{skill.name}</span>
                {skill.category && (
                  <span className="text-xs text-white/30">
                    {skill.category}
                  </span>
                )}
                <div className="flex gap-1 ml-1">
                  <button
                    onClick={() => {
                      setEditing(skill)
                      setShowForm(false)
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
