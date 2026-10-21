'use client'

import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { TUTORIAL_CHROME } from '@/lib/tutorial/steps'
import { useTutorial } from '@/lib/tutorial/useTutorial'

interface TutorialReplayButtonProps {
  /** 'navbar' = tombol bulat ringkas; 'footer' = tombol teks dengan label. */
  variant?: 'navbar' | 'footer'
  /** Nilai `data-tutorial` bila tombol ini dijadikan target sorotan. */
  dataTutorial?: string
}

/** Tombol `[ ? ]` untuk memutar ulang tutorial dari UI aktif saat ini. */
export default function TutorialReplayButton({
  variant = 'navbar',
  dataTutorial,
}: TutorialReplayButtonProps) {
  const { start } = useTutorial()
  const { locale } = useLanguage()
  const label = TUTORIAL_CHROME[locale].replay

  const variantClasses =
    variant === 'navbar'
      ? 'min-w-11 min-h-11 justify-center rounded-full text-white/60 hover:text-cyan-300'
      : 'min-h-11 gap-2 px-2 text-white/40 hover:text-cyan-400'

  return (
    <button
      type="button"
      onClick={start}
      aria-label={label}
      title={label}
      data-tutorial={dataTutorial}
      className={`hud-chip flex items-center whitespace-nowrap font-mono text-xs uppercase tracking-wider transition-colors ${variantClasses}`}
    >
      <span aria-hidden="true">[ ? ]</span>
      {variant === 'footer' && <span aria-hidden="true" className="hidden sm:inline">{label}</span>}
    </button>
  )
}
