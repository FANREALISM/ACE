'use client'

import { useState } from 'react'
import type { Certificate } from '@/lib/types'
import ImageUpload from './ImageUpload'

interface CertificateFormProps {
  initial?: Partial<Certificate>
  onSubmit: (data: Omit<Certificate, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

/**
 * Form admin untuk satu sertifikat — title/issuer wajib, semua field
 * lain (tanggal, credential ID, URL, gambar) opsional. Dipakai untuk
 * create DAN edit lewat prop `initial` yang sama.
 */
export default function CertificateForm({
  initial,
  onSubmit,
  onCancel,
}: CertificateFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [issuer, setIssuer] = useState(initial?.issuer ?? '')
  const [issueDate, setIssueDate] = useState(initial?.issue_date ?? '')
  const [expiryDate, setExpiryDate] = useState(initial?.expiry_date ?? '')
  const [credentialId, setCredentialId] = useState(
    initial?.credential_id ?? ''
  )
  const [credentialUrl, setCredentialUrl] = useState(
    initial?.credential_url ?? ''
  )
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [isSaving, setIsSaving] = useState(false)

  /** Form ini dipakai untuk create DAN edit — dibedakan lewat ada/tidaknya
   *  prop `initial`, bukan komponen terpisah. */
  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setIsSaving(true)
    await onSubmit({
      title,
      issuer,
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      credential_id: credentialId || null,
      credential_url: credentialUrl || null,
      image_url: imageUrl || null,
      display_order: initial?.display_order ?? 0,
    })
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Judul Sertifikat <span className="text-red-400/70">(wajib)</span>
        </label>
        <input
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Penerbit <span className="text-red-400/70">(wajib)</span>
        </label>
        <input
          value={issuer}
          onChange={(changeEvent) => setIssuer(changeEvent.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Tanggal Terbit <span className="text-white/30">(opsional)</span>
        </label>
        <input
          type="date"
          value={issueDate ?? ''}
          onChange={(changeEvent) => setIssueDate(changeEvent.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Tanggal Kedaluwarsa <span className="text-white/30">(opsional)</span>
        </label>
        <input
          type="date"
          value={expiryDate ?? ''}
          onChange={(changeEvent) => setExpiryDate(changeEvent.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
        <p className="text-xs text-white/30 mt-1">
          Isi kalau sertifikat punya masa berlaku (mis. AWS, Azure).
          Kosongkan kalau berlaku selamanya.
        </p>
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">
          Credential ID <span className="text-white/30">(opsional)</span>
        </label>
        <input
          value={credentialId ?? ''}
          onChange={(changeEvent) => setCredentialId(changeEvent.target.value)}
          placeholder="mis. ABC-1234-XYZ"
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
        <p className="text-xs text-white/30 mt-1">
          Nomor/ID unik sertifikat — beda dari URL verifikasi di bawah,
          biasanya dipakai untuk verifikasi manual.
        </p>
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">
          URL Kredensial <span className="text-white/30">(opsional)</span>
        </label>
        <input
          value={credentialUrl ?? ''}
          onChange={(changeEvent) => setCredentialUrl(changeEvent.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
        />
      </div>

      <div className="space-y-3">
        <ImageUpload
          bucket="certificate-images"
          currentUrl={imageUrl || null}
          onUploaded={(uploadedUrl) => setImageUrl(uploadedUrl)}
          label="Upload Gambar Sertifikat"
        />
        <div>
          <label className="block text-sm text-white/50 mb-1">
            Atau URL Gambar (dari internet)
          </label>
          <input
            value={imageUrl ?? ''}
            onChange={(changeEvent) => setImageUrl(changeEvent.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-cyan-400"
          />
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
