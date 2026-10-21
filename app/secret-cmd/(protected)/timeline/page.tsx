'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TimelineForm from '@/components/admin/TimelineForm'
import type { TimelineEntry } from '@/lib/types'
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
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ??
    Icons.Briefcase
  )
}

/** "YYYY-MM-DD" → "Mar 2022", tanpa lewat timezone lokal (lihat
 *  catatan di components/sections/Timeline.tsx). */
function formatMonthYear(isoDate: string): string {
  const [yearPart, monthPart] = isoDate.split('-').map(Number)
  if (!yearPart || !monthPart) return isoDate
  return new Date(Date.UTC(yearPart, monthPart - 1, 1)).toLocaleDateString(
    'id-ID',
    { month: 'short', year: 'numeric', timeZone: 'UTC' }
  )
}

/** Halaman admin CRUD untuk Timeline Karir & Pendidikan — pola sama
 *  dengan halaman admin lain. Tidak ada tombol reorder: urutan tampil
 *  ditentukan otomatis oleh start_date (terbaru dulu), jadi mengubah
 *  tanggal sudah cukup untuk memindahkan posisi entri. */
export default function TimelineAdminPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadEntries() {
    setIsLoading(true)
    setErrorMessage(null)
    const { data: entriesData, error: loadError } = await supabase
      .from('timeline_entries')
      .select('*')
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (loadError) {
      setErrorMessage(
        'Gagal memuat timeline: ' +
          loadError.message +
          ' (sudah menjalankan supabase/add_timeline_entries.sql?)'
      )
      setIsLoading(false)
      return
    }
    setEntries((entriesData as TimelineEntry[]) ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(
    entryData: Omit<TimelineEntry, 'id' | 'created_at'>
  ) {
    setErrorMessage(null)
    const { error: insertError } = await supabase
      .from('timeline_entries')
      .insert(entryData)
    if (insertError) {
      setErrorMessage('Gagal menambah entri: ' + insertError.message)
      return
    }
    setIsFormVisible(false)
    loadEntries()
  }

  async function handleUpdate(
    entryData: Omit<TimelineEntry, 'id' | 'created_at'>
  ) {
    if (!editingEntry) return
    setErrorMessage(null)
    const { error: updateError } = await supabase
      .from('timeline_entries')
      .update(entryData)
      .eq('id', editingEntry.id)
    if (updateError) {
      setErrorMessage('Gagal menyimpan entri: ' + updateError.message)
      return
    }
    setEditingEntry(null)
    loadEntries()
  }

  async function handleDelete(entryId: string) {
    setErrorMessage(null)
    const { error: deleteError } = await supabase
      .from('timeline_entries')
      .delete()
      .eq('id', entryId)
    if (deleteError) {
      setErrorMessage('Gagal menghapus entri: ' + deleteError.message)
      return
    }
    loadEntries()
  }

  const isEditorOpen = isFormVisible || editingEntry !== null

  return (
    <div>
      <PageHeader
        code="TIMELINE_DB"
        title="Kelola Timeline Karir & Pendidikan"
        description="Urutan tampil otomatis dari tanggal mulai (terbaru dulu) — ubah tanggal untuk memindahkan entri."
        actions={
          !isEditorOpen && (
            <Btn icon={<Plus size={15} aria-hidden="true" />} onClick={() => setIsFormVisible(true)}>
              TAMBAH_ENTRI
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
          <TimelineForm onSubmit={handleCreate} onCancel={() => setIsFormVisible(false)} />
        </div>
      )}

      {editingEntry && (
        <div className="mb-8">
          <TimelineForm
            // key memaksa form di-mount ulang saat pindah edit ke entri
            // lain — tanpa ini useState di form mempertahankan nilai
            // entri sebelumnya.
            key={editingEntry.id}
            initial={editingEntry}
            onSubmit={handleUpdate}
            onCancel={() => setEditingEntry(null)}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : entries.length === 0 && !errorMessage ? (
        <EmptyState code="NO_ENTRIES">Belum ada entri timeline.</EmptyState>
      ) : (
        <CardGrid>
          {entries.map((entry) => {
            const EntryIcon = resolveIcon(entry.icon)
            const isCareer = entry.type === 'career'
            return (
              <li
                key={entry.id}
                data-accent={isCareer ? undefined : 'violet'}
                className="adm-card flex flex-col gap-3 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`adm-thumb h-10 w-10 !border-solid ${
                      isCareer ? '!text-adm-cyan' : '!text-adm-violet'
                    }`}
                  >
                    <EntryIcon size={17} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`adm-mono text-[0.65rem] uppercase tracking-[0.12em] ${
                        isCareer ? 'text-adm-cyan' : 'text-adm-violet'
                      }`}
                    >
                      [ {isCareer ? 'Karir' : 'Pendidikan'} ]
                    </p>
                    <h2 className="mt-0.5 text-sm font-medium leading-snug text-adm-text">
                      {entry.title}
                    </h2>
                    <p className="truncate text-sm text-adm-muted">{entry.organization}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusTag tone="muted">
                    {formatMonthYear(entry.start_date)} —{' '}
                    {entry.is_current
                      ? 'Sekarang'
                      : entry.end_date
                        ? formatMonthYear(entry.end_date)
                        : '?'}
                  </StatusTag>
                  {entry.is_current && (
                    <StatusTag tone="green" dot pulse>
                      AKTIF
                    </StatusTag>
                  )}
                </div>

                <div className="mt-auto flex justify-end gap-2 border-t border-adm-line/10 pt-3">
                  <IconBtn
                    label={`Edit entri ${entry.title}`}
                    onClick={() => {
                      setEditingEntry(entry)
                      setIsFormVisible(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    <span className="max-sm:sr-only">Edit</span>
                  </IconBtn>
                  <ConfirmDeleteButton
                    itemName={`entri ${entry.title}`}
                    onConfirm={() => handleDelete(entry.id)}
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
