'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Search, X } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { menuItems, type MenuItem } from '@/lib/menuItems'
import type { Dictionary } from '@/lib/i18n/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import ThemeToggle from '@/components/ui/ThemeToggle'

/** Peta key menu (gaya terminal, dipakai di Hero) → label navbar bahasa
 *  biasa. Item yang tidak terdaftar di sini jatuh ke label menu aslinya. */
const NAVBAR_LABEL_KEY: Partial<
  Record<MenuItem['key'], keyof Dictionary['navbar']>
> = {
  startJourney: 'about',
  timeline: 'timeline',
  techStack: 'skills',
  loadProjects: 'projects',
  achievements: 'certificates',
  contact: 'contact',
}

/** Navbar muncul setelah pengunjung melewati sekitar 80% tinggi layar —
 *  sebelum itu menu besar di Hero sudah jadi navigasinya, dan dua menu
 *  sekaligus di layar yang sama hanya menambah kebisingan. */
const SHOW_AFTER_VIEWPORT_RATIO = 0.8

function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('open-command-palette'))
}

/**
 * Navbar pil melayang: nama di kiri, link section di tengah (yang sedang
 * dibaca ikut menyala), aksi cepat di kanan. Di layar kecil, link pindah
 * ke dropdown yang dibuka tombol menu.
 *
 * - Saat belum muncul, navbar `invisible` — tidak bisa difokus keyboard
 *   atau diklik secara tidak sengaja (versi lama hanya transparan).
 * - Semua `<a href="#…">` asli, jadi tetap bisa dirayapi dan dipakai tanpa
 *   JavaScript untuk berpindah section.
 */
