import type { Metadata } from 'next'

/**
 * Konfigurasi SEO terpusat — SATU tempat untuk mengubah identitas situs di
 * mesin pencari dan link preview (WhatsApp, LinkedIn, X, Slack, dst).
 * Dipakai oleh app/layout.tsx (default seluruh situs), app/page.tsx
 * (override dengan data profil dari Supabase), sitemap.ts, dan robots.ts.
 *
 * YANG PERLU KAMU EDIT: blok SEO_DEFAULTS di bawah (nama, deskripsi,
 * keywords). Nilai lain diambil dari environment variable.
 */

/** URL kanonis situs tanpa trailing slash. Wajib diisi di production
 *  (NEXT_PUBLIC_SITE_URL) — placeholder hanya agar build tidak gagal. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.vercel.app'
).replace(/\/+$/, '')

export const SEO_DEFAULTS = {
  /** Nama pemilik / merek. Dipakai di title template, OG siteName, JSON-LD. */
  siteName: 'Affan Rabbani',
  /** Judul default kalau halaman tidak menentukan sendiri. */
  defaultTitle: 'Affan Rabbani — Full-Stack Developer Portfolio',
  /** 140–160 karakter ideal; Google memotong di ±155–160. */
  description:
    'Portofolio Affan Rabbani, Full-Stack Developer: proyek web modern dengan Next.js, React, TypeScript, dan Supabase. Lihat case study, sertifikat, dan pengalaman.',
  /** Google tidak memakai meta keywords untuk ranking, tapi mesin lain dan
   *  beberapa platform masih membacanya — murah untuk disertakan. */
  keywords: [
    'portfolio',
    'portofolio',
    'full-stack developer',
    'web developer',
    'software engineer',
    'Next.js',
    'React',
    'TypeScript',
    'Supabase',
    'Indonesia',
  ],
  /** Akun X/Twitter tanpa @, opsional. */
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  /** Kode verifikasi Google Search Console (tag HTML), opsional. */
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
} as const

const DEFAULT_OG_IMAGE = '/opengraph-image'

interface PageMetadataInput {
  /** Judul halaman TANPA nama situs (template layout menambahkannya),
   *  kecuali `absoluteTitle` true. */
  title: string
  description: string
  /** Path relatif, mis. '/' atau '/projects/abc'. Dipakai untuk canonical
   *  dan og:url. */
  path?: string
  /** Pakai judul apa adanya tanpa template "| Nama Situs". */
  absoluteTitle?: boolean
  /** Gambar OG. Default '/opengraph-image' (app/opengraph-image.tsx).
   *  Harus eksplisit: file convention hanya menempel di segment layout,
   *  jadi openGraph di level page MENGHAPUSNYA (terverifikasi di build —
   *  tanpa ini og:image hilang dari <head>). */
  image?: string
  type?: 'website' | 'article'
}

/**
 * Bangun objek Metadata lengkap (title, description, canonical, Open
 * Graph, Twitter Card) dari input minimal. Penting: Next.js menggabungkan
 * metadata layout dan page SECARA DANGKAL — openGraph di page MENGGANTI
 * openGraph di layout (tidak di-merge per-field). Makanya setiap halaman
 * harus mengisi openGraph/twitter lengkap lewat helper ini, bukan hanya
 * title+description.
 */
export function buildPageMetadata({
  title,
  description,
  path = '/',
  absoluteTitle = false,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
}: PageMetadataInput): Metadata {
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`
  const fullTitle = absoluteTitle
    ? title
    : `${title} | ${SEO_DEFAULTS.siteName}`

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type,
      url: canonicalUrl,
      siteName: SEO_DEFAULTS.siteName,
      title: fullTitle,
      description,
      locale: 'id_ID',
      alternateLocale: ['en_US'],
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      site: SEO_DEFAULTS.twitterHandle
        ? `@${SEO_DEFAULTS.twitterHandle}`
        : undefined,
      creator: SEO_DEFAULTS.twitterHandle
        ? `@${SEO_DEFAULTS.twitterHandle}`
        : undefined,
      images: [image],
    },
  }
}

/** Serialisasi JSON-LD aman untuk disisipkan di <script>. Karakter '<'
 *  di-escape supaya data dari database (nama, deskripsi) yang berisi
 *  "</script>" tidak bisa menutup tag dan menyuntikkan HTML. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
