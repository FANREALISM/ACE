'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CertificateForm from '@/components/admin/CertificateForm'
import type { Certificate } from '@/lib/types'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function CertificatesAdminPage() {
  const supabase = createClient()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Certificate | null>(null)

  async function loadCertificates() {
    setLoading(true)
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .order('display_order', { ascending: true })
    setCertificates(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadCertificates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(
    data: Omit<Certificate, 'id' | 'created_at'>
  ) {
    await supabase.from('certificates').insert(data)
    setShowForm(false)
    loadCertificates()
  }

  async function handleUpdate(data: Omit<Certificate, 'id' | 'created_at'>) {
    if (!editing) return
    await supabase.from('certificates').update(data).eq('id', editing.id)
    setEditing(null)
    loadCertificates()
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus sertifikat ini?')) return
    await supabase.from('certificates').delete().eq('id', id)
    loadCertificates()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Certificates</h1>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Sertifikat
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <CertificateForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-8">
          <CertificateForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-white/40">Memuat...</p>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {cert.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-10 h-10 rounded-lg object-cover border border-white/10"
                  />
                )}
                <div>
                  <p className="font-medium">{cert.title}</p>
                  <p className="text-sm text-white/40">{cert.issuer}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(cert)
                    setShowForm(false)
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {certificates.length === 0 && (
            <p className="text-white/40">Belum ada sertifikat.</p>
          )}
        </div>
      )}
    </div>
  )
}
