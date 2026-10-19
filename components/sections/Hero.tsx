'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import type { Profile } from '@/lib/types'
import { menuItems, type MenuItem } from '@/lib/menuItems'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import ThemeToggle from '@/components/ui/ThemeToggle'
import MagneticButton from '@/components/ui/MagneticButton'

interface MenuButtonProps {
  item: MenuItem
  /** Posisi item ini dalam daftar menu — dipakai untuk delay animasi
   *  bertahap (item ke-2 muncul sedikit lebih lambat dari item ke-1,
   *  dst), bukan untuk logika lain. */
  index: number
  label: string
}

/** Satu baris menu di Hero — teks besar bergaya terminal dengan titik
 *  cyan yang menyala saat di-hover. Render <a> untuk anchor link dalam
 *  halaman, atau <Link> Next.js untuk navigasi ke halaman lain. */
function MenuButton({ item, index, label }: MenuButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const menuButtonContent = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative flex items-center gap-3 md:gap-4 py-2 md:py-4 cursor-pointer select-none"
    >
      <motion.span
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.6 }}
        transition={{ duration: 0.15 }}
        className="w-3 h-3 bg-cyan-400 shrink-0"
        style={{
          boxShadow: isHovered ? '0 0 12px rgba(34,211,238,0.8)' : 'none',
        }}
      />
      <motion.span
        animate={{ x: isHovered ? 12 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`font-mono font-bold text-[clamp(1.05rem,5.4vw,1.5rem)] md:text-3xl tracking-wider uppercase transition-colors duration-150 ${
          isHovered ? 'text-cyan-400' : 'text-white/80'
        }`}
      >
        [ {label} ]
      </motion.span>
    </motion.div>
  )

  if (item.isAnchor) {
    return (
      <a href={item.href} aria-label={label}>
        {menuButtonContent}
      </a>
    )
  }

  return (
    <Link href={item.href} aria-label={label}>
      {menuButtonContent}
    </Link>
  )
}

/**
 * Section pertama situs — foto profil, nama, role, badge ketersediaan,
 * tombol download CV, dan menu navigasi vertikal utama. Memenuhi
 * (minimal) satu layar penuh, dengan efek fade-out saat di-scroll lewat.
 */
