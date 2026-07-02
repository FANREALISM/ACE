'use client'

import { motion } from 'framer-motion'
import type { Certificate } from '@/lib/types'

export default function CertificatesSection({
  certificates,
}: {
  certificates: Certificate[]
}) {
  if (certificates.length === 0) return null

  return (
    <section id="certificates" className="py-24 px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-12 text-center">
        Sertifikat & <span className="text-gradient">Pencapaian</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certificates.map((cert, i) => (
          <motion.a
            key={cert.id}
            href={cert.credential_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 hover:border-emerald-400/40 transition-colors block"
          >
            {cert.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cert.image_url}
                  alt={cert.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold mb-1">{cert.title}</h3>
            <p className="text-white/50 text-sm">{cert.issuer}</p>
            {cert.issue_date && (
              <p className="text-white/30 text-xs mt-2">
                {new Date(cert.issue_date).getFullYear()}
              </p>
            )}
          </motion.a>
        ))}
      </div>
    </section>
  )
}
