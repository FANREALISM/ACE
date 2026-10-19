'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  BACKGROUND_MODES,
  useBackground,
  type BackgroundMode,
} from '@/lib/background/useBackground'

/** Label & deskripsi tiap mode. Deskripsi menyebut bobotnya terang-
 *  terangan supaya pengunjung di perangkat lemah tahu harus pilih apa. */
export const BACKGROUND_LABELS: Record<
  BackgroundMode,
  { label: string; description: string }
> = {
  ps2: { label: 'PS2', description: 'Animasi 3D · paling berat' },
  ambient: { label: 'AMBIENT', description: 'Gradient CSS · ringan' },
  normal: { label: 'NORMAL', description: 'Statis · paling ringan' },
}

interface BackgroundSwitcherProps {
  /** 'default' = besar bergaya menu Hero. 'compact' = pill kecil Navbar.
   *  'floating' = pill bergaya kaca untuk tombol melayang pojok layar. */
  variant?: 'default' | 'compact' | 'floating'
  /** Arah popover. 'up' untuk elemen di bagian bawah layar. */
  placement?: 'down' | 'up'
  /** Sisi tempat popover menempel pada tombol. */
  align?: 'left' | 'right'
}

/**
 * Dropdown pilihan latar belakang bergaya terminal: `[ BKG: PS2 ]`.
 * Aksesibel: tombol dengan aria-haspopup="listbox", opsi role="option"
 * dengan roving focus, navigasi panah/Home/End, Enter/Spasi untuk memilih,
 * Escape menutup dan mengembalikan fokus ke tombol, klik di luar menutup.
 */
export default function BackgroundSwitcher({
  variant = 'default',
  placement = 'down',
  align = 'left',
}: BackgroundSwitcherProps) {
  const { mode, setMode } = useBackground()
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const listboxId = useId()

  // Sebelum mode terbaca di client, tampilkan placeholder — menghindari
  // label yang salah sesaat untuk pengunjung yang memilih mode lain.
  const currentLabel = mode ? BACKGROUND_LABELS[mode].label : '···'

  // Tutup saat klik/tap di luar komponen.
  useEffect(() => {
    if (!isOpen) return
    function handlePointerDown(pointerEvent: PointerEvent) {
      if (!containerRef.current?.contains(pointerEvent.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  // Saat terbuka, pindahkan fokus ke opsi aktif.
  useEffect(() => {
    if (isOpen) optionRefs.current[focusedIndex]?.focus()
  }, [isOpen, focusedIndex])

  function openList() {
    const activeIndex = mode ? BACKGROUND_MODES.indexOf(mode) : 0
    setFocusedIndex(Math.max(0, activeIndex))
    setIsOpen(true)
  }

  function closeList(shouldRestoreFocus: boolean) {
    setIsOpen(false)
    if (shouldRestoreFocus) triggerRef.current?.focus()
  }

  function choose(nextMode: BackgroundMode) {
    setMode(nextMode)
    closeList(true)
  }

  function handleListKeyDown(keyboardEvent: React.KeyboardEvent) {
    const lastIndex = BACKGROUND_MODES.length - 1
    switch (keyboardEvent.key) {
      case 'ArrowDown':
        keyboardEvent.preventDefault()
        setFocusedIndex((index) => (index >= lastIndex ? 0 : index + 1))
        break
      case 'ArrowUp':
        keyboardEvent.preventDefault()
        setFocusedIndex((index) => (index <= 0 ? lastIndex : index - 1))
        break
      case 'Home':
        keyboardEvent.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        keyboardEvent.preventDefault()
        setFocusedIndex(lastIndex)
        break
      case 'Escape':
        keyboardEvent.preventDefault()
        closeList(true)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const triggerClassName =
    variant === 'floating'
      ? 'flex items-center justify-center min-h-11 font-mono text-[11px] sm:text-xs uppercase tracking-wider px-3.5 rounded-full border border-white/20 text-white/70 backdrop-blur-md shadow-lg hover:border-cyan-400/50 hover:text-cyan-300 transition-colors whitespace-nowrap'
      : variant === 'compact'
      ? 'flex items-center justify-center min-h-11 font-mono text-xs uppercase tracking-wider px-3 rounded-full border border-white/15 text-white/60 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors whitespace-nowrap'
      : 'group flex items-center gap-3 py-2 md:py-3 cursor-pointer select-none font-mono font-bold text-[clamp(1.05rem,5.4vw,1.5rem)] md:text-3xl tracking-wider uppercase text-white/80 hover:text-purple-300 transition-colors whitespace-nowrap'

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeList(false) : openList())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        // Nama aksesibel HARUS memuat teks yang terlihat (WCAG 2.5.3):
        // pengguna suara mengucapkan "BKG: NORMAL", bukan kalimat lain.
        aria-label={`BKG: ${currentLabel}, ubah latar belakang`}
        className={triggerClassName}
        style={
          variant === 'floating'
            ? { backgroundColor: 'var(--panel-bg)' }
            : undefined
        }
      >
        [ BKG: {currentLabel} ]
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Pilihan latar belakang"
          onKeyDown={handleListKeyDown}
          className={`absolute z-[70] w-64 max-w-[calc(100vw-3rem)] rounded-xl border border-white/15 p-1.5 shadow-2xl backdrop-blur-md ${
            placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{ backgroundColor: 'var(--panel-bg)' }}
        >
          {BACKGROUND_MODES.map((optionMode, optionIndex) => {
            const isActive = mode === optionMode
            return (
              <button
                key={optionMode}
                ref={(element) => {
                  optionRefs.current[optionIndex] = element
                }}
                type="button"
                role="option"
                aria-selected={isActive}
                tabIndex={optionIndex === focusedIndex ? 0 : -1}
                onClick={() => choose(optionMode)}
                className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg font-mono transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="text-xs mt-0.5">
                  [{isActive ? '■' : ' '}]
                </span>
                <span className="flex flex-col">
                  <span className="text-sm uppercase tracking-wider">
                    {BACKGROUND_LABELS[optionMode].label}
                  </span>
                  <span className="text-[11px] text-white/40 normal-case tracking-normal">
                    {BACKGROUND_LABELS[optionMode].description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
