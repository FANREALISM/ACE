'use client'

import { Github, Linkedin, Mail } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export default function Contact({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage()
  return (
    <section id="contact" className="py-24 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8">
        {t.contact.heading} <span className="text-gradient">{t.contact.headingAccent}</span>
      </h2>
      <div className="flex justify-center gap-6">
        {profile?.github_url && (
          <a
            href={profile.github_url}
            target="_blank"
            rel="noopener noreferrer"
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
            className="glass-card p-4 hover:border-cyan-400/40 transition-colors"
          >
            <Linkedin size={24} />
          </a>
        )}
        {profile?.email && (
          <a
            href={`mailto:${profile.email}`}
            className="glass-card p-4 hover:border-cyan-400/40 transition-colors"
          >
            <Mail size={24} />
          </a>
        )}
      </div>
    </section>
  )
}
