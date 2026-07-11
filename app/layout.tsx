import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import CommandPalette from '@/components/ui/CommandPalette'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})
const jetbrainsMono = JetBrains_Mono({
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
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
                var saved = localStorage.getItem('portfolio-theme');
                var theme = saved === 'light' || saved === 'dark'
                  ? saved
                  : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
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