'use client'

import { useState } from 'react'
import { FileText, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FileUploadProps {
  bucket: string
  currentUrl: string | null
  onUploaded: (url: string) => void
  label?: string
  accept?: string
  maxSizeMb?: number
}

export default function FileUpload({
  bucket,
  currentUrl,
  onUploaded,
  label = 'File',
  accept = 'application/pdf',
  maxSizeMb = 10,
}: FileUploadProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSizeMb}MB.`)
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
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 shrink-0 text-white/30">
          <FileText size={20} />
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm text-white/60 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:text-white/70 file:cursor-pointer hover:file:bg-white/10"
          />
          {uploading && (
            <p className="text-xs text-cyan-400 mt-1">Mengunggah...</p>
          )}
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          {currentUrl && !uploading && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-1"
            >
              <ExternalLink size={11} /> Lihat file saat ini
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
