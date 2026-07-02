'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from '@/components/admin/AvatarUpload'
import type { Profile } from '@/lib/types'

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profile').select('*').maybeSingle()
      if (data) setProfile(data)
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  async function handleAvatarUploaded(url: string) {
    setProfile((p) => ({ ...p, avatar_url: url }))

    // Simpan langsung ke DB begitu upload selesai, terpisah dari tombol
    // Simpan utama — supaya foto tidak hilang kalau user lupa klik Simpan.
    if (profile.id) {
      await supabase
        .from('profile')
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      setMessage('Foto profil tersimpan.')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (profile.id) {
      const { error } = await supabase
        .from('profile')
        .update({
          name: profile.name,
          role: profile.role,
          short_description: profile.short_description,
          long_description: profile.long_description,
          avatar_url: profile.avatar_url,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          email: profile.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        setMessage('Gagal menyimpan: ' + error.message)
      } else {
        setMessage('Tersimpan.')
      }
    } else {
      const { error } = await supabase.from('profile').insert(profile)
      if (error) {
        setMessage('Gagal menyimpan: ' + error.message)
      } else {
        setMessage('Profil dibuat.')
      }
    }

    setSaving(false)
  }

  if (loading) return <p className="text-white/40">Memuat...</p>

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Profil</h1>
      <form onSubmit={handleSave} className="glass-card p-6 space-y-4">
        {message && <p className="text-sm text-cyan-400">{message}</p>}

        <AvatarUpload
          currentUrl={profile.avatar_url ?? null}
          onUploaded={handleAvatarUploaded}
        />

        <div>
          <label className="block text-sm text-white/50 mb-1">Nama</label>
          <input
            value={profile.name ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">Role</label>
          <input
            value={profile.role ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, role: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">
            Deskripsi Singkat
          </label>
          <textarea
            value={profile.short_description ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, short_description: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">
            Deskripsi Lengkap (untuk section &quot;Tentang Saya&quot;)
          </label>
          <textarea
            value={profile.long_description ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, long_description: e.target.value }))
            }
            rows={5}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">GitHub URL</label>
          <input
            value={profile.github_url ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, github_url: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">
            LinkedIn URL
          </label>
          <input
            value={profile.linkedin_url ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, linkedin_url: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1">Email</label>
          <input
            value={profile.email ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  )
}