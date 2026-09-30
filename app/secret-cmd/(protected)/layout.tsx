import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/admin/LogoutButton'
import Link from 'next/link'

/**
 * Layout yang membungkus SEMUA halaman admin kecuali login — gerbang
 * auth SESUNGGUHNYA (beda dari middleware.ts yang cuma refresh token).
 * Redirect ke /secret-cmd/login kalau belum login ATAU auth check
 * timeout (fail tertutup, bukan fail terbuka).
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Sama seperti fix di middleware.ts: kalau Supabase lambat/unreachable,
  // getUser() polos bisa hang sampai Vercel membunuh invocation-nya
  // (FUNCTION_INVOCATION_TIMEOUT). Di sini bedanya — ini gerbang auth
  // SESUNGGUHNYA (bukan cuma refresh token), jadi kalau timeout terjadi,
  // harus fail TERTUTUP (redirect ke login), bukan fail terbuka seperti
  // di middleware.
  let currentUser = null
  try {
    const authCheckResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_resolveNeverCalled, rejectWithTimeoutError) =>
        setTimeout(
          () => rejectWithTimeoutError(new Error('auth check timeout')),
          8000
        )
      ),
    ])
    currentUser = authCheckResult.data.user
  } catch {
    // Timeout atau error lain dari Supabase — treat sebagai "belum
    // login". Kalau root cause-nya Supabase project paused/unreachable,
    // halaman login sendiri juga akan gagal saat submit, tapi setidaknya
    // errornya jelas ("email/password salah" atau network error di form)
    // ketimbang seluruh halaman hang sampai Vercel timeout.
  }

  if (!currentUser) {
    redirect('/secret-cmd/login')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <nav className="flex gap-6 text-sm">
            <Link href="/secret-cmd" className="hover:text-cyan-400">
              Dashboard
            </Link>
            <Link href="/secret-cmd/about" className="hover:text-cyan-400">
              About
            </Link>
            <Link href="/secret-cmd/skills" className="hover:text-cyan-400">
              Skills
            </Link>
            <Link href="/secret-cmd/projects" className="hover:text-cyan-400">
              Projects
            </Link>
            <Link
              href="/secret-cmd/certificates"
              className="hover:text-cyan-400"
            >
              Certificates
            </Link>
            <Link href="/secret-cmd/messages" className="hover:text-cyan-400">
              Messages
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
