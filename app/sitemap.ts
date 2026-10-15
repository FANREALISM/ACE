import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'

/** sitemap.xml via Next.js metadata route convention — di-generate
 *  otomatis di /sitemap.xml. */
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
