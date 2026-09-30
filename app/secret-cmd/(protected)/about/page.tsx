'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import AboutSectionForm from '@/components/admin/AboutSectionForm'
import type { AboutSection } from '@/lib/types'
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
    if (!confirm('Yakin hapus paragraf ini?')) return
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Tentang Saya</h1>
        {!isFormVisible && !editingSection && (
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Paragraf
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
          <AboutSectionForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormVisible(false)}
          />
        </div>
      )}

      {editingSection && (
        <div className="mb-8">
          <AboutSectionForm
            initial={editingSection}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSection(null)}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-white/40">Memuat...</p>
      ) : (
        <div className="space-y-3">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shrink-0">
                    {(() => {
                      const SectionIcon = resolveIcon(section.icon)
                      return <SectionIcon size={14} />
                    })()}
                  </div>
                  {section.image_url && (
                    <Image
                      src={section.image_url}
                      alt={section.title}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs uppercase text-cyan-400/70 mb-1">
                      [ {section.title} ]
                    </p>
                    <p className="text-sm text-white/50 line-clamp-2">
                      {section.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveSection(sectionIndex, 'up')}
                    disabled={sectionIndex === 0}
                    aria-label="Pindahkan paragraf ke atas"
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveSection(sectionIndex, 'down')}
                    disabled={sectionIndex === sections.length - 1}
                    aria-label="Pindahkan paragraf ke bawah"
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingSection(section)
                      setIsFormVisible(false)
                    }}
                    aria-label="Edit paragraf ini"
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    aria-label="Hapus paragraf ini"
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
