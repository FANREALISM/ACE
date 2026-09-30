import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

// next/og's ImageResponse butuh Edge Runtime.
export const runtime = 'edge'

export const alt = 'Portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Generator gambar Open Graph dinamis (1200×630) — dipanggil otomatis
 * oleh Next.js lewat file convention ini, bukan dipanggil manual dari
 * kode lain. Hasilnya jadi og:image dan twitter:image situs, dibuat
 * dari nama+role profile asli, bukan cuma crop foto jadi kotak seperti
 * sebelumnya.
 */
export default async function OpengraphImage() {
  // Client langsung (bukan lib/supabase/server.ts) karena route ini
  // publik dan tidak butuh cookie/session — cuma baca nama+role, data
  // yang sama yang tampil di Hero untuk semua pengunjung.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: profile } = await supabase
    .from('profile')
    .select('name, role, avatar_url')
    .maybeSingle()

  const profileName = profile?.name ?? 'Portfolio'
  const profileRole = profile?.role ?? 'Full-Stack Developer'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage:
            'radial-gradient(circle at 50% 30%, #0a0a1a 0%, #000000 70%)',
          position: 'relative',
        }}
      >
        {/* Grid lines — versi statis dari efek yang sama di Hero,
            disederhanakan karena ImageResponse cuma dukung subset CSS
            (mirip Satori, bukan browser penuh). */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        {/* Avatar bulat kecil kalau ada — placeholder circle kalau tidak */}
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            width={140}
            height={140}
            style={{
              borderRadius: '9999px',
              objectFit: 'cover',
              border: '3px solid rgba(34,211,238,0.5)',
              marginBottom: 32,
            }}
          />
        ) : null}

        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            display: 'flex',
          }}
        >
          {profileName}
        </div>

        <div
          style={{
            fontSize: 32,
            marginTop: 16,
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#22d3ee',
            display: 'flex',
          }}
        >
          {profileRole}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 48,
            fontSize: 20,
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            display: 'flex',
          }}
        >
          {'</> PORTFOLIO'}
        </div>
      </div>
    ),
    { ...size }
  )
}
