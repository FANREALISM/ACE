'use client'

import { useEffect, useRef, useState } from 'react'

export type RevealVariant = 'fade-up' | 'fade-left' | 'fade-right' | 'scale'

const HIDDEN_TRANSFORM: Record<RevealVariant, string> = {
  'fade-up': 'translate3d(0, 24px, 0)',
  'fade-left': 'translate3d(-32px, 0, 0)',
  'fade-right': 'translate3d(32px, 0, 0)',
  scale: 'scale(0.92)',
}

interface RevealProps {
  children: React.ReactNode
  variant?: RevealVariant
  /** Detik. Pakai delay bertingkat (0, 0.1, 0.2…) untuk efek stagger. */
  delay?: number
  duration?: number
  className?: string
}

/** 'idle'   = render awal (server + hydrate): KONTEN TERLIHAT.
 *  'hidden' = elemen di bawah layar, menunggu masuk viewport.
 *  'shown'  = sudah terlihat (dengan transisi). */
type Phase = 'idle' | 'hidden' | 'shown'

/**
 * Animasi "muncul saat di-scroll" yang gagal-aman (fail-safe).
 *
 * Versi sebelumnya memakai Framer Motion `initial` (opacity 0) yang ikut
 * ter-render di HTML server, lalu bergantung penuh pada IntersectionObserver
 * untuk memunculkannya. Di HP lemah (mis. Samsung J7 Pro) dengan
 * background canvas berat, pemicu itu bisa tidak pernah jalan → section
 * tetap kosong selamanya.
 *
 * Sekarang: konten TERLIHAT secara default (juga tanpa JS). Setelah mount,
 * hanya elemen yang benar-benar berada di bawah layar yang disembunyikan,
 * dan ada TIGA pemicu independen untuk memunculkannya — IntersectionObserver,
 * listener scroll/resize, dan pengecekan berkala 1 detik. Salah satunya
 * cukup. Hanya memakai opacity + transform (dikomposit GPU).
 */
export default function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    // Sudah terlihat / sudah terlewati → biarkan tampil apa adanya.
    const initialRect = el.getBoundingClientRect()
    if (initialRect.top < window.innerHeight) return

    setPhase('hidden')

    let done = false
    let observer: IntersectionObserver | null = null
    let interval: number | undefined
    let raf = 0

    const cleanup = () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (interval !== undefined) window.clearInterval(interval)
      if (raf) window.cancelAnimationFrame(raf)
    }

    const show = () => {
      if (done) return
      done = true
      setPhase('shown')
      cleanup()
    }

    const check = () => {
      const rect = el.getBoundingClientRect()
      // Masuk viewport (dengan sedikit margin) ATAU sudah terlewati.
      if (rect.top < window.innerHeight - 40 || rect.bottom <= 0) show()
    }

    function onScroll() {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        check()
      })
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) show()
        },
        { rootMargin: '0px 0px -40px 0px' },
      )
      observer.observe(el)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    interval = window.setInterval(check, 1000)
    check()

    return cleanup
  }, [])

  const style: React.CSSProperties | undefined =
    phase === 'hidden'
      ? { opacity: 0, transform: HIDDEN_TRANSFORM[variant] }
      : phase === 'shown'
        ? {
            opacity: 1,
            transform: 'none',
            transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
          }
        : undefined

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
