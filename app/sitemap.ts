import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  // Single-page portfolio — hanya satu entri. Kalau nanti ditambah
  // halaman lain (mis. blog), tambahkan array item di sini.
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
