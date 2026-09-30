import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client untuk Server Components / Server Actions. Beda dari
 * lib/supabase/client.ts (browser) — client ini baca/tulis cookies lewat
 * next/headers, yang cuma tersedia di server. Dipakai app/page.tsx,
 * (protected)/layout.tsx, dan semua halaman case study/admin yang
 * fetch data sebelum render.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: any }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Diabaikan kalau dipanggil dari Server Component (bukan Action)
          }
        },
      },
    }
  )
}
