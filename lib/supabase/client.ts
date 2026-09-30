import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client untuk Client Components ('use client'). Dipakai di
 * mana pun kode jalan di browser — form admin, ContactForm, dst. Beda
 * dari lib/supabase/server.ts yang butuh akses cookies dengan cara
 * berbeda; jangan dicampur, masing-masing untuk context-nya sendiri.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
