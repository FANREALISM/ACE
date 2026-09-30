import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware Next.js — jalan di Edge Runtime SEBELUM request mencapai
 * halaman manapun di bawah /secret-cmd (lihat `config.matcher` di
 * bawah). Tugasnya CUMA refresh session token Supabase supaya admin
 * tidak "ke-logout" random di tengah kerja — BUKAN gerbang auth utama.
 * Gerbang auth sesungguhnya ada di
 * app/secret-cmd/(protected)/layout.tsx lewat getUser() sendiri.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: any }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Sebelumnya: `await supabase.auth.getUser()` polos, tanpa timeout dan
  // tanpa try/catch. Kalau Supabase lambat merespons, unreachable, atau
  // project-nya paused (umum di tier gratis setelah tidak dipakai
  // beberapa hari), call ini bisa hang sampai Vercel sendiri yang
  // membunuh invocation-nya — persis error MIDDLEWARE_INVOCATION_TIMEOUT.
  //
  // Fix: race melawan timeout 5 detik. Kalau timeout atau error, biarkan
  // request tetap lanjut (fail open) — halaman/layout di
  // app/secret-cmd/(protected)/layout.tsx tetap punya pengecekan auth
  // sendiri lewat getUser() di server component, jadi tidak ada celah
  // keamanan; middleware ini cuma bertugas refresh token session supaya
  // tidak "ke-logout" random, bukan satu-satunya gerbang.
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_resolveNeverCalled, rejectWithTimeoutError) =>
        setTimeout(
          () => rejectWithTimeoutError(new Error('auth check timeout')),
          5000
        )
      ),
    ])
  } catch {
    // Diamkan — request tetap lanjut ke halaman, guard sesungguhnya ada
    // di server component layout, bukan di sini.
  }

  return response
}

export const config = {
  matcher: ['/secret-cmd/:path*'],
}
