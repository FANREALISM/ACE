'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import CertificateForm from '@/components/admin/CertificateForm'
import type { Certificate } from '@/lib/types'
import { Pencil, Trash2, Plus } from 'lucide-react'

/** Halaman admin CRUD untuk Certificates — pola identik dengan
 *  ProjectsAdminPage.tsx (list + create + edit + delete inline), plus
 *  indikator "Expired" kecil di list untuk visibilitas cepat tanpa
 *  harus buka Edit satu-satu. */
export default function CertificatesAdminPage() {
  const supabase = createClient()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingCertificate, setEditingCertificate] =
    useState<Certificate | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadCertificates() {
    setIsLoading(true)
    setErrorMessage(null)
    const { data: certificatesData, error: loadError } = await supabase
      .from('certificates')
      .select('*')
      .order('display_order', { ascending: true })
    if (loadError) {
      setErrorMessage('Gagal memuat sertifikat: ' + loadError.message)
      setIsLoading(false)
      return
    }
    setCertificates(certificatesData ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadCertificates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(
    certificateData: Omit<Certificate, 'id' | 'created_at'>
  ) {
    setErrorMessage(null)
    const { error: insertError } = await supabase
      .from('certificates')
      .insert(certificateData)
    if (insertError) {
      setErrorMessage('Gagal menambah sertifikat: ' + insertError.message)
      return
    }
    setIsFormVisible(false)
    loadCertificates()
  }

  async function handleUpdate(
    certificateData: Omit<Certificate, 'id' | 'created_at'>
  ) {
    if (!editingCertificate) return
    setErrorMessage(null)
    const { error: updateError } = await supabase
      .from('certificates')
      .update(certificateData)
      .eq('id', editingCertificate.id)
    if (updateError) {
      setErrorMessage('Gagal menyimpan sertifikat: ' + updateError.message)
      return
    }
    setEditingCertificate(null)
    loadCertificates()
  }

  async function handleDelete(certificateId: string) {
    if (!confirm('Yakin hapus sertifikat ini?')) return
    setErrorMessage(null)
    const { error: deleteError } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certificateId)
    if (deleteError) {
      setErrorMessage('Gagal menghapus sertifikat: ' + deleteError.message)
      return
    }
    loadCertificates()
  }

  /** Sama seperti CertificatesSection.tsx publik: perbandingan string ISO
   *  langsung, bukan Date object, untuk menghindari isu timezone di
   *  tanggal batas kedaluwarsa. */
  function isCertificateExpired(expiryDate: string | null): boolean {
    if (!expiryDate) return false
    return expiryDate < new Date().toISOString().slice(0, 10)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Certificates</h1>
        {!isFormVisible && !editingCertificate && (
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} /> Tambah Sertifikat
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
          {errorMessage}
        </p>
      )}

      {isFormVisible && (
        <div className="mb-8">
          <CertificateForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormVisible(false)}
          />
        </div>
      )}

      {editingCertificate && (
        <div className="mb-8">
          <CertificateForm
            initial={editingCertificate}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCertificate(null)}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-white/40">Memuat...</p>
      ) : (
        <div className="space-y-3">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {certificate.image_url && (
                  <Image
                    src={certificate.image_url}
                    alt={certificate.title}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover border border-white/10"
                  />
                )}
                <div>
                  <p className="font-medium">{certificate.title}</p>
                  <p className="text-sm text-white/40">
                    {certificate.issuer}
                  </p>
                  {isCertificateExpired(certificate.expiry_date) && (
                    <p className="text-xs font-mono uppercase tracking-wider text-red-400/80 mt-0.5">
                      Expired
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCertificate(certificate)
                    setIsFormVisible(false)
                  }}
                  aria-label="Edit sertifikat ini"
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-cyan-400"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(certificate.id)}
                  aria-label="Hapus sertifikat ini"
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
