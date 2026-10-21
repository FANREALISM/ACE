'use client'

import { useState } from 'react'
import type { Certificate } from '@/lib/types'
import ImageUpload from './ImageUpload'
import { Btn } from '@/components/admin/AdminUI'

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
    <form onSubmit={handleSubmit} className="adm-panel space-y-5 p-5 sm:p-6">
      <h2 className="adm-panel-title">
        <span aria-hidden="true">▸</span>[ {initial ? 'EDIT_DATA' : 'NEW_ENTRY'} ]
      </h2>
      <div>
        <label htmlFor="certificateform-1" className="adm-label">
          Judul Sertifikat <span className="text-adm-red">(wajib)</span>
        </label>
        <input id="certificateform-1"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          required
          className="adm-input"
        />
      </div>
      <div>
        <label htmlFor="certificateform-2" className="adm-label">
          Penerbit <span className="text-adm-red">(wajib)</span>
        </label>
        <input id="certificateform-2"
          value={issuer}
          onChange={(changeEvent) => setIssuer(changeEvent.target.value)}
          required
          className="adm-input"
        />
      </div>
      <div>
        <label htmlFor="certificateform-3" className="adm-label">
          Tanggal Terbit <span className="text-adm-dim">(opsional)</span>
        </label>
        <input id="certificateform-3"
          type="date"
          value={issueDate ?? ''}
          onChange={(changeEvent) => setIssueDate(changeEvent.target.value)}
          className="adm-input"
        />
      </div>
      <div>
        <label htmlFor="certificateform-4" className="adm-label">
          Tanggal Kedaluwarsa <span className="text-adm-dim">(opsional)</span>
        </label>
        <input id="certificateform-4"
          type="date"
          value={expiryDate ?? ''}
          onChange={(changeEvent) => setExpiryDate(changeEvent.target.value)}
          className="adm-input"
        />
        <p className="adm-hint">
          Isi kalau sertifikat punya masa berlaku (mis. AWS, Azure).
          Kosongkan kalau berlaku selamanya.
        </p>
      </div>
      <div>
        <label htmlFor="certificateform-5" className="adm-label">
          Credential ID <span className="text-adm-dim">(opsional)</span>
        </label>
        <input id="certificateform-5"
          value={credentialId ?? ''}
          onChange={(changeEvent) => setCredentialId(changeEvent.target.value)}
          placeholder="mis. ABC-1234-XYZ"
          className="adm-input"
        />
        <p className="adm-hint">
          Nomor/ID unik sertifikat — beda dari URL verifikasi di bawah,
          biasanya dipakai untuk verifikasi manual.
        </p>
      </div>
      <div>
        <label htmlFor="certificateform-6" className="adm-label">
          URL Kredensial <span className="text-adm-dim">(opsional)</span>
        </label>
        <input id="certificateform-6"
          value={credentialUrl ?? ''}
          onChange={(changeEvent) => setCredentialUrl(changeEvent.target.value)}
          className="adm-input"
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
          <label htmlFor="certificateform-7" className="adm-label">
            Atau URL Gambar (dari internet)
          </label>
          <input id="certificateform-7"
            value={imageUrl ?? ''}
            onChange={(changeEvent) => setImageUrl(changeEvent.target.value)}
            placeholder="https://..."
            className="adm-input"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Btn type="submit" disabled={isSaving}>{isSaving ? 'MENYIMPAN...' : 'SIMPAN'}</Btn>
        <Btn variant="ghost" onClick={onCancel}>BATAL</Btn>
      </div>
    </form>
  )
}
