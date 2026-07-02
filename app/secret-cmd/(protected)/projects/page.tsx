'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Project } from '@/lib/types'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function ProjectsAdminPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  async function loadProjects() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(data: Omit<Project, 'id' | 'created_at'>) {
    await supabase.from('projects').insert(data)
    setShowForm(false)
    loadProjects()
  }

  async function handleUpdate(data: Omit<Project, 'id' | 'created_at'>) {
    if (!editing) return
    await supabase.from('projects').update(data).eq('id', editing.id)
    setEditing(null)
    loadProjects()
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus proyek ini?')) return
    await supabase.from('projects').delete().eq('id', id)
    loadProjects()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Projects</h1>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Proyek
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <ProjectForm
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
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-white/40">
                  {project.tech_stack.join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(project)
                    setShowForm(false)
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-white/40">Belum ada proyek.</p>
          )}
        </div>
      )}
    </div>
  )
}
