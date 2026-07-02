'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AboutSectionForm from '@/components/admin/AboutSectionForm'
import type { AboutSection } from '@/lib/types'
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react'

export default function AboutAdminPage() {
  const supabase = createClient()
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AboutSection | null>(null)

  async function loadSections() {
    setLoading(true)
    const { data } = await supabase
      .from('about_sections')
      .select('*')
      .order('display_order', { ascending: true })
    setSections(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadSections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(
    data: Omit<AboutSection, 'id' | 'created_at'>
  ) {
    const nextOrder =
      sections.length > 0
        ? Math.max(...sections.map((s) => s.display_order)) + 1
        : 0
    await supabase
      .from('about_sections')
      .insert({ ...data, display_order: nextOrder })
    setShowForm(false)
    loadSections()
  }

  async function handleUpdate(
    data: Omit<AboutSection, 'id' | 'created_at'>
  ) {
    if (!editing) return
    await supabase
      .from('about_sections')
      .update(data)
      .eq('id', editing.id)
    setEditing(null)
    loadSections()
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus paragraf ini?')) return
    await supabase.from('about_sections').delete().eq('id', id)
    loadSections()
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const current = sections[index]
    const target = sections[targetIndex]

    // Tukar display_order antara dua item bertetangga
    await Promise.all([
      supabase
        .from('about_sections')
        .update({ display_order: target.display_order })
        .eq('id', current.id),
      supabase
        .from('about_sections')
        .update({ display_order: current.display_order })
        .eq('id', target.id),
    ])
    loadSections()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Tentang Saya</h1>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Paragraf
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <AboutSectionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <AboutSectionForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-white/40">Memuat...</p>
      ) : (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <div key={section.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs uppercase text-cyan-400/70 mb-1">
                    [ {section.title} ]
                  </p>
                  <p className="text-sm text-white/50 line-clamp-2">
                    {section.content}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleMove(i, 'up')}
                    disabled={i === 0}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(i, 'down')}
                    disabled={i === sections.length - 1}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(section)
                      setShowForm(false)
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-white/40">Belum ada paragraf.</p>
          )}
        </div>
      )}
    </div>
  )
}
