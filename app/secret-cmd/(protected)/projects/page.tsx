'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Project } from '@/lib/types'
import { Pencil, Trash2, Plus } from 'lucide-react'

/** Halaman admin CRUD untuk Projects — list + create + edit + delete,
 *  semuanya di satu halaman (form muncul inline, bukan halaman
 *  terpisah). */
export default function ProjectsAdminPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadProjects() {
    setIsLoading(true)
    setErrorMessage(null)
    const { data: projectsData, error: loadError } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
    if (loadError) {
      setErrorMessage('Gagal memuat proyek: ' + loadError.message)
      setIsLoading(false)
      return
    }
    setProjects(projectsData ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(projectData: Omit<Project, 'id' | 'created_at'>) {
    setErrorMessage(null)
    const { error: insertError } = await supabase
      .from('projects')
      .insert(projectData)
    if (insertError) {
      setErrorMessage('Gagal menambah proyek: ' + insertError.message)
      return
    }
    setIsFormVisible(false)
    loadProjects()
  }

  async function handleUpdate(projectData: Omit<Project, 'id' | 'created_at'>) {
    if (!editingProject) return
    setErrorMessage(null)
    const { error: updateError } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', editingProject.id)
    if (updateError) {
      setErrorMessage('Gagal menyimpan proyek: ' + updateError.message)
      return
    }
    setEditingProject(null)
    loadProjects()
  }

  async function handleDelete(projectId: string) {
    if (!confirm('Yakin hapus proyek ini?')) return
    setErrorMessage(null)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    if (deleteError) {
      setErrorMessage('Gagal menghapus proyek: ' + deleteError.message)
      return
    }
    loadProjects()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Projects</h1>
        {!isFormVisible && !editingProject && (
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Proyek
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
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormVisible(false)}
          />
        </div>
      )}

      {editingProject && (
        <div className="mb-8">
          <ProjectForm
            initial={editingProject}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProject(null)}
          />
        </div>
      )}

      {isLoading ? (
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
                    setEditingProject(project)
                    setIsFormVisible(false)
                  }}
                  aria-label="Edit proyek ini"
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  aria-label="Hapus proyek ini"
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
