'use client'

import { useLanguage } from '@/lib/i18n/LanguageProvider'

interface LanguageSwitcherProps {
  /** 'default' = versi besar untuk menu utama Hero. 'compact' = versi
   *  pill kecil untuk navbar setelah scroll. */
  variant?: 'default' | 'compact'
}

/** Tombol toggle bahasa ID/EN — pasangan dari ThemeToggle, pola yang
 *  sama persis (dua variant, satu context di belakangnya). */
export default function LanguageSwitcher({
  variant = 'default',
}: LanguageSwitcherProps) {
  const { locale, toggleLocale } = useLanguage()

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLocale}
        aria-label={`${locale === 'id' ? 'ID / EN' : 'EN / ID'}: ${locale === 'id' ? 'ganti bahasa' : 'switch language'}`}
        className="flex items-center justify-center min-h-11 font-mono text-xs uppercase tracking-wider px-3 rounded-full border border-white/15 text-white/60 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors"
      >
        {locale === 'id' ? 'ID' : 'EN'} / {locale === 'id' ? 'EN' : 'ID'}
      </button>
    )
  }

  return (
    <button
      onClick={toggleLocale}
      aria-label={`${locale === 'id' ? 'ID / EN' : 'EN / ID'}: ${locale === 'id' ? 'ganti bahasa' : 'switch language'}`}
      className="group flex items-center gap-3 py-3 cursor-pointer select-none"
    >
      <span
        className="w-3 h-3 bg-purple-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: '0 0 12px rgba(192,132,252,0.8)' }}
      />
      <span className="font-mono font-bold text-2xl md:text-3xl tracking-wider uppercase text-white/80 group-hover:text-purple-300 transition-colors">
        [ {locale === 'id' ? 'ID' : 'EN'} / {locale === 'id' ? 'EN' : 'ID'} ]
      </span>
    </button>
  )
}
