'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TimelineForm from '@/components/admin/TimelineForm'
import type { TimelineEntry } from '@/lib/types'
import { Pencil, Trash2, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
    if (!confirm('Yakin hapus entri timeline ini?')) return
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Timeline Karir & Pendidikan</h1>
        {!isFormVisible && !editingEntry && (
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Entri
          </button>
        )}
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3"
        >
          {errorMessage}
        </p>
      )}

      {isFormVisible && (
        <div className="mb-8">
          <TimelineForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormVisible(false)}
          />
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
        <p className="text-white/40">Memuat...</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const EntryIcon = resolveIcon(entry.icon)
            const isCareer = entry.type === 'career'
            return (
              <div key={entry.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${
                        isCareer
                          ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                          : 'bg-purple-500/10 border-purple-400/30 text-purple-300'
                      }`}
                    >
                      <EntryIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-mono text-xs uppercase mb-1 ${
                          isCareer ? 'text-cyan-300' : 'text-purple-300'
                        }`}
                      >
                        [ {isCareer ? 'Karir' : 'Pendidikan'} ] ·{' '}
                        {formatMonthYear(entry.start_date)} —{' '}
                        {entry.is_current
                          ? 'Sekarang'
                          : entry.end_date
                            ? formatMonthYear(entry.end_date)
                            : '?'}
                      </p>
                      <p className="text-sm text-white/80 truncate">
                        {entry.title}
                      </p>
                      <p className="text-sm text-white/50 truncate">
                        {entry.organization}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingEntry(entry)
                        setIsFormVisible(false)
                      }}
                      aria-label={`Edit entri ${entry.title}`}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      aria-label={`Hapus entri ${entry.title}`}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {entries.length === 0 && !errorMessage && (
            <p className="text-white/40">Belum ada entri timeline.</p>
          )}
        </div>
      )}
    </div>
  )
}
