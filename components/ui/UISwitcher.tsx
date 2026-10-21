'use client'

import { Gamepad2, Terminal } from 'lucide-react'
import { UI_THEME_LABELS, useUITheme } from '@/lib/ui/UIThemeContext'

interface UISwitcherProps {
  className?: string
}

/**
 * Tombol `[ UI: TERMINAL ]` ↔ `[ UI: GAME HUD ]`. Hanya dua mode, jadi
 * cukup satu tombol toggle (bukan listbox seperti BackgroundSwitcher).
 *
 * Tombol ini sendiri ikut berubah wujud lewat CSS (kelas `hud-chip`:
 * pil di Terminal, potongan chamfer di Game HUD) — tanpa ternary di JSX.
 */
export default function UISwitcher({ className = '' }: UISwitcherProps) {
  const { ui, toggleUI } = useUITheme()

  // Sebelum mode terbaca di client, placeholder — menghindari label yang
  // salah sesaat untuk pengunjung yang memilih mode lain.
  const currentLabel = ui ? UI_THEME_LABELS[ui].label : '···'
  const nextLabel = ui === 'game' ? UI_THEME_LABELS.terminal.label : UI_THEME_LABELS.game.label

  return (
    <button
      type="button"
      onClick={toggleUI}
      // Nama aksesibel memuat teks yang terlihat (WCAG 2.5.3).
      aria-label={`UI: ${currentLabel}, ganti ke ${nextLabel}`}
      className={`hud-chip hud-round-sm flex min-h-11 w-11 items-center justify-center whitespace-nowrap rounded-full border border-white/20 px-0 sm:w-auto sm:px-3.5 font-mono text-[11px] uppercase tracking-wider text-white/70 shadow-lg backdrop-blur-md transition-colors hover:border-cyan-400/50 hover:text-cyan-300 sm:text-xs ${className}`}
      style={{ backgroundColor: 'var(--panel-bg)' }}
    >
      {/* Mobile: tombol bulat berisi ikon mode aktif (Terminal / Gamepad —
          dipilih CSS dari data-ui, bukan ternary). sm ke atas: label teks. */}
      <Terminal size={18} aria-hidden="true" className="hidden terminal:block sm:!hidden" />
      <Gamepad2 size={18} aria-hidden="true" className="hidden game:block sm:!hidden" />
      <span className="hidden sm:inline">[ UI: {currentLabel} ]</span>
    </button>
  )
}
