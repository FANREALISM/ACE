'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  currentUrl: string | null
  onUploaded: (url: string) => void
}

/**
 * Upload foto profil untuk Hero section — dedicated ke bucket 'avatars'
 * (beda dari ImageUpload.tsx generik yang bucket-nya jadi parameter,
 * karena avatar cuma satu per situs dan bucket-nya perlu dibuat khusus
 * lewat migrasi create_avatars_bucket.sql).
 */
export default function AvatarUpload({
  currentUrl,
  onUploaded,
}: AvatarUploadProps) {
  const inputId = useId()
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleFileSelected(
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = changeEvent.target.files?.[0]
    if (!selectedFile) return

    // Validasi dasar: tolak file bukan gambar atau lebih dari 5MB sebelum
    // upload, supaya user tidak nunggu upload gagal di tengah jalan.
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
    const storagePath = `profile-${Date.now()}.${fileExtension}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, selectedFile, { upsert: true })

    if (uploadError) {
      setErrorMessage('Gagal upload: ' + uploadError.message)
      setIsUploading(false)
      return
    }

    const { data: publicUrlResult } = supabase.storage
      .from('avatars')
      .getPublicUrl(storagePath)
    onUploaded(publicUrlResult.publicUrl)
    setIsUploading(false)
  }

  return (
    <div>
      <label htmlFor={inputId} className="adm-label">Foto Profil</label>
      <div className="flex items-center gap-4">
        <div className="adm-thumb h-20 w-20">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt="Foto profil"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="adm-mono text-xs text-adm-dim">
              No Photo
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
