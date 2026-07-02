'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  bucket: string
  currentUrl: string | null
  onUploaded: (url: string) => void
  label?: string
}

export default function ImageUpload({
  bucket,
  currentUrl,
  onUploaded,
  label = 'Gambar',
}: ImageUploadProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.')
      return
    }

    setError(null)
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError('Gagal upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    onUploaded(data.publicUrl)
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-sm text-white/50 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
              No Image
            </div>
          )}
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm text-white/60 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:text-white/70 file:cursor-pointer hover:file:bg-white/10"
          />
          {uploading && (
            <p className="text-xs text-cyan-400 mt-1">Mengunggah...</p>
          )}
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}
