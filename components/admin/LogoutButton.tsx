'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

/** Tombol logout admin — sign out dari Supabase Auth, redirect ke
 *  halaman login, lalu router.refresh() supaya server components (yang
 *  cek auth lewat getUser()) re-evaluate status login yang baru. */
export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/secret-cmd/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-white/50 hover:text-red-400 transition-colors"
    >
      <LogOut size={16} />
      Logout
    </button>
  )
}
