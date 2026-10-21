'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Project } from '@/lib/types'
import { FolderGit2, Pencil, Plus } from 'lucide-react'
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

  const isEditorOpen = isFormVisible || editingProject !== null

  return (
    <div>
      <PageHeader
        code="PROJECT_DB"
        title="Kelola Projects"
        description="Daftar proyek yang tampil di halaman publik. Proyek unggulan tampil lebih dulu; isi case study untuk membuka halaman detailnya."
        actions={
          !isEditorOpen && (
            <Btn icon={<Plus size={15} aria-hidden="true" />} onClick={() => setIsFormVisible(true)}>
              TAMBAH_PROYEK
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
          <ProjectForm onSubmit={handleCreate} onCancel={() => setIsFormVisible(false)} />
        </div>
      )}

      {editingProject && (
        <div className="mb-8">
          <ProjectForm
            key={editingProject.id}
            initial={editingProject}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProject(null)}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : projects.length === 0 ? (
        <EmptyState code="NO_PROJECTS">Belum ada proyek. Tambahkan yang pertama.</EmptyState>
      ) : (
        <CardGrid>
          {projects.map((project, projectIndex) => {
            const hasCaseStudy = Boolean(
              project.case_study_problem ||
                project.case_study_approach ||
                project.case_study_tradeoff ||
                project.case_study_learnings
            )
            return (
              <li key={project.id} className="adm-card flex flex-col gap-4 p-4">
                <div className="flex items-start gap-3">
                  {project.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image_url}
                      alt=""
                      className="h-14 w-14 shrink-0 border border-adm-line/20 object-cover"
                    />
                  ) : (
                    <div className="adm-thumb h-14 w-14">
                      <FolderGit2 size={18} aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="adm-mono text-[0.65rem] tracking-[0.14em] text-adm-dim">
                      ID_{String(projectIndex + 1).padStart(2, '0')}
                    </p>
                    <h2 className="truncate font-medium text-adm-text">{project.title}</h2>
                  </div>
                </div>

                <p className="line-clamp-2 text-sm leading-relaxed text-adm-muted">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {project.is_featured && <StatusTag tone="amber" dot>FEATURED</StatusTag>}
                  {hasCaseStudy && <StatusTag tone="violet">CASE_STUDY</StatusTag>}
                  {project.tech_stack.slice(0, 4).map((techItem) => (
                    <StatusTag key={techItem} tone="muted">{techItem}</StatusTag>
                  ))}
                  {project.tech_stack.length > 4 && (
                    <StatusTag tone="muted">+{project.tech_stack.length - 4}</StatusTag>
                  )}
                </div>

                <div className="mt-auto flex justify-end gap-2 border-t border-adm-line/10 pt-3">
                  <IconBtn
                    label={`Edit proyek ${project.title}`}
                    onClick={() => {
                      setEditingProject(project)
                      setIsFormVisible(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    <span className="max-sm:sr-only">Edit</span>
                  </IconBtn>
                  <ConfirmDeleteButton
                    itemName={`proyek ${project.title}`}
                    onConfirm={() => handleDelete(project.id)}
                  />
                </div>
              </li>
            )
          })}
        </CardGrid>
      )}
    </div>
  )
}
