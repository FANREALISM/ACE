'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import AboutSectionForm from '@/components/admin/AboutSectionForm'
import type { AboutSection } from '@/lib/types'
import { Pencil, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Alert,
  Btn,
  ConfirmDeleteButton,
  EmptyState,
  IconBtn,
  LoadingState,
  PageHeader,
  StatusTag,
} from '@/components/admin/AdminUI'

function resolveIcon(iconName: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[iconName] ?? Icons.Cpu
}

/** Halaman admin CRUD untuk About sections — pola sama dengan halaman
 *  admin lain, ditambah fitur reorder (tombol panah atas/bawah) karena
 *  urutan paragraf About berpengaruh langsung ke urutan tampil di
 *  halaman publik. */
export default function AboutAdminPage() {
  const supabase = createClient()
  const [sections, setSections] = useState<AboutSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingSection, setEditingSection] = useState<AboutSection | null>(
    null
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadSections() {
    setIsLoading(true)
    setErrorMessage(null)
    const { data: sectionsData, error: loadError } = await supabase
      .from('about_sections')
      .select('*')
      .order('display_order', { ascending: true })
    if (loadError) {
      setErrorMessage('Gagal memuat konten About: ' + loadError.message)
      setIsLoading(false)
      return
    }
    setSections(sectionsData ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadSections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(
    sectionData: Omit<AboutSection, 'id' | 'created_at'>
  ) {
    setErrorMessage(null)
    const nextDisplayOrder =
      sections.length > 0
        ? Math.max(...sections.map((section) => section.display_order)) + 1
        : 0
    const { error: insertError } = await supabase
      .from('about_sections')
      .insert({ ...sectionData, display_order: nextDisplayOrder })
    if (insertError) {
      setErrorMessage('Gagal menambah paragraf: ' + insertError.message)
      return
    }
    setIsFormVisible(false)
    loadSections()
  }

  async function handleUpdate(
    sectionData: Omit<AboutSection, 'id' | 'created_at'>
  ) {
    if (!editingSection) return
    setErrorMessage(null)
    const { error: updateError } = await supabase
      .from('about_sections')
      .update(sectionData)
      .eq('id', editingSection.id)
    if (updateError) {
      setErrorMessage('Gagal menyimpan paragraf: ' + updateError.message)
      return
    }
    setEditingSection(null)
    loadSections()
  }

  async function handleDelete(sectionId: string) {
    setErrorMessage(null)
    const { error: deleteError } = await supabase
      .from('about_sections')
      .delete()
      .eq('id', sectionId)
    if (deleteError) {
      setErrorMessage('Gagal menghapus paragraf: ' + deleteError.message)
      return
    }
    loadSections()
  }

  /** Tukar display_order antara paragraf di `sectionIndex` dengan
   *  tetangganya (atas/bawah) — cara paling sederhana untuk reorder
   *  tanpa perlu drag-and-drop atau re-nomor ulang semua item. */
  async function handleMoveSection(
    sectionIndex: number,
    direction: 'up' | 'down'
  ) {
    const targetIndex =
      direction === 'up' ? sectionIndex - 1 : sectionIndex + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const currentSection = sections[sectionIndex]
    const targetSection = sections[targetIndex]
    setErrorMessage(null)

    const swapResults = await Promise.all([
      supabase
        .from('about_sections')
        .update({ display_order: targetSection.display_order })
        .eq('id', currentSection.id),
      supabase
        .from('about_sections')
        .update({ display_order: currentSection.display_order })
        .eq('id', targetSection.id),
    ])
    const failedSwap = swapResults.find((result) => result.error)
    if (failedSwap?.error) {
      setErrorMessage('Gagal mengubah urutan: ' + failedSwap.error.message)
      return
    }
    loadSections()
  }

  const isEditorOpen = isFormVisible || editingSection !== null

  return (
    <div>
      <PageHeader
        code="ABOUT_LOG"
        title="Kelola Tentang Saya"
        description="Urutan kartu di bawah = urutan paragraf di halaman publik. Pakai panah untuk memindahkan."
        actions={
          !isEditorOpen && (
            <Btn icon={<Plus size={15} aria-hidden="true" />} onClick={() => setIsFormVisible(true)}>
              TAMBAH_PARAGRAF
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
          <AboutSectionForm onSubmit={handleCreate} onCancel={() => setIsFormVisible(false)} />
        </div>
      )}

      {editingSection && (
        <div className="mb-8">
          <AboutSectionForm
            key={editingSection.id}
            initial={editingSection}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSection(null)}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : sections.length === 0 ? (
        <EmptyState code="NO_SECTIONS">Belum ada paragraf.</EmptyState>
      ) : (
        <ol className="space-y-3">
          {sections.map((section, sectionIndex) => {
            const SectionIcon = resolveIcon(section.icon)
            return (
              <li key={section.id} className="adm-card p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="adm-mono w-7 shrink-0 pt-1 text-xs text-adm-dim"
                    >
                      {String(sectionIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="adm-thumb h-9 w-9 !border-solid !text-adm-cyan">
                      <SectionIcon size={16} aria-hidden="true" />
                    </div>
                    {section.image_url && (
                      <Image
                        src={section.image_url}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 border border-adm-line/20 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="adm-mono mb-1 text-xs uppercase tracking-[0.12em] text-adm-cyan">
                        [ {section.title} ]
                      </h2>
                      <p className="line-clamp-2 text-sm leading-relaxed text-adm-muted">
                        {section.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5 self-end sm:self-start">
                    <IconBtn
                      label="Pindahkan paragraf ke atas"
                      onClick={() => handleMoveSection(sectionIndex, 'up')}
                      disabled={sectionIndex === 0}
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </IconBtn>
                    <IconBtn
                      label="Pindahkan paragraf ke bawah"
                      onClick={() => handleMoveSection(sectionIndex, 'down')}
                      disabled={sectionIndex === sections.length - 1}
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </IconBtn>
                    <IconBtn
                      label={`Edit paragraf ${section.title}`}
                      onClick={() => {
                        setEditingSection(section)
                        setIsFormVisible(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <Pencil size={15} aria-hidden="true" />
                    </IconBtn>
                    <ConfirmDeleteButton
                      itemName={`paragraf ${section.title}`}
                      onConfirm={() => handleDelete(section.id)}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
