'use client'

import { ArrowUp, Sparkles } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import TutorialReplayButton from '@/components/ui/TutorialReplayButton'

/** Satu entri di strip "Recently added" — project atau certificate yang
 *  baru ditambahkan, diurutkan dari yang terbaru (lihat app/page.tsx
 *  untuk logika penggabungan+pengurutannya). */
export interface ActivityItem {
  type: 'project' | 'certificate'
  title: string
  date: string
}

/**
 * Footer situs — copyright, tombol back-to-top, dan strip aktivitas
 * terbaru opsional (kalau ada data project/certificate yang baru
 * ditambahkan).
 */
export default function Footer({
  profile,
  recentActivity = [],
}: {
  profile: Profile | null
  recentActivity?: ActivityItem[]
}) {
  const { translations } = useLanguage()
  const currentYear = new Date().getFullYear()

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // pb-24: ruang untuk tombol [ BKG ] yang melayang di pojok kanan bawah
  // supaya tidak menutupi tombol "Back to top".
  return (
    <footer className="border-t border-white/10 pt-8 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Sinyal "situs ini masih aktif dikelola" — dari created_at yang
            SUDAH ADA di projects/certificates, bukan kolom baru. Ini
            "baru ditambahkan", bukan "terakhir diupdate" — created_at
            tidak berubah kalau item lama di-edit, jadi label-nya sengaja
            jujur soal itu, bukan mengklaim lebih dari yang sebenarnya
            data ini tunjukkan. */}
        {recentActivity.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-6 text-xs font-mono text-white/40">
            <span className="flex items-center gap-1.5 text-white/30 uppercase tracking-wider shrink-0">
              <Sparkles size={12} aria-hidden="true" /> Recently added:
            </span>
            {recentActivity.map((activityItem, activityIndex) => (
              <span
                key={`${activityItem.type}-${activityItem.title}-${activityIndex}`}
              >
                {activityItem.title}
                {activityIndex < recentActivity.length - 1 && (
                  <span aria-hidden="true" className="text-white/20 ml-2">·</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm font-mono">
            © {currentYear} {profile?.name ?? 'Portfolio'}. All rights
            reserved.
          </p>
          <TutorialReplayButton variant="footer" dataTutorial="replay" />
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/40 hover:text-cyan-400 transition-colors"
          >
            {translations.navbar.backToTop} <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
