'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useDialogFocus } from '@/lib/a11y/useDialogFocus'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** Nama dialog untuk pembaca layar (mis. judul sertifikat). */
  ariaLabel?: string
  children: React.ReactNode
}

/**
 * Modal generik dengan scrim backdrop, animasi masuk/keluar, dan
 * penutupan lewat Escape/klik-di-luar/tombol X. Dipakai untuk detail
 * certificate — bukan project (project sudah tidak pakai modal, klik
 * card langsung navigasi ke website proyeknya).
 */
export default function Modal({
  open,
  onClose,
  ariaLabel = 'Detail',
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Fokus masuk ke dialog, Tab berputar di dalamnya, Escape menutup, dan
  // fokus kembali ke pemicu saat ditutup (lihat lib/a11y/useDialogFocus).
  useDialogFocus(open, panelRef, onClose)

  // Kunci scroll body selama modal terbuka supaya konten di belakang tidak
  // ikut ter-scroll bersamaan.
  useEffect(() => {
    if (!open) return
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Scrim backdrop — sengaja tetap gelap di kedua tema (lihat
              catatan di globals.css), bukan ikut warna tema. */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // stopPropagation supaya klik di DALAM panel tidak ikut
            // memicu onClose dari overlay pembungkus di luar.
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            style={{ backgroundColor: 'var(--panel-bg)' }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl focus:outline-none"
          >
            <button
              onClick={onClose}
              aria-label="Tutup"
              style={{ backgroundColor: 'var(--chrome-fill)' }}
              className="absolute top-4 right-4 z-10 flex items-center justify-center min-w-11 min-h-11 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              <X size={18} aria-hidden="true" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
