'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { useDialogFocus } from '@/lib/a11y/useDialogFocus'
import { TUTORIAL_CHROME } from '@/lib/tutorial/steps'
import { useTutorial } from '@/lib/tutorial/useTutorial'

/**
 * Overlay tutorial kustom (tanpa library): spotlight + dialog melayang.
 *
 * Tampilan Terminal vs Game HUD TIDAK ditentukan lewat ternary React,
 * melainkan CSS dari atribut <html data-ui>: varian Tailwind `terminal:` /
 * `game:`, kelas `glass-card` / `hud-chip` (sudah berubah bentuk sendiri
 * di Game HUD) dan `.tut-*` di globals.css. Yang berbeda per UI hanyalah
 * ISI langkah (lib/tutorial/steps.ts).
 */
export default function TutorialOverlay() {
  const { isActive } = useTutorial()
  // Lapisan dalam hanya di-mount saat aktif → tidak pernah dirender di
  // server, jadi aman memakai useLayoutEffect dan API browser.
  return isActive ? <TutorialLayer /> : null
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

interface DialogPosition {
  top: number
  left: number
}

const SPOT_PADDING = 8
const EDGE = 12
const GAP = 14

function isRenderable(element: HTMLElement): boolean {
  if (element.getClientRects().length === 0) return false
  const style = window.getComputedStyle(element)
  // `visibility` diwariskan: navbar yang belum muncul (`invisible`) ikut terdeteksi.
  return style.visibility !== 'hidden' && style.display !== 'none'
}

function findTarget(name?: string): HTMLElement | null {
  if (!name) return null
  const candidates = document.querySelectorAll<HTMLElement>(`[data-tutorial="${name}"]`)
  for (const candidate of Array.from(candidates)) {
    if (isRenderable(candidate)) return candidate
  }
  return null
}

function isFixedPositioned(element: HTMLElement | null): boolean {
  let node: HTMLElement | null = element
  while (node && node !== document.body) {
    if (window.getComputedStyle(node).position === 'fixed') return true
    node = node.parentElement
  }
  return false
}

function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

/** Efek mengetik. Teks penuh tetap menempati ruang (bagian yang belum
 *  muncul `invisible`), jadi tinggi dialog stabil dan tidak melompat. */
function useTypewriter(text: string, enabled: boolean): number {
  const [count, setCount] = useState(enabled ? 0 : text.length)
  useEffect(() => {
    if (!enabled) {
      setCount(text.length)
      return
    }
    setCount(0)
    let revealed = 0
    const timer = window.setInterval(() => {
      revealed += 2
      setCount(Math.min(revealed, text.length))
      if (revealed >= text.length) window.clearInterval(timer)
    }, 24)
    return () => window.clearInterval(timer)
  }, [text, enabled])
  return count
}

function TutorialLayer() {
  const { steps, stepIndex, next, back, skip, finish } = useTutorial()
  const { locale } = useLanguage()
  const prefersReducedMotion = useReducedMotion()
  const chrome = TUTORIAL_CHROME[locale]

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const text = step.text[locale]

  const dialogRef = useRef<HTMLDivElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const bodyId = useId()

  const [rect, setRect] = useState<Rect | null>(null)
  const [position, setPosition] = useState<DialogPosition | null>(null)
  const [liveMessage, setLiveMessage] = useState('')
  // Naik setiap kali viewport berubah, supaya dialog tanpa target (posisi
  // di tengah layar) ikut dihitung ulang saat layar diputar / di-resize.
  const [viewportTick, setViewportTick] = useState(0)
  // Animasi geser dialog baru dinyalakan SETELAH posisi pertama terpasang,
  // supaya dialog tidak "meluncur" dari pojok kiri atas saat pertama muncul.
  const [canAnimate, setCanAnimate] = useState(false)
  useEffect(() => {
    function handleResize() {
      setViewportTick((tick) => tick + 1)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Fokus terkunci di dialog, Escape = lewati, fokus kembali ke pemicu.
  useDialogFocus(true, dialogRef, skip, { initialFocusRef: nextButtonRef })

  // Posisi scroll awal: dikembalikan saat tutorial ditutup, supaya
  // pengunjung tidak "terlempar" ke bagian lain halaman.
  useEffect(() => {
    const initialScrollY = window.scrollY
    return () => {
      if (Math.abs(window.scrollY - initialScrollY) > 8) {
        window.scrollTo({ top: initialScrollY, behavior: 'instant' as ScrollBehavior })
      }
    }
  }, [])

  // Ganti langkah: bawa target ke layar, lalu ukur terus (scroll, resize,
  // perubahan ukuran, dan pengecekan berkala sebagai jaring pengaman —
  // gambar yang baru dimuat atau animasi muncul bisa menggeser target).
  useEffect(() => {
    const target = findTarget(step.target)
    if (target && !isFixedPositioned(target)) {
      const box = target.getBoundingClientRect()
      const tooHigh = box.top < 80
      const tooLow = box.bottom > window.innerHeight - 16
      if (tooHigh || tooLow) {
        // 'instant': scroll halus membuat spotlight/dialog mengejar target
        // yang bergerak (dan lompat posisi). Lompatan satu kali lebih stabil.
        window.scrollTo({
          top: window.scrollY + box.top - 88,
          behavior: 'instant' as ScrollBehavior,
        })
      }
    }

    function measure() {
      const element = findTarget(step.target)
      if (!element) {
        setRect((previous) => (previous === null ? previous : null))
        return
      }
      const box = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      if (box.bottom < 0 || box.top > viewportHeight) {
        setRect((previous) => (previous === null ? previous : null))
        return
      }
      const top = Math.max(box.top - SPOT_PADDING, 6)
      const left = Math.max(box.left - SPOT_PADDING, 6)
      const bottom = Math.min(box.bottom + SPOT_PADDING, viewportHeight - 6)
      const right = Math.min(box.right + SPOT_PADDING, viewportWidth - 6)
      const next: Rect = { top, left, width: Math.max(right - left, 4), height: Math.max(bottom - top, 4) }
      setRect((previous) => (sameRect(previous, next) ? previous : next))
    }

    measure()
    let frame = 0
    function onViewportChange() {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        measure()
      })
    }
    window.addEventListener('scroll', onViewportChange, { passive: true })
    window.addEventListener('resize', onViewportChange, { passive: true })
    const interval = window.setInterval(measure, 400)
    const settle = window.setTimeout(measure, 120)
    return () => {
      window.removeEventListener('scroll', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
      window.clearInterval(interval)
      window.clearTimeout(settle)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [step.target, stepIndex])

  // Posisi dialog: dekat target (bawah → atas → dilekatkan ke tepi layar);
  // di layar kecil selalu dilekatkan ke tepi atas/bawah, menjauhi target.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const width = dialog.offsetWidth
    const height = dialog.offsetHeight
    let top: number
    let left: number

    if (!rect) {
      top = (viewportHeight - height) / 2
      left = (viewportWidth - width) / 2
    } else if (viewportWidth < 640) {
      left = (viewportWidth - width) / 2
      const targetCenter = rect.top + rect.height / 2
      top = targetCenter > viewportHeight / 2 ? EDGE : viewportHeight - height - EDGE
    } else {
      const below = rect.top + rect.height + GAP
      const above = rect.top - GAP - height
      if (below + height <= viewportHeight - EDGE) top = below
      else if (above >= EDGE) top = above
      else top = rect.top + rect.height / 2 > viewportHeight / 2 ? EDGE : viewportHeight - height - EDGE
      left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, EDGE), viewportWidth - width - EDGE)
    }
    top = Math.max(top, EDGE)
    setPosition((previous) =>
      previous && Math.abs(previous.top - top) < 0.5 && Math.abs(previous.left - left) < 0.5
        ? previous
        : { top, left },
    )
    const frame = window.requestAnimationFrame(() => setCanAnimate(true))
    return () => window.cancelAnimationFrame(frame)
  }, [rect, stepIndex, locale, viewportTick])

  // Pembaca layar: fokus tetap di tombol, jadi isi langkah baru diumumkan
  // lewat live region (bukan saat pertama dibuka — dialog sudah dibacakan
  // lewat aria-labelledby/-describedby).
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setLiveMessage(`${chrome.stepOf(stepIndex + 1, steps.length)}. ${text.title}. ${text.body}`)
  }, [stepIndex, text.title, text.body, chrome, steps.length])

  const typedCount = useTypewriter(text.body, !prefersReducedMotion)
  const typedBody = text.body.slice(0, typedCount)
  const pendingBody = text.body.slice(typedCount)

  const progressFilled = stepIndex + 1
  const progressTotal = steps.length
  const asciiProgress = `${'█'.repeat(progressFilled)}${'░'.repeat(progressTotal - progressFilled)}`
  const stepLabel = `${String(progressFilled).padStart(2, '0')}/${String(progressTotal).padStart(2, '0')}`

  return (
    <>
      {/* Penangkap klik: halaman di belakang tidak bisa terpencet tak sengaja. */}
      <div className="fixed inset-0 z-[9999]" aria-hidden="true" />

      {rect ? (
        <div
          aria-hidden="true"
          className="tut-spot"
          // transform (bukan top/left): berpindah posisi lewat compositor,
          // tidak dihitung sebagai layout shift (CLS) oleh browser.
          style={{
            transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
            width: rect.width,
            height: rect.height,
          }}
        />
      ) : (
        <div aria-hidden="true" className="tut-dim" />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className={`tut-dialog glass-card terminal:bg-[color:var(--panel-bg)] rounded-md fixed z-[10001] w-[min(92vw,26rem)] px-5 pt-4 pb-7 text-white/80 shadow-2xl ${canAnimate ? 'tut-dialog-glide' : ''}`}
        style={{
          top: 0,
          left: 0,
          // transform, bukan top/left → bukan layout shift (CLS).
          transform: `translate3d(${position?.left ?? 0}px, ${position?.top ?? 0}px, 0)`,
          visibility: position ? 'visible' : 'hidden',
        }}
      >
        {/* Kepala: gaya prompt shell (Terminal) atau transmisi AI (Game HUD). */}
        <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-white/60">
          <span className="hidden terminal:inline truncate">user@portfolio:~$ guide --step {stepLabel}</span>
          <span className="hidden game:inline-flex items-center gap-2 truncate text-[color:var(--tut-accent)]">
            <span aria-hidden="true" className="tut-ai-dot" />
            NAV-AI // CH.{stepLabel}
          </span>
          <span className="sr-only">{chrome.stepOf(progressFilled, progressTotal)}</span>
          <span aria-hidden="true" className="hidden terminal:inline tracking-normal text-cyan-300">
            [{asciiProgress}]
          </span>
          <span aria-hidden="true" className="hidden game:flex gap-1">
            {steps.map((progressStep, index) => (
              <i
                key={progressStep.id}
                className={`block h-2 w-3 ${index < progressFilled ? 'bg-[color:var(--tut-accent)]' : 'bg-white/20'}`}
                style={{ clipPath: 'polygon(25% 0, 100% 0, 75% 100%, 0 100%)' }}
              />
            ))}
          </span>
        </div>

        <div key={step.id} className="tut-step-in">
          <h2
            id={titleId}
            className="mb-2 font-mono text-base font-bold uppercase tracking-wider text-cyan-300 game:text-[color:var(--tut-accent)] sm:text-lg"
          >
            <span aria-hidden="true" className="hidden terminal:inline text-white/40">{'> '}</span>
            {text.title}
          </h2>
          <p className="text-sm leading-relaxed">
            <span className="sr-only" id={bodyId}>{text.body}</span>
            <span aria-hidden="true">
              {typedBody}
              <span className="invisible">{pendingBody}</span>
            </span>
            <span aria-hidden="true" className="tut-caret hidden terminal:inline text-cyan-300">▌</span>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          {isLast ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={skip}
              className="hud-chip min-h-11 rounded-md px-3 font-mono text-xs uppercase tracking-wider text-white/60 hover:text-white"
            >
              [ {chrome.skip} ]
            </button>
          )}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={back}
                className="hud-chip min-h-11 rounded-md border border-white/20 px-3 font-mono text-xs uppercase tracking-wider text-white/80 hover:text-white"
              >
                [ {chrome.back} ]
              </button>
            )}
            <button
              ref={nextButtonRef}
              type="button"
              onClick={isLast ? finish : next}
              className="tut-primary hud-chip min-h-11 rounded-md border px-4 font-mono text-xs font-bold uppercase tracking-wider"
            >
              [ {isLast ? chrome.finish : chrome.next} ]
            </button>
          </div>
        </div>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </div>
    </>
  )
}
