'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Award,
  Briefcase,
  ExternalLink,
  FolderGit2,
  Inbox,
  Menu,
  Sparkles,
  UserCog,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import LogoutButton from '@/components/admin/LogoutButton'
import { useDialogFocus } from '@/lib/a11y/useDialogFocus'

interface NavEntry {
  href: string
  label: string
  icon: LucideIcon
}

/** Urutan = urutan section di situs publik. Indeks "01…07" dihitung otomatis. */
const NAV_ENTRIES: readonly NavEntry[] = [
  { href: '/secret-cmd', label: 'Profile', icon: UserCog },
  { href: '/secret-cmd/about', label: 'About', icon: UserRound },
  { href: '/secret-cmd/timeline', label: 'Timeline', icon: Briefcase },
  { href: '/secret-cmd/skills', label: 'Skills', icon: Sparkles },
  { href: '/secret-cmd/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/secret-cmd/certificates', label: 'Certs', icon: Award },
  { href: '/secret-cmd/messages', label: 'Inbox', icon: Inbox },
]

function isEntryActive(entryHref: string, pathname: string | null): boolean {
  if (!pathname) return false
  // "/secret-cmd" (Profile) hanya aktif di path persis itu — kalau tidak,
  // ia akan menyala di SEMUA sub-halaman.
  if (entryHref === '/secret-cmd') return pathname === '/secret-cmd'
  return pathname === entryHref || pathname.startsWith(entryHref + '/')
}

interface AdminShellProps {
  userEmail: string
  /** Jumlah pesan belum dibaca (dihitung di server; 0 kalau gagal). */
  unreadCount: number
  children: React.ReactNode
}

/** Isi sidebar — dipakai persis sama oleh sidebar desktop dan drawer mobile. */
function SidebarContent({
  pathname,
  userEmail,
  unreadCount,
  onNavigate,
}: {
  pathname: string | null
  userEmail: string
  unreadCount: number
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="border-b border-adm-line/15 px-5 py-5">
        <p className="adm-mono text-[0.95rem] font-semibold tracking-[0.18em] text-adm-text">
          [ ADMIN_CORE ]
        </p>
        <p className="adm-mono mt-2 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-adm-green">
          <span aria-hidden="true" className="adm-dot" data-pulse="true" style={{ ['--tag' as string]: 'var(--adm-green)' }} />
          SYS_ONLINE
        </p>
      </div>

      <nav aria-label="Navigasi admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1.5">
          {NAV_ENTRIES.map((entry, entryIndex) => {
            const isActive = isEntryActive(entry.href, pathname)
            const EntryIcon = entry.icon
            const showUnread = entry.href.endsWith('/messages') && unreadCount > 0
            return (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className="adm-nav-item"
                >
                  <span className="adm-nav-index" aria-hidden="true">
                    {String(entryIndex + 1).padStart(2, '0')}
                  </span>
                  <EntryIcon size={16} aria-hidden="true" />
                  <span className="flex-1">{entry.label}</span>
                  {showUnread && (
                    <span className="adm-tag" aria-label={`${unreadCount} pesan belum dibaca`}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-adm-line/15 px-5 py-4">
        <p className="adm-mono truncate text-[0.68rem] tracking-wider text-adm-dim" title={userEmail}>
          USER: <span className="text-adm-muted">{userEmail}</span>
        </p>
        <div className="flex items-center justify-between gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-mono inline-flex min-h-10 items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-adm-muted transition-colors hover:text-adm-cyan"
          >
            <ExternalLink size={13} aria-hidden="true" />
            Lihat situs
            <span className="sr-only"> (tab baru)</span>
          </a>
          <LogoutButton />
        </div>
      </div>
    </>
  )
}

/**
 * Kerangka Admin Console: sidebar HUD tetap di desktop (≥1024px), top
 * bar + drawer di mobile. Menu aktif menyala (border + glow + batang
 * kiri). Drawer mengikuti pola dialog modal penuh: fokus masuk &
 * terkunci, Escape menutup, fokus kembali ke tombol menu.
 */
export default function AdminShell({ userEmail, unreadCount, children }: AdminShellProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useDialogFocus(isDrawerOpen, drawerRef, () => setIsDrawerOpen(false))

  // Tutup drawer saat pindah halaman.
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  // Kunci scroll body selama drawer terbuka.
  useEffect(() => {
    if (!isDrawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isDrawerOpen])

  const activeEntry = NAV_ENTRIES.find((entry) => isEntryActive(entry.href, pathname))

  return (
    <div className="adm-root">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:bg-adm-bg focus:px-4 focus:py-2 focus:text-adm-cyan"
      >
        Lewati ke konten
      </a>

      {/* Sidebar desktop */}
      <aside className="adm-sidebar" aria-label="Admin">
        <SidebarContent pathname={pathname} userEmail={userEmail} unreadCount={unreadCount} />
      </aside>

      {/* Top bar mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-adm-line/15 bg-adm-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="adm-mono text-sm font-semibold tracking-[0.16em]">[ ADMIN_CORE ]</p>
          {activeEntry && (
            <p className="adm-mono text-[0.62rem] uppercase tracking-[0.18em] text-adm-cyan">
              ▸ {activeEntry.label}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Buka menu admin"
          aria-haspopup="dialog"
          aria-expanded={isDrawerOpen}
          className="adm-iconbtn"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
      </header>

      {/* Drawer mobile */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label="Tutup menu admin"
              tabIndex={-1}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/70"
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu admin"
              tabIndex={-1}
              initial={prefersReducedMotion ? false : { x: '-100%' }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 flex w-[min(18rem,86vw)] flex-col border-r border-adm-line/20 bg-adm-bg text-adm-text focus:outline-none"
            >
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Tutup menu admin"
                className="adm-iconbtn absolute right-3 top-3 z-10"
              >
                <X size={16} aria-hidden="true" />
              </button>
              <SidebarContent
                pathname={pathname}
                userEmail={userEmail}
                unreadCount={unreadCount}
                onNavigate={() => setIsDrawerOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        id="admin-main"
        tabIndex={-1}
        className="adm-content mx-auto max-w-5xl px-4 py-8 focus:outline-none sm:px-6 lg:max-w-6xl lg:px-10 lg:py-12"
      >
        {children}
      </main>
    </div>
  )
}