export default function MorphingNavbar({
  profile,
}: {
  profile: Profile | null
}) {
  const { translations } = useLanguage()
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const baseId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const [isVisible, setIsVisible] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeHref, setActiveHref] = useState<string | null>(null)

  const menuPanelId = `${baseId}-menu`
  const t = translations.navbar

  function labelFor(menuItem: MenuItem): string {
    const plainKey = NAVBAR_LABEL_KEY[menuItem.key]
    return plainKey ? t[plainKey] : translations.nav[menuItem.key]
  }

  // Muncul/hilang berdasarkan scroll. Tinggi layar dibaca saat event (bukan
  // sekali di render) supaya benar setelah rotasi layar / resize. Di bagian
  // paling bawah halaman, section terakhir (Kontak) sering terlalu pendek
  // untuk menyentuh garis deteksi, jadi dipaksa aktif di sana.
  useMotionValueEvent(scrollY, 'change', (latestScroll) => {
    const shouldShow = latestScroll > window.innerHeight * SHOW_AFTER_VIEWPORT_RATIO
    setIsVisible(shouldShow)
    if (!shouldShow) setIsMenuOpen(false)

    const isAtPageBottom =
      window.innerHeight + latestScroll >= document.documentElement.scrollHeight - 4
    if (isAtPageBottom) {
      const lastAnchor = [...menuItems]
        .reverse()
        .find(
          (menuItem) =>
            menuItem.isAnchor && document.querySelector(menuItem.href)
        )
      if (lastAnchor) setActiveHref(lastAnchor.href)
    }
  })

  // Scrollspy: section yang melewati garis ±35% dari atas layar jadi aktif.
  useEffect(() => {
    const sectionElements = menuItems
      .filter((menuItem) => menuItem.isAnchor)
      .map((menuItem) => ({
        href: menuItem.href,
        element: document.querySelector(menuItem.href),
      }))
      .filter(
        (entry): entry is { href: string; element: Element } =>
          entry.element !== null
      )
    if (sectionElements.length === 0) return

    const observer = new IntersectionObserver(
      (observedEntries) => {
        for (const observedEntry of observedEntries) {
          if (!observedEntry.isIntersecting) continue
          const match = sectionElements.find(
            (entry) => entry.element === observedEntry.target
          )
          if (match) setActiveHref(match.href)
        }
      },
      { rootMargin: '-35% 0px -60% 0px' }
    )
    sectionElements.forEach((entry) => observer.observe(entry.element))
    return () => observer.disconnect()
  }, [])

  // Dropdown: tutup saat klik di luar atau tekan Escape (fokus kembali ke
  // tombol menu).
  useEffect(() => {
    if (!isMenuOpen) return
    function handlePointerDown(pointerEvent: PointerEvent) {
      if (!containerRef.current?.contains(pointerEvent.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  function renderLink(menuItem: MenuItem, className: string, children: React.ReactNode) {
    const commonProps = {
      className,
      onClick: () => setIsMenuOpen(false),
      'aria-current': activeHref === menuItem.href ? ('true' as const) : undefined,
    }
    return menuItem.isAnchor ? (
      <a key={menuItem.key} href={menuItem.href} {...commonProps}>
        {children}
      </a>
    ) : (
      <Link key={menuItem.key} href={menuItem.href} {...commonProps}>
        {children}
      </Link>
    )
  }

  const pillTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 34 }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-[transform,opacity,visibility] duration-300 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 visible'
          : '-translate-y-4 opacity-0 invisible pointer-events-none'
      }`}
      style={{
        // max(): jaga jarak minimum dari tepi, tapi tetap menghormati notch
        // / Dynamic Island (terutama saat landscape).
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div ref={containerRef} className="relative w-full max-w-5xl">
        <nav
          aria-label={t.mainNav}
          className="flex items-center justify-between gap-2 rounded-full border pl-2.5 pr-1.5 py-1 backdrop-blur-xl shadow-lg"
          style={{
            backgroundColor: 'var(--nav-fill)',
            borderColor: 'var(--surface-border)',
          }}
        >
          {/* Merek: avatar + nama, klik = kembali ke atas. */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label={`${profile?.name ?? 'AFFAN RABBANI'} — ${t.backToTop}`}
            className="flex items-center gap-2.5 min-h-11 pr-3 rounded-full min-w-0 text-white/90 hover:text-cyan-300 transition-colors"
          >
            {profile?.avatar_url && (
              <Image
                src={profile.avatar_url}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                className="w-7 h-7 rounded-full object-cover border border-white/15 shrink-0"
              />
            )}
            <span className="font-mono font-bold text-xs uppercase tracking-widest truncate max-w-[9.5rem] sm:max-w-[14rem]">
              {profile?.name ?? 'AFFAN RABBANI'}
            </span>
          </button>

          {/* Link desktop. Indikator aktif = pil yang bergeser antar link. */}
          <ul className="hidden lg:flex items-center gap-0.5">
            {menuItems.map((menuItem) => {
              const isActive = activeHref === menuItem.href
              return (
                <li key={menuItem.key}>
                  {renderLink(
                    menuItem,
                    `relative flex items-center min-h-11 px-3.5 rounded-full font-mono text-xs uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'text-cyan-300'
                        : 'text-white/60 hover:text-cyan-300'
                    }`,
                    <>
                      {isActive && (
                        <motion.span
                          layoutId={`${baseId}-active-pill`}
                          aria-hidden="true"
                          transition={pillTransition}
                          className="absolute inset-0 rounded-full border border-cyan-400/30 bg-cyan-500/10"
                        />
                      )}
                      <span className="relative">{labelFor(menuItem)}</span>
                    </>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label={t.search}
              title={`${t.search} (Ctrl/Cmd + K)`}
              className="flex items-center justify-center min-w-11 min-h-11 rounded-full text-white/60 hover:text-cyan-300 transition-colors"
            >
              <Search size={16} aria-hidden="true" />
            </button>
            <div className="hidden lg:flex items-center gap-1.5">
              <LanguageSwitcher variant="compact" />
              <ThemeToggle variant="compact" />
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((previous) => !previous)}
              aria-expanded={isMenuOpen}
              aria-controls={menuPanelId}
              aria-label={isMenuOpen ? t.closeMenu : t.openMenu}
              className="lg:hidden flex items-center justify-center min-w-11 min-h-11 rounded-full border border-white/15 text-white/70 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors"
            >
              {isMenuOpen ? (
                <X size={18} aria-hidden="true" />
              ) : (
                <Menu size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* Dropdown layar kecil — baris besar yang mudah diketuk, plus
            bahasa & tema di bawahnya. */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id={menuPanelId}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
              className="lg:hidden absolute inset-x-0 top-full mt-2 rounded-3xl border p-2 shadow-2xl backdrop-blur-xl origin-top"
              style={{
                backgroundColor: 'var(--panel-bg)',
                borderColor: 'var(--surface-border)',
              }}
            >
              <ul>
                {menuItems.map((menuItem, menuIndex) => {
                  const isActive = activeHref === menuItem.href
                  return (
                    <li key={menuItem.key}>
                      {renderLink(
                        menuItem,
                        `flex items-center gap-4 min-h-12 px-4 rounded-2xl font-mono text-sm uppercase tracking-wider transition-colors ${
                          isActive
                            ? 'bg-cyan-500/10 text-cyan-300'
                            : 'text-white/70 hover:bg-white/5 hover:text-cyan-300'
                        }`,
                        <>
                          <span
                            aria-hidden="true"
                            className="text-[11px] tabular-nums text-white/30"
                          >
                            {String(menuIndex + 1).padStart(2, '0')}
                          </span>
                          <span>{labelFor(menuItem)}</span>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center gap-2 mt-2 pt-2 px-2 border-t border-white/10">
                <LanguageSwitcher variant="compact" />
                <ThemeToggle variant="compact" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
