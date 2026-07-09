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

export default function DashboardPage() {
  const supabase = createClient()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadProfile() {
    setLoading(true)
    setError(null)
    const { data, error: loadError } = await supabase
      .from('profile')
      .select('*')
      .maybeSingle()
    if (loadError) {
      setError('Gagal memuat profil: ' + loadError.message)
      setLoading(false)
      return
    }
    if (data) {
      setProfileId(data.id)
      setForm({
        name: data.name ?? '',
        role: data.role ?? '',
        short_description: data.short_description ?? '',
        long_description: data.long_description ?? '',
        avatar_url: data.avatar_url ?? null,
        avatar_size: data.avatar_size ?? 'md',
        github_url: data.github_url ?? '',
        linkedin_url: data.linkedin_url ?? '',
        email: data.email ?? '',
        whatsapp_number: data.whatsapp_number ?? '',
        cv_url: data.cv_url ?? null,
        is_available: data.is_available ?? true,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSavedAt(null)

    if (profileId) {
      const { error: updateError } = await supabase
        .from('profile')
        .update(form)
        .eq('id', profileId)
      if (updateError) {
        setError('Gagal menyimpan: ' + updateError.message)
        setSaving(false)
        return
      }
    } else {
      // Belum ada baris profil sama sekali — buat satu. Tabel ini
      // didesain single-row (ditampilkan lewat .maybeSingle() di halaman
      // publik), jadi insert cuma terjadi sekali seumur hidup situs.
      const { data, error: insertError } = await supabase
        .from('profile')
        .insert(form)
        .select()
        .maybeSingle()
      if (insertError) {
        setError('Gagal membuat profil: ' + insertError.message)
        setSaving(false)
        return
      }
      if (data) setProfileId(data.id)
    }

    setSaving(false)
    setSavedAt(Date.now())
  }

  if (loading) {
    return <p className="text-white/40">Memuat...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Kelola Profil / Hero Section</h1>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        <AvatarUpload
          currentUrl={form.avatar_url}
          onUploaded={(url) => update('avatar_url', url)}
        />

        <div>
          <label className="block text-sm text-white/50 mb-2">
            Ukuran Foto di Hero
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => update('avatar_size', size)}
                aria-pressed={form.avatar_size === size}
                className={`py-2 rounded-lg border text-sm font-mono uppercase transition-colors ${
                  form.avatar_size === size
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30'
                }`}
              >
                {size}
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
            onChange={(e) => update('name', e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">Role / Jabatan</label>
          <input
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
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
            onChange={(e) => update('short_description', e.target.value)}
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
            onChange={(e) => update('long_description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">GitHub URL</label>
          <input
            value={form.github_url ?? ''}
            onChange={(e) => update('github_url', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">LinkedIn URL</label>
          <input
            value={form.linkedin_url ?? ''}
            onChange={(e) => update('linkedin_url', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">Email</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => update('email', e.target.value)}
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
            onChange={(e) => update('whatsapp_number', e.target.value)}
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
          onUploaded={(url) => update('cv_url', url)}
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
            onClick={() => update('is_available', !form.is_available)}
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
            disabled={saving}
            className="py-2 px-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          {savedAt && (
            <span className="text-sm text-green-400">Tersimpan.</span>
          )}
        </div>
      </form>
    </div>
  )
}