'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ContactMessage } from '@/lib/types'
import { Trash2, Mail, MailOpen } from 'lucide-react'

/**
 * Inbox pesan dari contact form publik (components/sections/ContactForm.tsx).
 * Baca/tandai-dibaca/hapus — tidak ada "reply" langsung dari sini,
 * admin balas manual lewat email (link mailto: di tiap pesan).
 */
export default function MessagesAdminPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadMessages() {
    setIsLoading(true)
    setErrorMessage(null)
    const { data: messagesData, error: loadError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (loadError) {
      setErrorMessage('Gagal memuat pesan: ' + loadError.message)
      setIsLoading(false)
      return
    }
    setMessages(messagesData ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleReadStatus(message: ContactMessage) {
    setErrorMessage(null)
    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ is_read: !message.is_read })
      .eq('id', message.id)
    if (updateError) {
      setErrorMessage('Gagal update status: ' + updateError.message)
      return
    }
    loadMessages()
  }

  async function handleDelete(messageId: string) {
    if (!confirm('Yakin hapus pesan ini?')) return
    setErrorMessage(null)
    const { error: deleteError } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId)
    if (deleteError) {
      setErrorMessage('Gagal menghapus pesan: ' + deleteError.message)
      return
    }
    loadMessages()
  }

  const unreadMessageCount = messages.filter(
    (message) => !message.is_read
  ).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Pesan Masuk</h1>
        {unreadMessageCount > 0 && (
          <span className="text-xs font-mono px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
            {unreadMessageCount} belum dibaca
          </span>
        )}
      </div>

      <p className="text-xs text-white/30 mb-6">
        Pesan dari contact form publik. Endpoint insert-nya terbuka untuk
        siapa saja (itu memang tujuannya — form publik) dengan honeypot
        dasar untuk bot sederhana. Kalau mulai kebanjiran spam, pertimbangkan
        nambah CAPTCHA (mis. Cloudflare Turnstile, gratis) — belum
        diimplementasikan di sini.
      </p>

      {errorMessage && (
        <p className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <p className="text-white/40">Memuat...</p>
      ) : messages.length === 0 ? (
        <p className="text-white/40">Belum ada pesan masuk.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`glass-card p-4 ${
                !message.is_read ? 'border-cyan-400/30' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{message.name}</p>
                    {!message.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-cyan-400 hover:underline"
                  >
                    {message.email}
                  </a>
                  <p className="text-sm text-white/60 mt-2 whitespace-pre-line">
                    {message.message}
                  </p>
                  <p className="text-xs text-white/30 mt-2 font-mono">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleReadStatus(message)}
                    aria-label={
                      message.is_read
                        ? 'Tandai belum dibaca'
                        : 'Tandai sudah dibaca'
                    }
                    title={
                      message.is_read
                        ? 'Tandai belum dibaca'
                        : 'Tandai sudah dibaca'
                    }
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                  >
                    {message.is_read ? (
                      <Mail size={16} />
                    ) : (
                      <MailOpen size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    aria-label="Hapus pesan ini"
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
