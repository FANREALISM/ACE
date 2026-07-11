'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Search,
  User,
  Cpu,
  Layers,
  Award,
  Mail,
  ShieldCheck,
  Languages,
  Sun,
  Moon,
  CornerDownLeft,
  type LucideIcon,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { useTheme } from '@/lib/theme/ThemeProvider'

interface Command {
  id: string
  label: string
  hint?: string
  icon: LucideIcon
  run: () => void
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function CommandPalette() {
  const router = useRouter()
  const { t, toggleLocale, locale } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cmd+K (Mac) / Ctrl+K (Windows/Linux) membuka palette dari mana saja.
  // Dicegah default browser behaviour-nya (biasanya fokus address bar).
  //
  // Ctrl/Cmd+Shift+A langsung lompat ke /secret-cmd tanpa membuka palette
  // dulu — pengganti tombol SYSTEM_ADMIN yang dihapus dari menu publik.
  // "A" dipilih untuk "Admin"; kombinasi Shift+A tidak dipakai browser
  // manapun secara default (beda dari Ctrl+N/T/W yang selalu di-reserve).
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'a'
      ) {
        e.preventDefault()
        setOpen(false)
        router.push('/secret-cmd')
      }
    }
    function handleExternalOpen() {
      setOpen(true)
    }
    window.addEventListener('keydown', handleGlobalKey)
    window.addEventListener('open-command-palette', handleExternalOpen)
    return () => {
      window.removeEventListener('keydown', handleGlobalKey)
      window.removeEventListener('open-command-palette', handleExternalOpen)
    }
  }, [router])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      // Delay kecil supaya fokus terjadi setelah elemen ter-mount, bukan
      // sebelum animasi masuk selesai (kalau tidak, fokus bisa gagal
      // diam-diam di beberapa browser).
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [open])

  const commands: Command[] = useMemo(
    () => [
      {
        id: 'about',
        label: t.nav.startJourney,
        hint: 'Section',
        icon: User,
        run: () => scrollToId('about'),
      },
      {
        id: 'skills',
        label: t.nav.techStack,
        hint: 'Section',
        icon: Cpu,
        run: () => scrollToId('skills'),
      },
      {
        id: 'projects',
        label: t.nav.loadProjects,
        hint: 'Section',
        icon: Layers,
        run: () => scrollToId('projects'),
      },
      {
        id: 'certificates',
        label: t.nav.achievements,
        hint: 'Section',
        icon: Award,
        run: () => scrollToId('certificates'),
      },
      {
        id: 'contact',
        label: t.contact.heading + ' ' + t.contact.headingAccent,
        hint: 'Section',
        icon: Mail,
        run: () => scrollToId('contact'),
      },
      {
        id: 'lang',
        label:
          locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia',
        hint: 'Action',
        icon: Languages,
        run: () => toggleLocale(),
      },
      {
        id: 'theme',
        label:
          theme === 'dark' ? 'Switch to Light theme' : 'Ganti ke Dark theme',
        hint: 'Action',
        icon: theme === 'dark' ? Sun : Moon,
        run: () => toggleTheme(),
      },
      {
        id: 'admin',
        label: t.nav.systemAdmin,
        hint: 'Route',
        icon: ShieldCheck,
        run: () => router.push('/secret-cmd'),
      },
    ],
    [t, locale, toggleLocale, theme, toggleTheme, router]
  )

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setSelected(0)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[selected]
      if (cmd) {
        cmd.run()
        setOpen(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            style={{ backgroundColor: 'var(--panel-bg)' }}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={16} className="text-white/40 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik perintah atau nama section..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
                aria-label="Cari perintah"
              />
              <kbd className="text-[10px] font-mono text-white/30 border border-white/10 rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-sm text-white/30 text-center">
                  Tidak ada hasil.
                </p>
              )}
              {filtered.map((cmd, i) => {
                const Icon = cmd.icon
                const active = i === selected
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.run()
                      setOpen(false)
                    }}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-300'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="flex-1">{cmd.label}</span>
                    {cmd.hint && (
                      <span className="text-[10px] font-mono uppercase text-white/25">
                        {cmd.hint}
                      </span>
                    )}
                    {active && <CornerDownLeft size={13} className="text-cyan-400/60" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
