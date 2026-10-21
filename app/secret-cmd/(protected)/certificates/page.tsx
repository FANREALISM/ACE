'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import CertificateForm from '@/components/admin/CertificateForm'
import type { Certificate } from '@/lib/types'
import { Award, Pencil, Plus } from 'lucide-react'
import {
  Alert,
  Btn,
  CardGrid,
  ConfirmDeleteButton,
  EmptyState,
  IconBtn,
  LoadingState,
  PageHeader,
  StatusTag,
} from '@/components/admin/AdminUI'

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

  const isEditorOpen = isFormVisible || editingCertificate !== null

  return (
    <div>
      <PageHeader
        code="CERT_VAULT"
        title="Kelola Certificates"
        description="Sertifikat dan kredensial. Yang punya tanggal kedaluwarsa terlewat ditandai EXPIRED."
        actions={
          !isEditorOpen && (
            <Btn icon={<Plus size={15} aria-hidden="true" />} onClick={() => setIsFormVisible(true)}>
              TAMBAH_SERTIFIKAT
            </Btn>
          )
        }
      />

      {errorMessage && (
        <div className="mb-6">
          <Alert>{errorMessage}</Alert>
        </div>
      )}

      {isFormVisible && (
        <div className="mb-8">
          <CertificateForm onSubmit={handleCreate} onCancel={() => setIsFormVisible(false)} />
        </div>
      )}

      {editingCertificate && (
        <div className="mb-8">
          <CertificateForm
            key={editingCertificate.id}
            initial={editingCertificate}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCertificate(null)}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : certificates.length === 0 ? (
        <EmptyState code="NO_CERTS">Belum ada sertifikat.</EmptyState>
      ) : (
        <CardGrid>
          {certificates.map((certificate) => {
            const isExpired = isCertificateExpired(certificate.expiry_date)
            return (
              <li
                key={certificate.id}
                data-accent={isExpired ? 'amber' : undefined}
                className="adm-card flex flex-col gap-3 p-4"
              >
                <div className="flex items-start gap-3">
                  {certificate.image_url ? (
                    <Image
                      src={certificate.image_url}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 border border-adm-line/20 object-cover"
                    />
                  ) : (
                    <div className="adm-thumb h-14 w-14">
                      <Award size={18} aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium leading-snug text-adm-text">{certificate.title}</h2>
                    <p className="mt-0.5 text-sm text-adm-muted">{certificate.issuer}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {isExpired ? (
                    <StatusTag tone="amber" dot>EXPIRED</StatusTag>
                  ) : (
                    <StatusTag tone="green" dot>VALID</StatusTag>
                  )}
                  {certificate.issue_date && (
                    <StatusTag tone="muted">{certificate.issue_date}</StatusTag>
                  )}
                </div>

                <div className="mt-auto flex justify-end gap-2 border-t border-adm-line/10 pt-3">
                  <IconBtn
                    label={`Edit sertifikat ${certificate.title}`}
                    onClick={() => {
                      setEditingCertificate(certificate)
                      setIsFormVisible(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    <span className="max-sm:sr-only">Edit</span>
                  </IconBtn>
                  <ConfirmDeleteButton
                    itemName={`sertifikat ${certificate.title}`}
                    onConfirm={() => handleDelete(certificate.id)}
                  />
                </div>
              </li>
            )
          })}
        </CardGrid>
      )}
    </div>
  )
}
