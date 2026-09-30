'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * Modal generik dengan scrim backdrop, animasi masuk/keluar, dan
 * penutupan lewat Escape/klik-di-luar/tombol X. Dipakai untuk detail
 * certificate — bukan project (project sudah tidak pakai modal, klik
 * card langsung navigasi ke website proyeknya).
 */
export default function Modal({ open, onClose, children }: ModalProps) {
  // Escape untuk menutup, dan kunci scroll body selama modal terbuka
  // supaya konten di belakang tidak ikut ter-scroll bersamaan.
  useEffect(() => {
    if (!open) return

    function handleEscapeKey(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscapeKey)
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = previousBodyOverflow
    }
  }, [open, onClose])

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
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // stopPropagation supaya klik di DALAM panel tidak ikut
            // memicu onClose dari overlay pembungkus di luar.
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            style={{ backgroundColor: 'var(--panel-bg)' }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Tutup"
              style={{ backgroundColor: 'var(--chrome-fill)' }}
              className="absolute top-4 right-4 z-10 flex items-center justify-center min-w-11 min-h-11 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
