'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle2 } from 'lucide-react'

type SubmissionStatus = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Form kontak publik — submit langsung ke tabel `contact_messages` di
 * Supabase lewat anon key (RLS: insert terbuka untuk publik, baca cuma
 * admin). Punya honeypot field untuk bot sederhana; TIDAK ada CAPTCHA
 * asli (lihat catatan di README soal Cloudflare Turnstile sebagai
 * upgrade kalau spam jadi masalah nyata).
 */
export default function ContactForm() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  // Honeypot — input tersembunyi dari visual (bukan display:none, karena
  // beberapa bot skip field yang display:none; posisi off-screen lebih
  // efektif) yang seharusnya SELALU kosong untuk pengunjung asli. Bot
  // yang auto-fill semua field akan mengisi ini, jadi kalau terisi kita
  // diam-diam tolak tanpa kasih tahu (supaya bot tidak belajar untuk
  // skip field ini spesifik). name="website" dipasang supaya field ini
  // terlihat seperti target umum bagi bot yang scan berdasarkan nama
  // field (banyak bot spesifik cari "website"/"url"/"homepage").
  const [honeypotValue, setHoneypotValue] = useState('')
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleFormSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()

    if (honeypotValue) {
      // Honeypot terisi — kemungkinan besar bot. Pura-pura sukses supaya
      // bot tidak tahu ditolak (tidak ada insentif untuk coba lagi
      // dengan pola berbeda).
      setSubmissionStatus('sent')
      return
    }

    if (message.trim().length < 10) {
      setErrorMessage('Pesan terlalu pendek — minimal 10 karakter.')
      return
    }

    setSubmissionStatus('sending')
    setErrorMessage(null)

    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({ name, email, message })

    if (insertError) {
      setErrorMessage('Gagal mengirim: ' + insertError.message)
      setSubmissionStatus('error')
      return
    }

    setSubmissionStatus('sent')
  }

  if (submissionStatus === 'sent') {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-400" size={32} />
        <p className="text-white/80 font-medium mb-1">Pesan terkirim!</p>
        <p className="text-white/40 text-sm">
          Terima kasih sudah menghubungi — akan dibalas secepatnya.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="glass-card p-6 max-w-md mx-auto space-y-4 text-left"
    >
      {/* Honeypot — off-screen, bukan display:none/hidden (beberapa bot
          skip field yang display:none tapi tetap ngisi yang cuma
          diposisikan di luar layar). tabIndex -1 + aria-hidden supaya
          keyboard/screen-reader user asli juga tidak pernah menyentuhnya. */}
      <input
        type="text"
        name="website"
        id="website"
        value={honeypotValue}
        onChange={(changeEvent) => setHoneypotValue(changeEvent.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
        }}
      />

      <div>
        <label className="block text-sm text-white/50 mb-1">Nama</label>
        <input
          value={name}
          onChange={(changeEvent) => setName(changeEvent.target.value)}
          required
          style={{ backgroundColor: 'var(--surface-fill)' }}
          className="w-full px-4 py-2 rounded-lg border border-white/10 text-white outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(changeEvent) => setEmail(changeEvent.target.value)}
          required
          style={{ backgroundColor: 'var(--surface-fill)' }}
          className="w-full px-4 py-2 rounded-lg border border-white/10 text-white outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">Pesan</label>
        <textarea
          value={message}
          onChange={(changeEvent) => setMessage(changeEvent.target.value)}
          required
          rows={4}
          style={{ backgroundColor: 'var(--surface-fill)' }}
          className="w-full px-4 py-2 rounded-lg border border-white/10 text-white outline-none focus:border-cyan-400"
        />
      </div>

      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

      <button
        type="submit"
        disabled={submissionStatus === 'sending'}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
      >
        <Send size={15} />
        {submissionStatus === 'sending' ? 'Mengirim...' : 'Kirim Pesan'}
      </button>
    </form>
  )
}
