import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.vercel.app'

/** robots.txt via Next.js metadata route convention — di-generate
 *  otomatis di /robots.txt, tidak dipanggil manual dari kode lain. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /secret-cmd sudah dilindungi Supabase Auth, tapi ini mencegah
      // Google mengindeks URL-nya sama sekali — "security through
      // obscurity" tidak dihilangkan sepenuhnya, cuma satu lapis lagi.
      disallow: '/secret-cmd',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
