'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Certificate } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { useHoverCapable } from '@/lib/useHoverCapable'
import Modal from '@/components/ui/Modal'

export default function CertificatesSection({
  certificates,
}: {
  certificates: Certificate[]
}) {
  const { t } = useLanguage()
  const canHover = useHoverCapable()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openCert, setOpenCert] = useState<Certificate | null>(null)

  if (certificates.length === 0) return null

  return (
    <section id="certificates" className="py-32 px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-16 text-center">
        {t.certificates.heading} <span className="text-gradient">{t.certificates.headingAccent}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {certificates.map((cert, i) => (
          <div key={cert.id} className="relative">
            <AnimatePresence>
              {canHover && hoveredId === cert.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full z-20 w-60"
                >
                  <div className="glass-card p-3 shadow-xl border-emerald-400/30">
                    {cert.image_url && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cert.image_url}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-white/90 truncate">
                      {cert.title}
                    </p>
                    <p className="text-xs text-white/50 truncate">{cert.issuer}</p>
                  </div>
                  <div className="w-3 h-3 bg-white/5 border-r border-b border-white/10 rotate-45 -mt-1.5 mx-auto" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => canHover && setHoveredId(cert.id)}
              onMouseLeave={() => canHover && setHoveredId(null)}
              onClick={() => setOpenCert(cert)}
              className="glass-card p-6 hover:border-emerald-400/40 transition-colors cursor-pointer h-full"
            >
              {cert.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden mb-5 bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="font-semibold mb-2">{cert.title}</h3>
              <p className="text-white/50 text-sm">{cert.issuer}</p>
              {cert.issue_date && (
                <p className="text-white/30 text-xs mt-2">
                  {new Date(cert.issue_date).getFullYear()}
                </p>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      <Modal open={!!openCert} onClose={() => setOpenCert(null)}>
        {openCert && (
          <div>
            {openCert.image_url && (
              <div className="aspect-video bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openCert.image_url}
                  alt={openCert.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-2">{openCert.title}</h3>
              <p className="text-white/60 mb-1">{openCert.issuer}</p>
              {openCert.issue_date && (
                <p className="text-white/40 text-sm mb-6">
                  {new Date(openCert.issue_date).getFullYear()}
                </p>
              )}
              {openCert.credential_url && (
                <a
                  href={openCert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm"
                >
                  <ExternalLink size={15} /> {t.certificates.viewCredential}
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
