'use client'

import { useState } from 'react'
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
      <label className="block text-sm text-white/50 mb-2">Foto Profil</label>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt="Foto profil"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
              No Photo
            </div>
          )}
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            disabled={isUploading}
            className="text-sm text-white/60 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:text-white/70 file:cursor-pointer hover:file:bg-white/10"
          />
          {isUploading && (
            <p className="text-xs text-cyan-400 mt-1">Mengunggah...</p>
          )}
          {errorMessage && (
            <p className="text-xs text-red-400 mt-1">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