export default function Hero({ profile }: { profile: Profile | null }) {
  const { translations } = useLanguage()

  // Peta ukuran foto profil — dikontrol dari Settings admin panel.
  // Fallback ke 'md' kalau profile null, avatar_size belum diisi, atau
  // migrasi add_avatar_size.sql belum dijalankan (kolom belum ada).
  const AVATAR_SIZE_CLASSES: Record<string, string> = {
    sm: 'w-20 h-20 md:w-28 md:h-28',
    md: 'w-28 h-28 md:w-36 md:h-36',
    lg: 'w-36 h-36 md:w-44 md:h-44',
    xl: 'w-44 h-44 md:w-52 md:h-52',
  }
  const avatarSizeClass =
    AVATAR_SIZE_CLASSES[profile?.avatar_size ?? 'md'] ?? AVATAR_SIZE_CLASSES.md

  // Fade + shrink the hero menu berdasarkan progress scroll RELATIF ke
  // tinggi section Hero itu sendiri (bukan angka piksel absolut 500px
  // yang dulu dipakai). Sebelumnya: fade selesai di scrollY===500px
  // TERLEPAS dari tinggi hero atau viewport — di layar mobile yang pendek,
  // itu berarti fade rampung setelah baru scroll dikit relatif ke tinggi
  // hero-nya sendiri, jadi terasa "buru-buru hilang". Sekarang: progress
  // 0 = hero baru mulai discroll (masih di posisi awal), 1 = hero sudah
  // sepenuhnya lewat dari viewport — proporsional di semua ukuran layar.
  const heroSectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  })
  // Hero TAHAN dulu (opacity 1, tanpa geser) sampai setengah tinggi
  // section ter-scroll, baru memudar dan benar-benar hilang di 95%.
  // Sebelumnya fade linear [0 → 1] mulai dari piksel scroll pertama —
  // di mobile, di mana hero bertumpuk vertikal dan lebih tinggi dari
  // layar, konten sudah setengah pudar padahal baru mulai di-scroll,
  // jadi terasa buru-buru hilang. Berlaku di semua ukuran layar karena
  // progress-nya relatif ke tinggi hero sendiri.
  const heroOpacity = useTransform(
    heroScrollProgress,
    [0, 0.5, 0.95],
    [1, 1, 0]
  )
  // Setelah benar-benar memudar, Hero harus keluar dari urutan Tab dan
  // pohon aksesibilitas: opacity 0 saja tetap bisa difokus keyboard —
  // pengguna menekan Tab di tengah halaman dan fokus mendarat pada
  // tautan tak terlihat (halaman bahkan bisa melompat ke atas).
  const heroVisibility = useTransform(heroScrollProgress, (progress) =>
    progress >= 0.95 ? 'hidden' : 'visible'
  )
  const heroTranslateY = useTransform(
    heroScrollProgress,
    [0, 0.5, 1],
    [0, 0, -40]
  )
  // Parallax lembut di glow circle dekoratif — REUSE heroScrollProgress
  // yang sudah ada (bukan listener scroll baru), cuma nambah dua
  // useTransform lagi dari motion value yang sama. Dua circle bergerak
  // dengan kecepatan beda (60px vs -40px) supaya ada kesan kedalaman,
  // bukan cuma geser bareng seperti satu lapis datar. transform-only,
  // sama sekali tidak menyentuh ukuran/posisi lewat top/left atau
  // properti yang memicu layout reflow.
  const glowCircleOneTranslateY = useTransform(heroScrollProgress, [0, 1], [0, 60])
  const glowCircleTwoTranslateY = useTransform(heroScrollProgress, [0, 1], [0, -40])

  return (
    <section
      ref={heroSectionRef}
      // 100svh (small viewport height) bukan 100vh: di Safari/Chrome mobile,
      // 100vh dihitung SAAT address bar tersembunyi sehingga section jadi
      // lebih tinggi dari layar yang terlihat. Padding atas/bawah juga
      // dipadatkan di mobile (sebelumnya py-28 = 112px di kedua sisi).
      className="relative min-h-[100svh] w-full flex items-center pt-20 pb-10 md:py-24"
    >
      {/* Semua layer dekoratif dibungkus overflow-hidden-nya sendiri —
          supaya blur circle yang sengaja "meluber" (translate-x-32) tidak
          memicu horizontal scroll, TANPA ikut memotong konten asli kalau
          section ini jadi lebih tinggi dari viewport di layar pendek. */}
      {/* bg-black dihapus dari <section> ini: latar solid itu menutupi
          PS2Background (fixed, di belakang seluruh halaman) sehingga
          animasinya tidak terlihat di Hero. Warna dasar tetap hitam dari
          <body>, jadi tampilan statis tidak berubah. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Grid lines background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Radial glow — blur radius sengaja dikecilkan dari 130px/110px.
            filter: blur() radius besar itu salah satu operasi CSS paling
            mahal yang ada; elemen ini selalu aktif render selama Hero
            kelihatan (praktis sepanjang initial load), jadi ini biaya
            yang dibayar di awal, bukan cuma pas hover/interaksi. 60px
            masih memberi efek glow lembut, cuma area sampling yang harus
            dihitung browser jauh lebih kecil. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{ y: glowCircleOneTranslateY }}
            className="w-[380px] h-[380px] md:w-[600px] md:h-[600px] rounded-full bg-cyan-500/10 blur-[60px]"
          />
          <motion.div
            // x: 128px di sini menggantikan class Tailwind translate-x-32
            // yang sebelumnya ada — keduanya sama-sama menulis ke
            // `transform`, dan style inline Framer Motion akan menang
            // lewat specificity, DIAM-DIAM menghapus offset horizontal
            // dari class Tailwind kalau dibiarkan campur. Disatukan di
            // sini supaya x dan y sama-sama dikelola satu mekanisme.
            style={{ x: 128, y: glowCircleTwoTranslateY }}
            className="absolute w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full bg-purple-500/10 blur-[50px]"
          />
        </div>
      </div>

      <motion.div
        style={{
          opacity: heroOpacity,
          y: heroTranslateY,
          visibility: heroVisibility,
        }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-8 md:gap-16 items-center"
      >
        {/* Kolom kiri: foto profil + nama + role + CV */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-5 md:gap-8"
        >
          {profile && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wide ${
                profile.is_available
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/15 bg-white/5 text-white/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  profile.is_available
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-white/30'
                }`}
              />
              {profile.is_available
                ? translations.hero.availableBadge
                : translations.hero.unavailableBadge}
            </div>
          )}

          {profile?.avatar_url ? (
            <div
              className={`${avatarSizeClass} relative rounded-2xl overflow-hidden border border-white/10 bg-white/5`}
            >
              {/* next/image dengan fill: perlu ancestor position:relative
                  (ditambahkan di className div di atas) + ukuran eksplisit
                  dari parent (avatarSizeClass). priority (bukan manual
                  fetchPriority) adalah cara next/image sendiri untuk
                  bilang "ini elemen LCP, muat duluan, jangan lazy-load" —
                  otomatis skip loading="lazy" juga. Sebagai bonus dari
                  next/image: WebP/AVIF otomatis, responsive srcset,
                  dan dimensi eksplisit yang mencegah layout shift (CLS). */}
              <Image
                src={profile.avatar_url}
                alt={profile?.name ?? 'Foto profil'}
                fill
                priority
                sizes="(max-width: 768px) 176px, 208px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className={`${avatarSizeClass} rounded-2xl border border-dashed border-white/15 bg-white/5 flex items-center justify-center`}
            >
              <span className="font-mono text-xs text-white/30 uppercase text-center px-2">
                No Photo
              </span>
            </div>
          )}

          <div>
            {(() => {
              const displayName = profile?.name ?? 'AFFAN RABBANI'
              return (
                <h1
                  // `visible` (visibility: visible) menimpa visibility:hidden milik
                  // pembungkus Hero setelah memudar: tautan & tombol keluar dari
                  // urutan Tab, tapi <h1> tetap ada di pohon aksesibilitas — pembaca
                  // layar yang melompat antar heading tidak kehilangan judul halaman.
                  // Teksnya sendiri tidak terlihat karena opacity pembungkus 0.
                  aria-label={displayName}
                  // Fluid di mobile: 8.4vw dikunci antara 1.6rem–2.25rem supaya nama
                  // panjang (13+ karakter monospace) tidak meluber di layar 320px,
                  // tapi tetap sebesar text-4xl di layar lebar.
                  className="visible font-mono font-bold uppercase text-[clamp(1.6rem,8.4vw,2.25rem)] md:text-6xl tracking-tight text-white mb-3"
                >
                  {/* Animasi stagger per-karakter — sekali jalan saat
                      mount, tidak ada biaya berkelanjutan setelahnya
                      (beda dari spotlight/magnetic yang aktif terus
                      selama hover). aria-hidden di sini karena screen
                      reader TIDAK BOLEH membaca ini huruf-per-huruf
                      ("A... F... F... A... N...") — teks asli yang utuh
                      sudah ada di aria-label pada <h1>, jadi ini murni
                      dekorasi visual bagi yang bisa melihat. */}
                  <span aria-hidden="true" className="inline-block">
                    {displayName.split('').map((character, characterIndex) => (
                      <motion.span
                        key={characterIndex}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.3 + characterIndex * 0.03,
                          ease: 'easeOut',
                        }}
                        className="inline-block"
                      >
                        {character === ' ' ? '\u00A0' : character}
                      </motion.span>
                    ))}
                  </span>
                </h1>
              )
            })()}
            <h2 className="font-mono uppercase text-sm md:text-base tracking-widest text-cyan-400/80">
              {profile?.role ?? translations.hero.roleFallback}
            </h2>

            {profile?.cv_url && (
              <MagneticButton className="mt-4">
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="glow-btn inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors"
                >
                  {translations.hero.downloadCv}
                </a>
              </MagneticButton>
            )}
          </div>
        </motion.div>

        {/* Kolom kanan: menu navigasi vertikal */}
        <nav aria-label="Main menu" className="flex flex-col">
          {menuItems.map((menuItem, menuItemIndex) => (
            <MenuButton
              key={menuItem.key}
              item={menuItem}
              index={menuItemIndex}
              label={translations.nav[menuItem.key]}
            />
          ))}
          <div className="pt-2 border-t border-white/10 mt-2 flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </motion.div>

      {/* Petunjuk scroll di bagian bawah — berdenyut pelan supaya
          menarik perhatian tanpa terlalu mengganggu. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-widest text-white/30"
      >
        {translations.hero.scrollHint}
      </motion.div>
    </section>
  )
}
