'use client'

import { useId, useState } from 'react'
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

/**
 * Upload file non-gambar (default: PDF) — dipakai untuk CV/resume di
 * Settings admin. Terpisah dari ImageUpload.tsx karena validasinya beda
 * (tidak cek file.type.startsWith('image/')) dan UI-nya tampilkan link
 * "Lihat file saat ini" alih-alih thumbnail preview.
 */
export default function FileUpload({
  bucket,
  currentUrl,
  onUploaded,
  label = 'File',
  accept = 'application/pdf',
  maxSizeMb = 10,
}: FileUploadProps) {
  const inputId = useId()
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleFileSelected(
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = changeEvent.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > maxSizeMb * 1024 * 1024) {
      setErrorMessage(`Ukuran file maksimal ${maxSizeMb}MB.`)
      return
    }

    setErrorMessage(null)
    setIsUploading(true)

    const fileExtension = selectedFile.name.split('.').pop()
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
        <div className="adm-thumb h-12 w-12">
          <FileText size={20} />
        </div>
        <div className="flex-1">
          <input
            id={inputId}
            type="file"
            accept={accept}
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
          {currentUrl && !isUploading && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-adm-cyan hover:underline mt-1"
            >
              <ExternalLink size={11} /> Lihat file saat ini
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
