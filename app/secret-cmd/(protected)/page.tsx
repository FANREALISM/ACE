'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from '@/components/admin/AvatarUpload'
import FileUpload from '@/components/admin/FileUpload'
import type { Profile } from '@/lib/types'
import { Alert, Btn, LoadingState, PageHeader, Panel } from '@/components/admin/AdminUI'

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
    return <LoadingState label="MEMUAT_PROFIL" />
  }

  return (
    <div>
      <PageHeader
        code="PROFILE_CORE"
        title="Kelola Profil / Hero Section"
        description="Satu-satunya baris profil: nama, role, deskripsi Hero, tautan sosial, foto, CV, dan status ketersediaan."
      />

      {errorMessage && (
        <div className="mb-6">
          <Alert>{errorMessage}</Alert>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="IDENTITY">
            <div className="space-y-5">
              <AvatarUpload
                currentUrl={form.avatar_url}
                onUploaded={(url) => updateField('avatar_url', url)}
              />

              <fieldset>
                <legend className="adm-label">Ukuran Foto di Hero</legend>
                <div className="grid grid-cols-4 gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((sizeOption) => (
                    <button
                      key={sizeOption}
                      type="button"
                      onClick={() => updateField('avatar_size', sizeOption)}
                      aria-pressed={form.avatar_size === sizeOption}
                      className="adm-choice"
                    >
                      {sizeOption}
                    </button>
                  ))}
                </div>
                <p className="adm-hint">
                  Small / Medium (default) / Large / Extra Large. Berlaku untuk
                  foto di Hero section, bukan foto kecil di navbar.
                </p>
              </fieldset>

              <div>
                <label htmlFor="profile-name" className="adm-label">Nama</label>
                <input
                  id="profile-name"
                  value={form.name}
                  onChange={(changeEvent) => updateField('name', changeEvent.target.value)}
                  required
                  className="adm-input"
                />
              </div>

              <div>
                <label htmlFor="profile-role" className="adm-label">Role / Jabatan</label>
                <input
                  id="profile-role"
                  value={form.role}
                  onChange={(changeEvent) => updateField('role', changeEvent.target.value)}
                  required
                  placeholder="mis. Full-Stack Developer"
                  className="adm-input"
                />
              </div>

              <div>
                <label htmlFor="profile-short" className="adm-label">
                  Deskripsi Singkat (tampil di Hero)
                </label>
                <textarea
                  id="profile-short"
                  value={form.short_description}
                  onChange={(changeEvent) => updateField('short_description', changeEvent.target.value)}
                  required
                  rows={2}
                  className="adm-input"
                />
              </div>

              <div>
                <label htmlFor="profile-long" className="adm-label">
                  Deskripsi Panjang (opsional)
                </label>
                <textarea
                  id="profile-long"
                  value={form.long_description ?? ''}
                  onChange={(changeEvent) => updateField('long_description', changeEvent.target.value)}
                  rows={4}
                  className="adm-input"
                />
              </div>
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="LINKS">
              <div className="space-y-5">
                <div>
                  <label htmlFor="profile-github" className="adm-label">GitHub URL</label>
                  <input
                    id="profile-github"
                    value={form.github_url ?? ''}
                    onChange={(changeEvent) => updateField('github_url', changeEvent.target.value)}
                    className="adm-input"
                  />
                </div>
                <div>
                  <label htmlFor="profile-linkedin" className="adm-label">LinkedIn URL</label>
                  <input
                    id="profile-linkedin"
                    value={form.linkedin_url ?? ''}
                    onChange={(changeEvent) => updateField('linkedin_url', changeEvent.target.value)}
                    className="adm-input"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="adm-label">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={form.email ?? ''}
                    onChange={(changeEvent) => updateField('email', changeEvent.target.value)}
                    className="adm-input"
                  />
                </div>
                <div>
                  <label htmlFor="profile-wa" className="adm-label">Nomor WhatsApp</label>
                  <input
                    id="profile-wa"
                    type="tel"
                    value={form.whatsapp_number ?? ''}
                    onChange={(changeEvent) => updateField('whatsapp_number', changeEvent.target.value)}
                    placeholder="6281234567890 (format internasional, tanpa +)"
                    className="adm-input"
                  />
                  <p className="adm-hint">
                    Format: kode negara + nomor, tanpa spasi/tanda +. Contoh: 62
                    untuk Indonesia + nomor tanpa angka 0 di depan → 6281234567890.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="FILES_&_STATUS">
              <div className="space-y-5">
                <FileUpload
                  bucket="resume"
                  currentUrl={form.cv_url}
                  onUploaded={(url) => updateField('cv_url', url)}
                  label="CV / Resume (PDF)"
                />

                <div className="adm-input flex items-center justify-between gap-4">
                  <div id="availability-label">
                    <p className="text-sm text-adm-text">Available for Work</p>
                    <p className="text-xs text-adm-dim">
                      Kalau aktif, badge status tampil di Hero section.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.is_available}
                    aria-labelledby="availability-label"
                    onClick={() => updateField('is_available', !form.is_available)}
                    className="adm-switch"
                  />
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Btn type="submit" disabled={isSaving}>
            {isSaving ? 'MENYIMPAN...' : 'SIMPAN_PROFIL'}
          </Btn>
          {savedAt && <Alert tone="success">Tersimpan.</Alert>}
        </div>
      </form>
    </div>
  )
}
