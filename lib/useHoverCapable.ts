import { useEffect, useState } from 'react'

/**
 * Mendeteksi apakah perangkat pengunjung benar-benar mendukung hover
 * (mouse/trackpad) atau tidak (touchscreen).
 *
 * Kenapa ini perlu: perangkat sentuh menembak event mouseenter/mouseleave
 * dengan cara yang aneh dan tidak konsisten (biasanya cuma sekali, saat
 * disentuh, lalu tidak pernah lagi sampai user menyentuh elemen lain).
 * Kalau fitur hover-preview (bubble preview di project/certificate card)
 * tidak digerbangi lewat hook ini, hasilnya adalah "ghost hover" — bubble
 * yang muncul saat disentuh lalu tidak pernah hilang di HP.
 *
 * @returns true kalau perangkat mendukung hover asli, false kalau tidak
 * (mis. touchscreen) atau saat masih di server-render (sebelum useEffect
 * jalan di client).
 */
export function useHoverCapable(): boolean {
  const [supportsHover, setSupportsHover] = useState(false)

  useEffect(() => {
    const hoverMediaQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    )
    setSupportsHover(hoverMediaQuery.matches)

    function handleMediaQueryChange(mediaQueryChangeEvent: MediaQueryListEvent) {
      setSupportsHover(mediaQueryChangeEvent.matches)
    }

    hoverMediaQuery.addEventListener('change', handleMediaQueryChange)
    return () =>
      hoverMediaQuery.removeEventListener('change', handleMediaQueryChange)
  }, [])

  return supportsHover
}
