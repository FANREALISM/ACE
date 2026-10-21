'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  /** Nama bucket Supabase Storage tujuan — beda konten pakai bucket
   *  beda (project-images, certificate-images, about-images, dst),
   *  supaya bisa diatur RLS/quota terpisah per jenis konten kalau perlu. */
  bucket: string
  currentUrl: string | null
  onUploaded: (url: string) => void
  label?: string
}

/**
 * Upload gambar generik untuk konten admin (project, certificate, about
 * section) — bucket tujuan jadi parameter, beda dari AvatarUpload.tsx
 * yang di-dedicate khusus ke bucket 'avatars'.
 */
export default function ImageUpload({
  bucket,
  currentUrl,
  onUploaded,
  label = 'Gambar',
}: ImageUploadProps) {
  const inputId = useId()
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleFileSelected(
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = changeEvent.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('File harus berupa gambar.')
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 5MB.')
      return
    }

    setErrorMessage(null)
    setIsUploading(true)

    const fileExtension = selectedFile.name.split('.').pop()
    // Nama file acak (timestamp + random string) supaya tidak pernah
    // bentrok antar upload, bahkan kalau dua admin upload file dengan
    // nama asli yang sama persis di waktu yang berdekatan.
    const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, selectedFile, { upsert: true })

    if (uploadError) {
      setErrorMessage('Gagal upload: ' + uploadError.message)
      setIsUploading(false)
      return
    }

    const { data: publicUrlResult } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath)
    onUploaded(publicUrlResult.publicUrl)
    setIsUploading(false)
  }

  return (
    <div>
      <label htmlFor={inputId} className="adm-label">{label}</label>
      <div className="flex items-center gap-4">
        <div className="adm-thumb h-20 w-20">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt={label}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="adm-mono text-xs text-adm-dim">
              No Image
            </div>
          )}
        </div>

        <div>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            disabled={isUploading}
            className="adm-file"
          />
          {isUploading && (
            <p className="adm-hint !text-adm-cyan">Mengunggah...</p>
          )}
          {errorMessage && (
            <p className="adm-hint !text-adm-red">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
