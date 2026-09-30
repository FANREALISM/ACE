'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from '@/components/admin/AvatarUpload'
import FileUpload from '@/components/admin/FileUpload'
import type { Profile } from '@/lib/types'

const EMPTY: Omit<Profile, 'id' | 'updated_at'> = {
  name: '',
  role: '',
  short_description: '',
  long_description: '',
  avatar_url: null,
  avatar_size: 'md',
  github_url: '',
  linkedin_url: '',
  email: '',
  whatsapp_number: '',
  cv_url: null,
  is_available: true,
}

/**
 * Halaman Settings admin — edit satu-satunya baris di tabel `profile`
 * (nama, role, deskripsi, link sosial, foto, CV, status ketersediaan).
 * Tabel ini didesain single-row, jadi handleSave INSERT kalau belum ada
 * baris sama sekali, atau UPDATE kalau sudah ada.
 */
export default function DashboardPage() {
  const supabase = createClient()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadProfile() {
    setIsLoading(true)
    setErrorMessage(null)
    const { data: profileRow, error: loadError } = await supabase
      .from('profile')
      .select('*')
      .maybeSingle()
    if (loadError) {
      setErrorMessage('Gagal memuat profil: ' + loadError.message)
      setIsLoading(false)
      return
    }
    if (profileRow) {
      setProfileId(profileRow.id)
      setForm({
        name: profileRow.name ?? '',
        role: profileRow.role ?? '',
        short_description: profileRow.short_description ?? '',
        long_description: profileRow.long_description ?? '',
        avatar_url: profileRow.avatar_url ?? null,
        avatar_size: profileRow.avatar_size ?? 'md',
        github_url: profileRow.github_url ?? '',
        linkedin_url: profileRow.linkedin_url ?? '',
        email: profileRow.email ?? '',
        whatsapp_number: profileRow.whatsapp_number ?? '',
        cv_url: profileRow.cv_url ?? null,
        is_available: profileRow.is_available ?? true,
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Update satu field form — generic supaya satu fungsi ini bisa
   *  dipakai untuk SEMUA field tanpa nulis setForm terpisah per field. */
  function updateField<FieldKey extends keyof typeof form>(
    fieldKey: FieldKey,
    fieldValue: (typeof form)[FieldKey]
  ) {
    setForm((previousForm) => ({ ...previousForm, [fieldKey]: fieldValue }))
  }

  async function handleSave(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)
    setSavedAt(null)

    if (profileId) {
      const { error: updateError } = await supabase
        .from('profile')
        .update(form)
        .eq('id', profileId)
      if (updateError) {
        setErrorMessage('Gagal menyimpan: ' + updateError.message)
        setIsSaving(false)
        return
      }
    } else {
      // Belum ada baris profil sama sekali — buat satu. Tabel ini
      // didesain single-row (ditampilkan lewat .maybeSingle() di halaman
      // publik), jadi insert cuma terjadi sekali seumur hidup situs.
      const { data: newProfileRow, error: insertError } = await supabase
        .from('profile')
        .insert(form)
        .select()
        .maybeSingle()
      if (insertError) {
        setErrorMessage('Gagal membuat profil: ' + insertError.message)
        setIsSaving(false)
        return
      }
      if (newProfileRow) setProfileId(newProfileRow.id)
    }

    setIsSaving(false)
    setSavedAt(Date.now())
  }

  if (isLoading) {
    return <p className="text-white/40">Memuat...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Kelola Profil / Hero Section</h1>

      {errorMessage && (
        <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
          {errorMessage}
        </p>
      )}

      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        <AvatarUpload
          currentUrl={form.avatar_url}
          onUploaded={(url) => updateField('avatar_url', url)}
        />

        <div>
          <label className="block text-sm text-white/50 mb-2">
            Ukuran Foto di Hero
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map((sizeOption) => (
              <button
                key={sizeOption}
                type="button"
                onClick={() => updateField('avatar_size', sizeOption)}
                aria-pressed={form.avatar_size === sizeOption}
                className={`py-2 rounded-lg border text-sm font-mono uppercase transition-colors ${
                  form.avatar_size === sizeOption
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30'
                }`}
              >
                {sizeOption}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-1">
            Small / Medium (default) / Large / Extra Large. Berlaku untuk
            foto di Hero section, bukan foto kecil di navbar.
          </p>
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">Nama</label>
          <input
            value={form.name}
            onChange={(changeEvent) => updateField('name', changeEvent.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">Role / Jabatan</label>
          <input
            value={form.role}
            onChange={(changeEvent) => updateField('role', changeEvent.target.value)}
            required
            placeholder="mis. Full-Stack Developer"
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">
            Deskripsi Singkat (tampil di Hero)
          </label>
          <textarea
            value={form.short_description}
            onChange={(changeEvent) => updateField('short_description', changeEvent.target.value)}
            required
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">
            Deskripsi Panjang (opsional)
          </label>
          <textarea
            value={form.long_description ?? ''}
            onChange={(changeEvent) => updateField('long_description', changeEvent.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">GitHub URL</label>
          <input
            value={form.github_url ?? ''}
            onChange={(changeEvent) => updateField('github_url', changeEvent.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">LinkedIn URL</label>
          <input
            value={form.linkedin_url ?? ''}
            onChange={(changeEvent) => updateField('linkedin_url', changeEvent.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">Email</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(changeEvent) => updateField('email', changeEvent.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">
            Nomor WhatsApp
          </label>
          <input
            type="tel"
            value={form.whatsapp_number ?? ''}
            onChange={(changeEvent) => updateField('whatsapp_number', changeEvent.target.value)}
            placeholder="6281234567890 (format internasional, tanpa +)"
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-white/30 mt-1">
            Format: kode negara + nomor, tanpa spasi/tanda +. Contoh: 62
            untuk Indonesia + nomor tanpa angka 0 di depan → 6281234567890.
          </p>
        </div>

        <FileUpload
          bucket="resume"
          currentUrl={form.cv_url}
          onUploaded={(url) => updateField('cv_url', url)}
          label="CV / Resume (PDF)"
        />

        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-black/40 border border-white/10">
          <div>
            <p className="text-sm text-white/80">Available for Work</p>
            <p className="text-xs text-white/40">
              Kalau aktif, badge status tampil di Hero section.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_available}
            onClick={() => updateField('is_available', !form.is_available)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.is_available ? 'bg-emerald-500/60' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                form.is_available ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2 px-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
          {savedAt && (
            <span className="text-sm text-green-400">Tersimpan.</span>
          )}
        </div>
      </form>
    </div>
  )
}