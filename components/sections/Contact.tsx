'use client'

import { useState } from 'react'
import {
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react'
import type { Profile } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import ContactForm from './ContactForm'
import MagneticButton from '@/components/ui/MagneticButton'
import Reveal from '@/components/ui/Reveal'

/**
 * Section kontak — link ikon (WhatsApp/GitHub/LinkedIn/Email) sebagai
 * cara tercepat menghubungi, plus form kontak opsional di belakang
 * toggle untuk pengunjung yang lebih nyaman isi form (mis. workflow
 * ATS recruiter) daripada buka aplikasi eksternal.
 */
export default function Contact({ profile }: { profile: Profile | null }) {
  const { translations } = useLanguage()
  const [isEmailCopied, setIsEmailCopied] = useState(false)
  const [isContactFormVisible, setIsContactFormVisible] = useState(false)

  const whatsappLink = profile?.whatsapp_number
    ? `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}`
    : null

  /** Salin alamat email ke clipboard sebagai alternatif dari klik
   *  langsung mailto: — berguna kalau pengunjung mau paste email-nya di
   *  tempat lain daripada buka aplikasi email. */
  async function handleCopyEmailToClipboard() {
    if (!profile?.email) return
    try {
      await navigator.clipboard.writeText(profile.email)
      setIsEmailCopied(true)
      setTimeout(() => setIsEmailCopied(false), 2000)
    } catch {
      // Clipboard API bisa gagal (mis. context non-HTTPS/insecure, atau
      // izin ditolak browser) — diamkan saja, mailto: masih berfungsi
      // sebagai fallback di tombol sebelahnya.
    }
  }

  const hasAnyContactMethod = Boolean(
    whatsappLink || profile?.github_url || profile?.linkedin_url || profile?.email
  )

  return (
    <section id="contact" aria-labelledby="contact-heading" className="section-y px-6 text-center scroll-mt-20">
      <Reveal>
        <h2 id="contact-heading" className="text-2xl sm:text-3xl font-bold mb-8 md:mb-12">
          {translations.contact.heading}{' '}
          <span className="text-gradient">
            {translations.contact.headingAccent}
          </span>
        </h2>
      </Reveal>
      {/* flex-wrap + gap fluid: 4 ikon (56px) + gap-8 = 320px, lebih lebar
          dari area konten di layar 320px (terukur: ikon pertama terpotong
          di x=-4px dan halaman melebar). Ikon dikecilkan di mobile dan
          boleh turun baris kalau masih tidak muat. */}
      <Reveal delay={0.1} className="flex flex-wrap justify-center gap-4 sm:gap-8">
        {whatsappLink && (
          <MagneticButton strength={8}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="glass-card p-3.5 sm:p-4 hover:border-emerald-400/40 transition-colors block"
            >
              <MessageCircle size={24} />
            </a>
          </MagneticButton>
        )}
        {profile?.github_url && (
          <MagneticButton strength={8}>
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="glass-card p-3.5 sm:p-4 hover:border-cyan-400/40 transition-colors block"
            >
              <Github size={24} />
            </a>
          </MagneticButton>
        )}
        {profile?.linkedin_url && (
          <MagneticButton strength={8}>
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="glass-card p-3.5 sm:p-4 hover:border-cyan-400/40 transition-colors block"
            >
              <Linkedin size={24} />
            </a>
          </MagneticButton>
        )}
        {profile?.email && (
          <div className="relative">
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              title="Email"
              className="glass-card p-3.5 sm:p-4 hover:border-cyan-400/40 transition-colors block"
            >
              <Mail size={24} />
            </a>
            <button
              type="button"
              onClick={handleCopyEmailToClipboard}
              aria-label={
                isEmailCopied ? 'Email tersalin' : 'Salin alamat email'
              }
              title={isEmailCopied ? 'Tersalin!' : 'Salin email'}
              // min-w/h-9 (36px), bukan 44px penuh — ini badge sekunder
              // yang sengaja kecil, menempel di atas link Mail utama yang
              // sudah 56px. WCAG 2.5.5 sendiri punya pengecualian untuk
              // target kecil kalau ada kontrol setara yang lebih besar di
              // halaman yang sama (di sini: tap Mail besar = buka mailto,
              // hasil praktis yang sama buat kebanyakan orang). 36px tetap
              // perbaikan nyata dari 24px sebelumnya, tanpa bikin badge
              // sekunder ini terlihat sebesar target utamanya.
              className="absolute -bottom-2 -right-2 flex items-center justify-center min-w-9 min-h-9 rounded-full bg-black border border-white/20 text-white/50 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
            >
              {isEmailCopied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </Reveal>

      {/* Elemen tersembunyi secara visual, cuma untuk diumumkan screen
          reader saat status copy berubah — tombol copy di atas sudah
          punya aria-label statis, tapi perubahan status (berhasil
          disalin) butuh live region terpisah supaya terdengar tanpa
          user harus fokus ulang ke tombolnya. */}
      <span className="sr-only" role="status" aria-live="polite">
        {isEmailCopied ? 'Alamat email disalin ke clipboard' : ''}
      </span>

      {!hasAnyContactMethod && (
        <p className="text-white/30 text-sm">
          Belum ada kontak diisi — lengkapi lewat Settings di admin panel.
        </p>
      )}

      {/* Form di belakang toggle, bukan langsung tampil — section ini
          sengaja dijaga minimal (lihat catatan "lebih lega" sebelumnya).
          Link ikon tetap cara tercepat untuk yang mau langsung kontak;
          form cuma untuk yang lebih nyaman isi form daripada buka app
          eksternal (mis. workflow ATS recruiter). */}
      {!isContactFormVisible ? (
        <button
          onClick={() => setIsContactFormVisible(true)}
          className="mt-8 inline-flex items-center gap-2 text-sm text-white/40 hover:text-cyan-400 transition-colors"
        >
          <MessageSquare size={14} /> Atau kirim pesan lewat form
        </button>
      ) : (
        <div className="mt-8">
          <ContactForm />
        </div>
      )}
    </section>
  )
}
