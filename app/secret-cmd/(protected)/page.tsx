'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from '@/components/admin/AvatarUpload'
import type { Profile } from '@/lib/types'

const EMPTY: Omit<Profile, 'id' | 'updated_at'> = {
  name: '',
  role: '',
  short_description: '',
  long_description: '',
  avatar_url: null,
  github_url: '',
  linkedin_url: '',
  email: '',
}

export default function DashboardPage() {
  const supabase = createClient()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  async function loadProfile() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').maybeSingle()
    if (data) {
      setProfileId(data.id)
      setForm({
        name: data.name ?? '',
        role: data.role ?? '',
        short_description: data.short_description ?? '',
        long_description: data.long_description ?? '',
        avatar_url: data.avatar_url ?? null,
        github_url: data.github_url ?? '',
        linkedin_url: data.linkedin_url ?? '',
        email: data.email ?? '',
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

    if (profileId) {
      await supabase.from('profiles').update(form).eq('id', profileId)
    } else {
      // Belum ada baris profil sama sekali — buat satu. Tabel ini
      // didesain single-row (ditampilkan lewat .maybeSingle() di halaman
      // publik), jadi insert cuma terjadi sekali seumur hidup situs.
      const { data } = await supabase.from('profiles').insert(form).select().maybeSingle()
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

      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        <AvatarUpload
          currentUrl={form.avatar_url}
          onUploaded={(url) => update('avatar_url', url)}
        />

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