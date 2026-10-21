import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

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

  // Jumlah pesan belum dibaca untuk lencana di sidebar. Best-effort:
  // gagal / lambat → 0, tidak boleh menghalangi halaman admin terbuka.
  let unreadCount = 0
  try {
    const unreadResult = await Promise.race([
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false),
      new Promise<never>((_resolveNeverCalled, rejectWithTimeoutError) =>
        setTimeout(() => rejectWithTimeoutError(new Error('unread timeout')), 2500)
      ),
    ])
    unreadCount = unreadResult.count ?? 0
  } catch {
    // Abaikan — lencana saja yang hilang.
  }

  return (
    <AdminShell userEmail={currentUser.email ?? 'admin'} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  )
}
