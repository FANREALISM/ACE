'use client'

import { useState } from 'react'
import { Github, Linkedin, Mail, MessageCircle, Copy, Check } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export default function Contact({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const whatsappHref = profile?.whatsapp_number
    ? `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}`
    : null

  async function handleCopyEmail() {
    if (!profile?.email) return
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API bisa gagal (mis. context non-HTTPS/insecure, atau
      // izin ditolak browser) — diamkan saja, mailto: masih berfungsi
      // sebagai fallback di tombol sebelahnya.
    }
  }

  return (
    <section id="contact" className="py-32 px-6 text-center scroll-mt-20">
      <h2 className="text-3xl font-bold mb-12">
        {t.contact.heading} <span className="text-gradient">{t.contact.headingAccent}</span>
      </h2>
      <div className="flex justify-center gap-8">
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="WhatsApp"
            className="glass-card p-4 hover:border-emerald-400/40 transition-colors"
          >
            <MessageCircle size={24} />
          </a>
        )}
        {profile?.github_url && (
          <a
            href={profile.github_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="glass-card p-4 hover:border-cyan-400/40 transition-colors"
          >
            <Github size={24} />
          </a>
        )}
        {profile?.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="glass-card p-4 hover:border-cyan-400/40 transition-colors"
          >
            <Linkedin size={24} />
          </a>
        )}
        {profile?.email && (
          <div className="relative">
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              title="Email"
              className="glass-card p-4 hover:border-cyan-400/40 transition-colors block"
            >
              <Mail size={24} />
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              aria-label={copied ? 'Email tersalin' : 'Salin alamat email'}
              title={copied ? 'Tersalin!' : 'Salin email'}
              className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-black border border-white/20 text-white/50 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Alamat email disalin ke clipboard' : ''}
      </span>
      {!whatsappHref && !profile?.github_url && !profile?.linkedin_url && !profile?.email && (
        <p className="text-white/30 text-sm">
          Belum ada kontak diisi — lengkapi lewat Settings di admin panel.
        </p>
      )}
    </section>
  )
}
