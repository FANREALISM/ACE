import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client untuk MEMBACA data publik di Server Component — tanpa
 * cookies.
 *
 * KENAPA ADA INI (dan bukan lib/supabase/server.ts): client server memanggil
 * `cookies()` dari next/headers, dan itu membuat Next.js merender halaman
 * SECARA DINAMIS di setiap kunjungan (Cache-Control: no-store): satu
 * function serverless + enam query Supabase di tiap request, tanpa CDN.
 * Itu langsung menambah TTFB/FCP/LCP di HP lambat. Data publik (profile,
 * projects, dst) boleh dibaca anon — RLS mengizinkan SELECT untuk publik —
 * jadi halaman publik cukup memakai client ini dan bisa di-cache (ISR).
 *
 * JANGAN dipakai untuk halaman admin: admin membutuhkan sesi login (cookies)
 * dan tetap memakai lib/supabase/server.ts.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  )
}
