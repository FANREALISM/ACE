import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/admin/LogoutButton'
import Link from 'next/link'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
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
            <Link href="/secret-cmd/projects" className="hover:text-cyan-400">
              Projects
            </Link>
            <Link
              href="/secret-cmd/certificates"
              className="hover:text-cyan-400"
            >
              Certificates
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}