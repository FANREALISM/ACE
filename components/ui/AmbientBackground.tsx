/**
 * Latar animasi halaman publik — tiga orb cahaya yang melayang pelan,
 * grid tipis yang bergeser, dan partikel kecil yang naik. Semuanya fixed
 * di belakang konten (-z-10) dan pointer-events-none, jadi tidak
 * mengganggu klik/scroll.
 *
 * Murni CSS (keyframes di globals.css), tanpa JavaScript berjalan terus
 * dan tanpa Math.random — posisi partikel dihitung deterministik dari
 * indeks supaya render server dan client identik (tidak ada hydration
 * mismatch). Server component: tidak butuh 'use client'.
 */

const PARTICLE_COUNT = 18

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, particleIndex) => ({
  leftPercent: (particleIndex * 37 + 11) % 100,
  sizePx: 2 + (particleIndex % 3),
  durationSeconds: 16 + ((particleIndex * 7) % 14),
  // Delay negatif = animasi "sudah berjalan" sejak load, jadi partikel
  // langsung tersebar di layar, bukan semuanya mulai dari bawah bersamaan.
  delaySeconds: -((particleIndex * 5) % 18),
  driftPx: ((particleIndex % 5) - 2) * 14,
}))

const ORB_GRADIENT = (colorVar: string, strengthPercent: number) =>
  `radial-gradient(circle at center, color-mix(in srgb, var(${colorVar}) ${strengthPercent}%, transparent), transparent 65%)`

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="ambient-grid" />

      <div
        className="ambient-orb"
        style={{
          width: '70vmax',
          height: '70vmax',
          top: '-25vmax',
          left: '-20vmax',
          background: ORB_GRADIENT('--gradient-from', 22),
          ['--drift-x' as string]: '14vw',
          ['--drift-y' as string]: '10vh',
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: '60vmax',
          height: '60vmax',
          bottom: '-22vmax',
          right: '-18vmax',
          background: ORB_GRADIENT('--gradient-via', 20),
          animationDuration: '32s',
          ['--drift-x' as string]: '-12vw',
          ['--drift-y' as string]: '-12vh',
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: '45vmax',
          height: '45vmax',
          top: '35vh',
          left: '40vw',
          background: ORB_GRADIENT('--gradient-to', 12),
          animationDuration: '38s',
          ['--drift-x' as string]: '-16vw',
          ['--drift-y' as string]: '8vh',
        }}
      />

      {PARTICLES.map((particle, particleIndex) => (
        <span
          key={particleIndex}
          // Separuh partikel disembunyikan di layar kecil — mobile tetap
          // hidup tapi tidak ramai, dan lebih hemat baterai.
          className={`ambient-particle ${particleIndex % 2 === 1 ? 'hidden sm:block' : ''}`}
          style={{
            left: `${particle.leftPercent}%`,
            width: particle.sizePx,
            height: particle.sizePx,
            animationDuration: `${particle.durationSeconds}s`,
            animationDelay: `${particle.delaySeconds}s`,
            ['--drift' as string]: `${particle.driftPx}px`,
          }}
        />
      ))}
    </div>
  )
}
