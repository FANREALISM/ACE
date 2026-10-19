import type { MetadataRoute } from 'next'
import { SEO_DEFAULTS } from '@/lib/seo'

/** Web App Manifest (/manifest.webmanifest, otomatis di-link Next.js):
 *  nama, warna, dan ikon saat situs ditambahkan ke layar utama. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO_DEFAULTS.defaultTitle,
    short_name: SEO_DEFAULTS.siteName,
    description: SEO_DEFAULTS.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'id',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
