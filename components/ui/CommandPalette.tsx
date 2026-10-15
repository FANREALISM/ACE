'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Search,
  User,
  Cpu,
  Layers,
  Milestone,
  Award,
  Mail,
  ShieldCheck,
  Languages,
  Sun,
  Moon,
  Palette,
  CornerDownLeft,
  type LucideIcon,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { useBackground } from '@/lib/background/useBackground'
import { BACKGROUND_LABELS } from '@/components/ui/BackgroundSwitcher'

/** Satu entri command di palette — section untuk lompat ke bagian
 *  halaman, action untuk toggle bahasa/tema, route untuk navigasi. */
interface Command {
  id: string
  label: string
  hint?: string
  icon: LucideIcon
  run: () => void
}

/** Scroll halus ke elemen dengan id tertentu — dipakai semua command
 *  bertipe "Section" (About, Skills, Projects, dst). */
function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
}

/**
 * Command palette gaya VS Code (Ctrl/Cmd+K) — navigasi cepat ke section
 * manapun, toggle bahasa/tema, atau lompat ke admin panel, semua lewat
 * keyboard. Dipasang sekali secara global di layout.tsx.
 */
export default function CommandPalette() {
  const router = useRouter()
  const { translations, toggleLocale, locale } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { mode: backgroundMode, cycleMode: cycleBackground } = useBackground()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cmd+K (Mac) / Ctrl+K (Windows/Linux) membuka palette dari mana saja.
  // Dicegah default browser behaviour-nya (biasanya fokus address bar).
  //
  // Ctrl/Cmd+Shift+A langsung lompat ke /secret-cmd tanpa membuka palette
  // dulu — pengganti tombol SYSTEM_ADMIN yang dihapus dari menu publik.
  // "A" dipilih untuk "Admin"; kombinasi Shift+A tidak dipakai browser
  // manapun secara default (beda dari Ctrl+N/T/W yang selalu di-reserve).
  useEffect(() => {
    function handleGlobalKeyDown(keyboardEvent: KeyboardEvent) {
      const isCmdOrCtrl = keyboardEvent.metaKey || keyboardEvent.ctrlKey

      if (isCmdOrCtrl && keyboardEvent.key.toLowerCase() === 'k') {
        keyboardEvent.preventDefault()
        setIsOpen((currentlyOpen) => !currentlyOpen)
      } else if (
        isCmdOrCtrl &&
        keyboardEvent.shiftKey &&
        keyboardEvent.key.toLowerCase() === 'a'
      ) {
        keyboardEvent.preventDefault()
        setIsOpen(false)
        router.push('/secret-cmd')
      }
    }

    function handleExternalOpenRequest() {
      setIsOpen(true)
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    window.addEventListener('open-command-palette', handleExternalOpenRequest)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
      window.removeEventListener(
        'open-command-palette',
        handleExternalOpenRequest
      )
    }
  }, [router])

  // Reset pencarian & fokus input setiap kali palette dibuka; kunci
  // scroll body supaya konten di belakang tidak ikut scroll.
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedIndex(0)
      // Delay kecil supaya fokus terjadi setelah elemen ter-mount, bukan
      // sebelum animasi masuk selesai (kalau tidak, fokus bisa gagal
      // diam-diam di beberapa browser).
      setTimeout(() => searchInputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Daftar semua command yang tersedia. useMemo supaya array ini tidak
  // dibuat ulang tiap render — cuma berubah kalau salah satu dependency
  // (bahasa, tema, dst) benar-benar berubah.
  const commands: Command[] = useMemo(
    () => [
      {
        id: 'about',
        label: translations.nav.startJourney,
        hint: 'Section',
        icon: User,
        run: () => scrollToSection('about'),
      },
      {
        id: 'timeline',
        label: translations.nav.timeline,
        hint: 'Section',
        icon: Milestone,
        run: () => scrollToSection('timeline'),
      },
      {
        id: 'skills',
        label: translations.nav.techStack,
        hint: 'Section',
        icon: Cpu,
        run: () => scrollToSection('skills'),
      },
      {
        id: 'projects',
        label: translations.nav.loadProjects,
        hint: 'Section',
        icon: Layers,
        run: () => scrollToSection('projects'),
      },
      {
        id: 'certificates',
        label: translations.nav.achievements,
        hint: 'Section',
        icon: Award,
        run: () => scrollToSection('certificates'),
      },
      {
        id: 'contact',
        label:
          translations.contact.heading + ' ' + translations.contact.headingAccent,
        hint: 'Section',
        icon: Mail,
        run: () => scrollToSection('contact'),
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
        id: 'background',
        label: backgroundMode
          ? `Background: ${BACKGROUND_LABELS[backgroundMode].label} (ganti)`
          : 'Background: ganti mode',
        hint: 'Action',
        icon: Palette,
        run: () => cycleBackground(),
      },
      {
        id: 'admin',
        label: translations.nav.systemAdmin,
        hint: 'Route',
        icon: ShieldCheck,
        run: () => router.push('/secret-cmd'),
      },
    ],
    [
      translations,
      locale,
      toggleLocale,
      theme,
      toggleTheme,
      backgroundMode,
      cycleBackground,
      router,
    ]
  )

  // Filter command berdasarkan apa yang diketik user — substring match
  // sederhana pada label, tidak case-sensitive.
  const filteredCommands = commands.filter((command) =>
    command.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset highlight ke item pertama setiap kali hasil pencarian berubah
  // (kalau tidak, highlight bisa "nyangkut" di index yang sudah tidak
  // valid setelah filter mengecilkan daftar).
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  /** Navigasi keyboard di dalam palette: panah atas/bawah untuk pindah
   *  highlight, Enter untuk eksekusi command yang di-highlight, Escape
   *  untuk tutup. */
  function handleSearchKeyDown(keyboardEvent: React.KeyboardEvent) {
    if (keyboardEvent.key === 'Escape') {
      setIsOpen(false)
    } else if (keyboardEvent.key === 'ArrowDown') {
      keyboardEvent.preventDefault()
      setSelectedIndex((currentIndex) =>
        Math.min(currentIndex + 1, filteredCommands.length - 1)
      )
    } else if (keyboardEvent.key === 'ArrowUp') {
      keyboardEvent.preventDefault()
      setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0))
    } else if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault()
      const highlightedCommand = filteredCommands[selectedIndex]
      if (highlightedCommand) {
        highlightedCommand.run()
        setIsOpen(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            style={{ backgroundColor: 'var(--panel-bg)' }}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={16} className="text-white/40 shrink-0" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(changeEvent) => setSearchQuery(changeEvent.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Ketik perintah atau nama section..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
                aria-label="Cari perintah"
              />
              <kbd className="text-[10px] font-mono text-white/30 border border-white/10 rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto py-2">
              {filteredCommands.length === 0 && (
                <p className="px-4 py-6 text-sm text-white/30 text-center">
                  Tidak ada hasil.
                </p>
              )}
              {filteredCommands.map((command, index) => {
                const CommandIcon = command.icon
                const isHighlighted = index === selectedIndex
                return (
                  <button
                    key={command.id}
                    onClick={() => {
                      command.run()
                      setIsOpen(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      isHighlighted
                        ? 'bg-cyan-500/10 text-cyan-300'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <CommandIcon size={15} />
                    <span className="flex-1">{command.label}</span>
                    {command.hint && (
                      <span className="text-[10px] font-mono uppercase text-white/25">
                        {command.hint}
                      </span>
                    )}
                    {isHighlighted && (
                      <CornerDownLeft size={13} className="text-cyan-400/60" />
                    )}
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
