'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ContactMessage } from '@/lib/types'
import { Mail, MailOpen } from 'lucide-react'
import {
  Alert,
  Btn,
  ConfirmDeleteButton,
  EmptyState,
  IconBtn,
  LoadingState,
  PageHeader,
  StatusTag,
} from '@/components/admin/AdminUI'

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
      <PageHeader
        code="INBOX"
        title="Pesan Masuk"
        description="Pesan dari form kontak publik. Balas lewat email (klik alamatnya). Form dilindungi honeypot sederhana; kalau spam membanjir, pertimbangkan CAPTCHA seperti Cloudflare Turnstile."
        actions={
          unreadMessageCount > 0 && (
            <StatusTag dot pulse>
              {unreadMessageCount} BELUM_DIBACA
            </StatusTag>
          )
        }
      />

      {errorMessage && (
        <div className="mb-6">
          <Alert>{errorMessage}</Alert>
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : messages.length === 0 ? (
        <EmptyState code="INBOX_EMPTY">Belum ada pesan masuk.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => (
            <li
              key={message.id}
              data-unread={!message.is_read ? 'true' : undefined}
              className="adm-card p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-adm-text">{message.name}</h2>
                    <StatusTag tone={message.is_read ? 'muted' : 'cyan'} dot={!message.is_read}>
                      {message.is_read ? 'READ' : 'NEW'}
                    </StatusTag>
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="adm-mono break-all text-xs text-adm-cyan underline-offset-4 hover:underline"
                  >
                    {message.email}
                  </a>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-adm-text/90">
                    {message.message}
                  </p>
                  <p className="adm-mono mt-3 text-[0.68rem] tracking-wider text-adm-dim">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5 self-end sm:self-start">
                  <IconBtn
                    label={message.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                    onClick={() => toggleReadStatus(message)}
                  >
                    {message.is_read ? (
                      <Mail size={15} aria-hidden="true" />
                    ) : (
                      <MailOpen size={15} aria-hidden="true" />
                    )}
                  </IconBtn>
                  <ConfirmDeleteButton
                    itemName={`pesan dari ${message.name}`}
                    onConfirm={() => handleDelete(message.id)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
