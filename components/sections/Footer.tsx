'use client'

import { ArrowUp } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function Footer({ profile }: { profile: Profile | null }) {
  const year = new Date().getFullYear()

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-white/10 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/30 text-sm font-mono">
          © {year} {profile?.name ?? 'Portfolio'}. All rights reserved.
        </p>
        <button
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/40 hover:text-cyan-400 transition-colors"
        >
          Back to top <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  )
}
