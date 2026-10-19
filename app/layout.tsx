import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import CommandPalette from '@/components/ui/CommandPalette'
import Background from '@/components/ui/Background'
import FloatingBackgroundSwitcher from '@/components/ui/FloatingBackgroundSwitcher'
import SkipLink from '@/components/ui/SkipLink'
import { BackgroundProvider } from '@/lib/background/useBackground'
import { SEO_DEFAULTS, SITE_URL } from '@/lib/seo'
import './globals.css'

const interFont = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGroteskFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})
const jetbrainsMonoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

/**
 * Metadata DEFAULT seluruh situs. Halaman individual (app/page.tsx,
 * projects/[id]) menimpa title/description/openGraph/twitter lewat
 * buildPageMetadata() di lib/seo.ts. File convention app/opengraph-
 * image.tsx otomatis menyediakan og:image & twitter:image.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_DEFAULTS.defaultTitle,
    template: `%s | ${SEO_DEFAULTS.siteName}`,
  },
  description: SEO_DEFAULTS.description,
  keywords: [...SEO_DEFAULTS.keywords],
  applicationName: SEO_DEFAULTS.siteName,
  authors: [{ name: SEO_DEFAULTS.siteName, url: SITE_URL }],
  creator: SEO_DEFAULTS.siteName,
  publisher: SEO_DEFAULTS.siteName,
  category: 'technology',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SEO_DEFAULTS.siteName,
    title: SEO_DEFAULTS.defaultTitle,
    description: SEO_DEFAULTS.description,
    locale: 'id_ID',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_DEFAULTS.defaultTitle,
    description: SEO_DEFAULTS.description,
    site: SEO_DEFAULTS.twitterHandle
      ? `@${SEO_DEFAULTS.twitterHandle}`
      : undefined,
    creator: SEO_DEFAULTS.twitterHandle
      ? `@${SEO_DEFAULTS.twitterHandle}`
      : undefined,
  },
  // index/follow sengaja TIDAK ditulis: itu perilaku default, dan tag
  // eksplisit "index, follow" muncul berdampingan dengan "noindex" otomatis
  // Next.js di halaman 404 (dua tag robots yang saling bertentangan).
  robots: {
    googleBot: {
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
  verification: SEO_DEFAULTS.googleVerification
    ? { google: SEO_DEFAULTS.googleVerification }
    : undefined,
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  // viewportFit: 'cover' membuat konten bisa meluas ke area di belakang
  // notch/Dynamic Island (bukan cuma dibatasi kotak aman browser),
  // supaya env(safe-area-inset-*) di CSS bisa dipakai untuk padding yang
  // benar-benar akurat menghindari notch — tanpa ini, env() selalu
  // resolve ke 0 dan tidak ada efeknya sama sekali.
  viewportFit: 'cover',
}

/**
 * Root layout — dipasang sekali, membungkus SEMUA route di situs
 * (halaman publik dan /secret-cmd admin). Tempat font, provider global
 * (tema, bahasa), command palette, dan Analytics dipasang.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${interFont.variable} ${spaceGroteskFont.variable} ${jetbrainsMonoFont.variable}`}
    >
      <body className="bg-black text-white antialiased">
        {/* Anti-flash: baca localStorage & set data-theme SEBELUM React
            hydrate, supaya tidak ada kedipan dark→light sesaat di reload
            kalau preferensi tersimpannya 'light'. Inline & sinkron —
            browser wajib jalankan ini sebelum lanjut render sibling
            berikutnya. suppressHydrationWarning di <html> diperlukan
            karena attribute ini di-set di luar siklus render React. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('portfolio-theme');
                var resolvedTheme = savedTheme === 'light' || savedTheme === 'dark'
                  ? savedTheme
                  : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                document.documentElement.setAttribute('data-theme', resolvedTheme);
              } catch (themeDetectionError) {}

              /* Pilihan latar: localStorage → fallback. Default 'ps2'
                 (sama dengan DEFAULT_BACKGROUND_MODE di lib/background/
                 useBackground.tsx), kecuali browser meminta hemat data
                 (Save-Data) — pengunjung seperti itu mulai dari 'normal'
                 supaya tidak diseret animasi berat. Diset ke <html> SEBELUM
                 hydrate agar CSS menampilkan latar yang benar tanpa kedip. */
              var resolvedBackground = 'ps2';
              try {
                var savedBackground = localStorage.getItem('portfolio-bkg');
                if (savedBackground === 'ps2' || savedBackground === 'ambient' || savedBackground === 'normal') {
                  resolvedBackground = savedBackground;
                } else if (navigator.connection && navigator.connection.saveData) {
                  resolvedBackground = 'normal';
                }
              } catch (backgroundDetectionError) {}
              document.documentElement.setAttribute('data-bkg', resolvedBackground);
            `,
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            {/* Tautan fokusable pertama di halaman (urutan DOM = urutan Tab). */}
            <SkipLink />
            <BackgroundProvider>
              {/* Latar global (z-index -1). Di dalam ThemeProvider karena
                  PS2 membaca tema aktif; di dalam BackgroundProvider karena
                  membaca pilihan pengunjung. Chunk animasi PS2 di-lazy-load
                  (lihat components/ui/Background.tsx). */}
              <Background />
              <FloatingBackgroundSwitcher />
              {children}
              <CommandPalette />
            </BackgroundProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
