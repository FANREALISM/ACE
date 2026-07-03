import { useEffect, useState } from 'react'

// Touch devices fire mouseenter/mouseleave in weird, inconsistent ways
// (usually once, on tap, then never again until you tap elsewhere).
// Gating hover-preview behind this hook prevents "ghost hover" bubbles
// that appear on tap and never disappear on a phone.
export function useHoverCapable(): boolean {
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setCanHover(mq.matches)
    const listener = (e: MediaQueryListEvent) => setCanHover(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  return canHover
}
