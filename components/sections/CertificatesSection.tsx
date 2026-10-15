'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Certificate } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { useHoverCapable } from '@/lib/useHoverCapable'
import Modal from '@/components/ui/Modal'
import Reveal from '@/components/ui/Reveal'

/**
 * Grid sertifikat dengan hover-preview bubble (pola sama persis dengan
 * ProjectsGrid.tsx) dan klik-card yang membuka Modal detail — BEDA dari
 * ProjectsGrid yang klik-nya navigasi ke website. Sertifikat tetap pakai
 * modal karena tidak selalu ada "website" untuk sertifikat, sedangkan
 * project (hampir) selalu ada live demo/repo untuk dituju.
 */
export default function CertificatesSection({
  certificates,
}: {
  certificates: Certificate[]
}) {
  const { translations } = useLanguage()
  const supportsHover = useHoverCapable()
  const [hoveredCertificateId, setHoveredCertificateId] = useState<
    string | null
  >(null)
  const [openCertificate, setOpenCertificate] = useState<Certificate | null>(
    null
  )
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [bubbleWidth, setBubbleWidth] = useState(360)
  const pendingAnimationFrameRef = useRef<number | null>(null)
  // Sama seperti ProjectsGrid.tsx: elemen card yang di-hover, dipakai
  // untuk spotlight yang di-update langsung ke DOM (bukan React state)
  // supaya tidak trigger re-render tiap gerakan mouse.
  const hoveredCardElementRef = useRef<HTMLDivElement | null>(null)

  // Sama seperti ProjectsGrid.tsx: cancel rAF pending di cleanup supaya
  // tidak setState di komponen yang sudah unmounted.
  useEffect(() => {
    return () => {
      if (pendingAnimationFrameRef.current !== null) {
        cancelAnimationFrame(pendingAnimationFrameRef.current)
      }
    }
  }, [])

  const BUBBLE_MARGIN_FROM_VIEWPORT_EDGE = 12
  const BUBBLE_SIZE_MULTIPLIER = 1.35

  /** Dipanggil saat kursor masuk ke card sertifikat — ukur lebar card
   *  asli untuk menskalakan bubble preview lebih besar dari itu. */
  function handleCardMouseEnter(
    certificateId: string,
    cardElement: HTMLElement
  ) {
    if (!supportsHover) return
    const cardBounds = cardElement.getBoundingClientRect()
    setBubbleWidth(Math.round(cardBounds.width * BUBBLE_SIZE_MULTIPLIER))
    setHoveredCertificateId(certificateId)
    hoveredCardElementRef.current = cardElement as HTMLDivElement
  }

  function handleCardMouseLeave() {
    if (!supportsHover) return
    setHoveredCertificateId(null)
    hoveredCardElementRef.current = null
  }

  /** Update posisi bubble mengikuti kursor, di-throttle lewat
   *  requestAnimationFrame (lihat komentar identik di ProjectsGrid.tsx
   *  untuk alasan lengkapnya). Frame yang sama juga update posisi
   *  spotlight lewat direct DOM mutation. */
  function handleCardMouseMove(mouseEvent: React.MouseEvent) {
    if (!supportsHover) return
    const cursorX = mouseEvent.clientX
    const cursorY = mouseEvent.clientY
    if (pendingAnimationFrameRef.current !== null) return
    pendingAnimationFrameRef.current = requestAnimationFrame(() => {
      setCursorPosition({ x: cursorX, y: cursorY })

      const cardElement = hoveredCardElementRef.current
      if (cardElement) {
        const cardBounds = cardElement.getBoundingClientRect()
        const relativeX = ((cursorX - cardBounds.left) / cardBounds.width) * 100
        const relativeY = ((cursorY - cardBounds.top) / cardBounds.height) * 100
        cardElement.style.setProperty('--spotlight-x', `${relativeX}%`)
        cardElement.style.setProperty('--spotlight-y', `${relativeY}%`)
      }

      pendingAnimationFrameRef.current = null
    })
  }

  /** Hitung posisi fixed bubble — logika identik dengan ProjectsGrid.tsx
   *  (angka piksel polos, bukan CSS transform; flip ke bawah kursor kalau
   *  terlalu dekat puncak viewport). */
  function computeBubblePosition(
    cursorX: number,
    cursorY: number
  ): React.CSSProperties {
    // Clamp lebar bubble sendiri ke lebar viewport dulu, SEBELUM hitung
    // posisi left — tanpa ini, di viewport sempit tapi hover-capable
    // (mis. iPad dengan trackpad, tablet Windows kecil), bubbleWidth
    // (1.35x lebar card) bisa lebih lebar dari viewport itu sendiri.
    // Itu bikin Math.max/Math.min di bawah menghasilkan `left` negatif —
    // bubble terdorong sebagian ke luar layar kiri, bukan cuma "kurang
    // pas", benar-benar terpotong.
    const clampedBubbleWidth = Math.min(
      bubbleWidth,
      window.innerWidth - BUBBLE_MARGIN_FROM_VIEWPORT_EDGE * 2
    )
    const bubbleLeft = Math.min(
      Math.max(
        cursorX - clampedBubbleWidth / 2,
        BUBBLE_MARGIN_FROM_VIEWPORT_EDGE
      ),
      window.innerWidth - clampedBubbleWidth - BUBBLE_MARGIN_FROM_VIEWPORT_EDGE
    )
    const MIN_VERTICAL_ROOM_ABOVE_CURSOR = 300
    if (cursorY < MIN_VERTICAL_ROOM_ABOVE_CURSOR) {
      return {
        position: 'fixed',
        left: bubbleLeft,
        top: cursorY + 20,
        width: clampedBubbleWidth,
      }
    }
    const bubbleBottom = window.innerHeight - cursorY + 20
    return {
      position: 'fixed',
      left: bubbleLeft,
      bottom: bubbleBottom,
      width: clampedBubbleWidth,
    }
  }

  /** Cek apakah sertifikat sudah lewat masa berlaku. Perbandingan string
   *  ISO langsung (bukan Date object) sengaja dipilih:
   *  new Date("2025-01-01") di-parse sebagai UTC tengah malam, sedangkan
   *  new Date() pakai waktu lokal — perbandingan Date-vs-Date bisa
   *  meleset sehari tergantung timezone pengunjung, tepat di tanggal
   *  batasnya. String YYYY-MM-DD bisa dibandingkan leksikografis dengan
   *  aman, tanpa isu timezone sama sekali. */
  function isCertificateExpired(expiryDate: string | null): boolean {
    if (!expiryDate) return false
    const todayAsIsoDate = new Date().toISOString().slice(0, 10)
    return expiryDate < todayAsIsoDate
  }

  if (certificates.length === 0) return null

  return (
    <section
      id="certificates"
      aria-labelledby="certificates-heading"
      className="section-y px-6 max-w-6xl mx-auto scroll-mt-20"
    >
      <Reveal>
        <h2 id="certificates-heading" className="text-2xl sm:text-3xl font-bold section-head-gap text-center">
          {translations.certificates.heading}{' '}
          <span className="text-gradient">
            {translations.certificates.headingAccent}
          </span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
        {certificates.map((certificate, certificateIndex) => (
          <div key={certificate.id} className="relative">
            {/* Bubble preview — fixed & ngikutin kursor, lebih besar dari
                card aslinya (1.35x lebar card yang di-hover, diukur lewat
                getBoundingClientRect, bukan angka tebakan). */}
            <AnimatePresence>
              {supportsHover && hoveredCertificateId === certificate.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  style={computeBubblePosition(
                    cursorPosition.x,
                    cursorPosition.y
                  )}
                  className="pointer-events-none z-20"
                >
                  <div className="glass-card p-4 shadow-xl border-emerald-400/30">
                    {certificate.image_url && (
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-white/5">
                        <Image
                          src={certificate.image_url}
                          alt={certificate.title}
                          fill
                          sizes="360px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-base font-semibold text-white/90 truncate">
                      {certificate.title}
                    </p>
                    <p className="text-sm text-white/50 truncate mt-1">
                      {certificate.issuer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: certificateIndex * 0.1 }}
              onMouseEnter={(mouseEvent) =>
                handleCardMouseEnter(certificate.id, mouseEvent.currentTarget)
              }
              onMouseLeave={handleCardMouseLeave}
              onMouseMove={handleCardMouseMove}
              onClick={() => setOpenCertificate(certificate)}
              className="relative group glass-card p-6 hover:border-emerald-400/40 transition-colors cursor-pointer h-full"
            >
              {/* Spotlight — sama persis dengan ProjectsGrid.tsx, warna
                  emerald menyesuaikan aksen certificate. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(52, 211, 153, 0.08), transparent 70%)',
                }}
              />
              {certificate.image_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-5 bg-white/5">
                  <Image
                    src={certificate.image_url}
                    alt={certificate.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="font-semibold mb-2">{certificate.title}</h3>
              <p className="text-white/50 text-sm">{certificate.issuer}</p>
              {certificate.issue_date && (
                <p className="text-white/30 text-xs mt-2">
                  {new Date(certificate.issue_date).getFullYear()}
                </p>
              )}
            </motion.article>
          </div>
        ))}
      </div>

      <Modal
        open={!!openCertificate}
        onClose={() => setOpenCertificate(null)}
      >
        {openCertificate && (
          <div>
            {openCertificate.image_url && (
              <div className="relative aspect-video bg-white/5">
                <Image
                  src={openCertificate.image_url}
                  alt={openCertificate.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-2">
                {openCertificate.title}
              </h3>
              <p className="text-white/60 mb-1">{openCertificate.issuer}</p>

              <div className="mb-6">
                {(openCertificate.issue_date ||
                  openCertificate.expiry_date) && (
                  <p className="text-white/40 text-sm">
                    {openCertificate.issue_date &&
                      new Date(openCertificate.issue_date).toLocaleDateString(
                        undefined,
                        { year: 'numeric', month: 'short' }
                      )}
                    {openCertificate.issue_date &&
                      openCertificate.expiry_date &&
                      ' — '}
                    {openCertificate.expiry_date &&
                      new Date(
                        openCertificate.expiry_date
                      ).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                      })}
                  </p>
                )}

                {isCertificateExpired(openCertificate.expiry_date) && (
                  <p className="text-xs font-mono uppercase tracking-wider text-red-400/80">
                    Expired
                  </p>
                )}

                {openCertificate.credential_id && (
                  <p className="text-white/30 text-xs font-mono">
                    ID: {openCertificate.credential_id}
                  </p>
                )}
              </div>

              {openCertificate.credential_url && (
                <a
                  href={openCertificate.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm"
                >
                  <ExternalLink size={15} />{' '}
                  {translations.certificates.viewCredential}
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
