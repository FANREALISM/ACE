import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import CommandPalette from '@/components/ui/CommandPalette'
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Portfolio',
    template: '%s | Portfolio',
  },
  description: 'Personal portfolio website.',
}

export const viewport: Viewport = {
  themeColor: '#000000',
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
            `,
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <CommandPalette />
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
