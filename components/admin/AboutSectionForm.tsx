'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AboutSection } from '@/lib/types'
import ImageUpload from './ImageUpload'
import { translateToEnglish } from '@/lib/translate'
import { Languages } from 'lucide-react'
import { Btn } from '@/components/admin/AdminUI'

interface AboutSectionFormProps {
  initial?: Partial<AboutSection>
  onSubmit: (data: Omit<AboutSection, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

// Set ikon yang relevan untuk konten developer/portofolio.
// Dibatasi sengaja — daftar penuh lucide-react (>1000 ikon) di dropdown
// akan lebih sulit dipakai daripada pilihan terkurasi.
const ICON_OPTIONS = [
  'Cpu',
  'Code2',
  'Terminal',
  'Rocket',
  'Layers',
  'Database',
  'Gamepad2',
  'Sparkles',
  'GraduationCap',
  'Award',
  'Zap',
  'Blocks',
  'Brain',
  'Globe',
  'Wrench',
] as const

function resolveIcon(iconName: string): LucideIcon {
  return (
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ?? Icons.Cpu
  )
}

/**
 * Form admin untuk satu paragraf About section — judul, isi (ID+EN
 * opsional dengan tombol auto-translate), pilihan ikon, dan gambar
 * opsional. Dipakai untuk create DAN edit (bedanya cuma ada/tidaknya
 * prop `initial`).
 */
export default function AboutSectionForm({
  initial,
  onSubmit,
  onCancel,
}: AboutSectionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [contentEn, setContentEn] = useState(initial?.content_en ?? '')
  const [selectedIcon, setSelectedIcon] = useState(initial?.icon ?? 'Cpu')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateErrorMessage, setTranslateErrorMessage] = useState<
    string | null
  >(null)

  async function handleAutoTranslate() {
    if (!content.trim()) {
      setTranslateErrorMessage('Isi paragraf Indonesia dulu sebelum translate.')
      return
    }
    setIsTranslating(true)
    setTranslateErrorMessage(null)
    try {
      const translatedText = await translateToEnglish(content)
      setContentEn(translatedText)
    } catch (caughtError) {
      setTranslateErrorMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Gagal translate.'
      )
    } finally {
      setIsTranslating(false)
    }
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setIsSaving(true)
    await onSubmit({
      title,
      content,
      content_en: contentEn || null,
      icon: selectedIcon,
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
        <label htmlFor="aboutsectionform-1" className="adm-label">
          Judul (format: SYSTEM_LABEL // SUBTITLE)
        </label>
        <input id="aboutsectionform-1"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          required
          placeholder="SYSTEM INITIALIZATION // THE FOUNDATION"
          className="adm-input"
        />
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className="adm-label">Isi Paragraf</label>
        </div>
        <textarea
          value={content}
          onChange={(changeEvent) => setContent(changeEvent.target.value)}
          required
          rows={6}
          className="adm-input"
        />
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className="adm-label">
            Isi Paragraf (English) — opsional
          </label>
          <Btn
            variant="violet"
            size="sm"
            onClick={handleAutoTranslate}
            disabled={isTranslating}
            icon={<Languages size={13} aria-hidden="true" />}
          >
            {isTranslating ? 'MENERJEMAHKAN...' : 'AUTO_TRANSLATE_EN'}
          </Btn>
        </div>
        <textarea
          value={contentEn}
          onChange={(changeEvent) => setContentEn(changeEvent.target.value)}
          rows={6}
          placeholder="Kosong = fallback ke teks Indonesia saat visitor pilih EN"
          className="adm-input" data-accent="violet"
        />
        {translateErrorMessage && (
          <p className="adm-hint !text-adm-red">
            {translateErrorMessage}
          </p>
        )}
        <p className="adm-hint">
          Hasil auto-translate bisa diedit manual sebelum disimpan — jangan
          asumsikan mesin selalu benar, terutama istilah teknis.
        </p>
      </div>

      <div>
        <label className="adm-label">Ikon</label>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {ICON_OPTIONS.map((iconName) => {
            const IconComponent = resolveIcon(iconName)
            const isActiveIcon = selectedIcon === iconName
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => setSelectedIcon(iconName)}
                title={iconName}
                aria-label={`Pilih ikon ${iconName}`}
                aria-pressed={isActiveIcon}
                className="adm-choice h-10"
              >
                <IconComponent size={16} />
              </button>
            )
          })}
        </div>
      </div>

      <ImageUpload
        bucket="about-images"
        currentUrl={imageUrl || null}
        onUploaded={(uploadedUrl) => setImageUrl(uploadedUrl)}
        label="Gambar Section (opsional)"
      />

      <div className="flex flex-wrap gap-3 border-t border-adm-line/10 pt-5">
        <Btn type="submit" disabled={isSaving}>{isSaving ? 'MENYIMPAN...' : 'SIMPAN'}</Btn>
        <Btn variant="ghost" onClick={onCancel}>BATAL</Btn>
      </div>
    </form>
  )
}
