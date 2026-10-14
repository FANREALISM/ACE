/**
 * Template App Router — berbeda dari layout, template di-mount ulang di
 * SETIAP navigasi antar-route (mis. home → /projects/[id]), jadi
 * animasi masuk ini jalan tiap pindah halaman, bukan cuma sekali.
 *
 * Fade-in dibuat lewat CSS (.page-enter di globals.css), bukan Framer
 * Motion: CSS animation berjalan di HTML hasil server tanpa menunggu
 * JavaScript, jadi tidak menunda First Paint/LCP dan tidak ada konten
 * "kosong" sebelum hydrate. Hanya opacity (tanpa transform) supaya
 * elemen position:fixed di dalamnya (navbar, progress bar) tidak
 * kehilangan acuan posisinya.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
