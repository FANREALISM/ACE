'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface UseDialogFocusOptions {
  /** Elemen yang pertama kali difokus saat dialog terbuka. Default:
   *  elemen fokusable pertama di dalam dialog (atau dialog itu sendiri). */
  initialFocusRef?: RefObject<HTMLElement | null>
}

/**
 * Perilaku fokus standar dialog modal (WAI-ARIA Authoring Practices):
 *  1. Saat terbuka, fokus pindah ke dalam dialog.
 *  2. Tab / Shift+Tab berputar DI DALAM dialog — tidak bocor ke halaman di
 *     belakang scrim (yang tidak terlihat, tapi tetap bisa difokus).
 *  3. Escape menutup dialog.
 *  4. Saat tertutup, fokus kembali ke elemen yang membukanya — tanpa ini,
 *     pengguna keyboard/screen reader "terlempar" ke awal halaman.
 */
export function useDialogFocus(
  isOpen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  { initialFocusRef }: UseDialogFocusOptions = {}
) {
  // Ref supaya effect tidak dipasang ulang tiap render hanya karena
  // onClose berupa fungsi inline baru.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    function getFocusableElements(): HTMLElement[] {
      const container = containerRef.current
      if (!container) return []
      return Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.getClientRects().length > 0)
    }

    // Fokus awal. requestAnimationFrame: tunggu dialog benar-benar
    // ter-mount dan terlihat (animasi masuk) — fokus ke elemen yang
    // belum tampil bisa gagal diam-diam.
    const focusFrame = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return
      if (container.contains(document.activeElement)) return
      const target =
        initialFocusRef?.current ?? getFocusableElements()[0] ?? container
      if (target === container && !container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1')
      }
      target.focus()
    })

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault()
        onCloseRef.current()
        return
      }
      if (keyboardEvent.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const container = containerRef.current
      if (!container) return
      if (focusableElements.length === 0) {
        keyboardEvent.preventDefault()
        container.focus()
        return
      }
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (!container.contains(activeElement)) {
        keyboardEvent.preventDefault()
        firstElement.focus()
      } else if (keyboardEvent.shiftKey && activeElement === firstElement) {
        keyboardEvent.preventDefault()
        lastElement.focus()
      } else if (!keyboardEvent.shiftKey && activeElement === lastElement) {
        keyboardEvent.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      // Kembalikan fokus ke pemicu, kalau elemennya masih ada di halaman.
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen, containerRef, initialFocusRef])
}
