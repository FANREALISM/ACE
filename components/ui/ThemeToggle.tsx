'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme/ThemeProvider'

export default function ThemeToggle({
  variant = 'default',
}: {
  variant?: 'default' | 'compact'
}) {
  const { theme, toggleTheme } = useTheme()

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/60 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors"
      >
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      className="group flex items-center gap-3 py-4 cursor-pointer select-none"
    >
      <span
        className="w-3 h-3 bg-purple-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: '0 0 12px rgba(192,132,252,0.8)' }}
      />
      <span className="font-mono font-bold text-2xl md:text-3xl tracking-wider uppercase text-white/80 group-hover:text-purple-300 transition-colors flex items-center gap-3">
        [ {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />} ]
      </span>
    </button>
  )
}
