'use client'

import { useState } from 'react'
import type { Certificate } from '@/lib/types'

interface CertificateFormProps {
  onSubmit: (data: Omit<Certificate, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

export default function CertificateForm({
  onSubmit,
  onCancel,
}: CertificateFormProps) {
  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [credentialUrl, setCredentialUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      title,
      issuer,
      issue_date: issueDate || null,
      credential_url: credentialUrl || null,
      image_url: null,
      display_order: 0,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Judul Sertifikat
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">Penerbit</label>
        <input
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Tanggal Terbit
        </label>
        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">
          URL Kredensial
        </label>
        <input
          value={credentialUrl}
          onChange={(e) => setCredentialUrl(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
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
