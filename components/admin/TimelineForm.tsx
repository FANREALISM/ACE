'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TimelineEntry, TimelineEntryType } from '@/lib/types'

interface TimelineFormProps {
  initial?: Partial<TimelineEntry>
  onSubmit: (data: Omit<TimelineEntry, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

// Ikon relevan untuk karir & pendidikan — dikurasi (bukan daftar penuh
// lucide-react), alasan sama dengan AboutSectionForm/SkillForm.
const ICON_OPTIONS = [
  'Briefcase',
  'GraduationCap',
  'Code2',
  'Building2',
  'Laptop',
  'Rocket',
  'Award',
  'BookOpen',
  'School',
  'Users',
  'Terminal',
  'Database',
  'Palette',
  'Wrench',
  'Trophy',
] as const

const TYPE_OPTIONS: { value: TimelineEntryType; label: string }[] = [
  { value: 'career', label: 'Karir' },
  { value: 'education', label: 'Pendidikan' },
]

/** Ikon default per tipe — dipakai selama admin belum memilih ikon sendiri. */
const DEFAULT_ICON_BY_TYPE: Record<TimelineEntryType, string> = {
  career: 'Briefcase',
  education: 'GraduationCap',
}

function resolveIcon(iconName: string): LucideIcon {
  return (
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ??
    Icons.Briefcase
  )
}

/**
 * Form admin untuk satu entri timeline — tipe, judul, organisasi, rentang
 * tanggal (dengan checkbox "Sekarang" yang mematikan End Date), deskripsi,
 * dan icon picker. Dipakai untuk create DAN edit (bedanya cuma ada/
 * tidaknya prop `initial`).
 */
export default function TimelineForm({
  initial,
  onSubmit,
  onCancel,
}: TimelineFormProps) {
  const [entryType, setEntryType] = useState<TimelineEntryType>(
    initial?.type ?? 'career'
  )
  const [title, setTitle] = useState(initial?.title ?? '')
  const [organization, setOrganization] = useState(initial?.organization ?? '')
  const [startDate, setStartDate] = useState(initial?.start_date ?? '')
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')
  const [isCurrent, setIsCurrent] = useState(initial?.is_current ?? false)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [selectedIcon, setSelectedIcon] = useState(
    initial?.icon ?? DEFAULT_ICON_BY_TYPE[initial?.type ?? 'career']
  )
  // Saat edit, ikon yang tersimpan dianggap pilihan sadar admin. Saat
  // create, ikon ikut berganti otomatis mengikuti tipe sampai admin
  // klik ikon sendiri — supaya memilih "Pendidikan" tidak meninggalkan
  // ikon koper di form.
  const [hasPickedIcon, setHasPickedIcon] = useState(Boolean(initial?.icon))
  const [isSaving, setIsSaving] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  )

  function handleTypeChange(nextType: TimelineEntryType) {
    setEntryType(nextType)
    if (!hasPickedIcon) setSelectedIcon(DEFAULT_ICON_BY_TYPE[nextType])
  }

  function handleIconPick(iconName: string) {
    setSelectedIcon(iconName)
    setHasPickedIcon(true)
  }

  function handleCurrentToggle(checked: boolean) {
    setIsCurrent(checked)
    // Kosongkan End Date saat "Sekarang" dicentang — kalau tidak, nilai
    // lama yang tersembunyi di input disabled bisa ikut tersimpan.
    if (checked) setEndDate('')
  }

  /** Validasi sisi klien; return pesan error atau null kalau valid.
   *  Aturan yang sama dijaga constraint di SQL sebagai pagar terakhir. */
  function validate(): string | null {
    if (!title.trim()) return 'Title wajib diisi.'
    if (!organization.trim()) return 'Organization wajib diisi.'
    if (!startDate) return 'Start Date wajib diisi.'
    if (!isCurrent && !endDate) {
      return 'Isi End Date, atau centang "Sekarang" kalau masih berlangsung.'
    }
    // String YYYY-MM-DD aman dibandingkan leksikografis (tanpa isu timezone).
    if (!isCurrent && endDate < startDate) {
      return 'End Date tidak boleh sebelum Start Date.'
    }
    return null
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    if (isSaving) return

    const problem = validate()
    setValidationMessage(problem)
    if (problem) return

    setIsSaving(true)
    try {
      await onSubmit({
        type: entryType,
        title: title.trim(),
        organization: organization.trim(),
        start_date: startDate,
        end_date: isCurrent ? null : endDate,
        is_current: isCurrent,
        description: description.trim() || null,
        icon: selectedIcon,
      })
    } catch (caughtError) {
      // Halaman induk biasanya menangani error Supabase sendiri; ini
      // jaring pengaman kalau onSubmit melempar exception tak terduga,
      // supaya tombol Simpan tidak macet di status "Menyimpan...".
      setValidationMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Terjadi kesalahan saat menyimpan.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      {validationMessage && (
        <p
          role="alert"
          className="text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3"
        >
          {validationMessage}
        </p>
      )}

      <fieldset>
        <legend className="block text-sm text-white/50 mb-2">Tipe</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map((typeOption) => {
            const isActiveType = entryType === typeOption.value
            return (
              <button
                key={typeOption.value}
                type="button"
                onClick={() => handleTypeChange(typeOption.value)}
                aria-pressed={isActiveType}
                className={`py-2 rounded-lg border text-sm font-mono uppercase transition-colors ${
                  isActiveType
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30'
                }`}
              >
                {typeOption.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="timeline-title" className="block text-sm text-white/50 mb-1">
          {entryType === 'career' ? 'Title (Posisi)' : 'Title (Gelar / Jurusan)'}
        </label>
        <input
          id="timeline-title"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          required
          placeholder={
            entryType === 'career'
              ? 'mis. Full-Stack Developer'
              : 'mis. S1 Teknik Informatika'
          }
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label
          htmlFor="timeline-organization"
          className="block text-sm text-white/50 mb-1"
        >
          {entryType === 'career'
            ? 'Organization (Perusahaan)'
            : 'Organization (Sekolah / Kampus)'}
        </label>
        <input
          id="timeline-organization"
          value={organization}
          onChange={(changeEvent) => setOrganization(changeEvent.target.value)}
          required
          placeholder={
            entryType === 'career' ? 'mis. PT Contoh Teknologi' : 'mis. Universitas Contoh'
          }
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="timeline-start-date"
            className="block text-sm text-white/50 mb-1"
          >
            Start Date
          </label>
          <input
            id="timeline-start-date"
            type="date"
            value={startDate}
            onChange={(changeEvent) => setStartDate(changeEvent.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label
            htmlFor="timeline-end-date"
            className="block text-sm text-white/50 mb-1"
          >
            End Date
          </label>
          <input
            id="timeline-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(changeEvent) => setEndDate(changeEvent.target.value)}
            disabled={isCurrent}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(changeEvent) =>
            handleCurrentToggle(changeEvent.target.checked)
          }
          className="w-4 h-4 accent-cyan-400"
        />
        Present / Sekarang (masih berlangsung)
      </label>

      <div>
        <label
          htmlFor="timeline-description"
          className="block text-sm text-white/50 mb-1"
        >
          Deskripsi (opsional)
        </label>
        <textarea
          id="timeline-description"
          value={description}
          onChange={(changeEvent) => setDescription(changeEvent.target.value)}
          rows={5}
          placeholder="Tanggung jawab, pencapaian, atau konteks singkat. Baris baru ikut ditampilkan."
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <p className="block text-sm text-white/50 mb-2">Ikon</p>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {ICON_OPTIONS.map((iconName) => {
            const IconComponent = resolveIcon(iconName)
            const isActiveIcon = selectedIcon === iconName
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => handleIconPick(iconName)}
                title={iconName}
                aria-label={`Pilih ikon ${iconName}`}
                aria-pressed={isActiveIcon}
                className={`flex items-center justify-center h-10 rounded-lg border transition-colors ${
                  isActiveIcon
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30'
                }`}
              >
                <IconComponent size={16} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
