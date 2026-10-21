import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Token Admin Console (lihat app/secret-cmd/admin.css). Memakai
      // CSS variable berformat "R G B" supaya modifier alpha Tailwind
      // (mis. border-adm-cyan/40) bekerja. Sengaja TERPISAH dari warna
      // bawaan Tailwind: override tema terang di globals.css hanya
      // menyasar kelas text-white/*, bg-black/* dst., sehingga admin
      // selalu gelap walau pengunjung publik memakai tema terang.
      colors: {
        adm: {
          bg: 'rgb(var(--adm-bg) / <alpha-value>)',
          panel: 'rgb(var(--adm-panel) / <alpha-value>)',
          text: 'rgb(var(--adm-text) / <alpha-value>)',
          muted: 'rgb(var(--adm-muted) / <alpha-value>)',
          dim: 'rgb(var(--adm-dim) / <alpha-value>)',
          line: 'rgb(var(--adm-line) / <alpha-value>)',
          cyan: 'rgb(var(--adm-cyan) / <alpha-value>)',
          green: 'rgb(var(--adm-green) / <alpha-value>)',
          amber: 'rgb(var(--adm-amber) / <alpha-value>)',
          red: 'rgb(var(--adm-red) / <alpha-value>)',
          violet: 'rgb(var(--adm-violet) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-space-grotesk)'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    // Varian tema UI. <html data-ui="game"> adalah leluhur semua elemen,
    // jadi `game:` cukup menulis [data-ui="game"] sebagai selector leluhur:
    //   className="rounded-2xl game:rounded-none game:uppercase"
    // Tidak ada ternary di JSX, tidak ada prop theme yang diteruskan, dan
    // komponen server pun bisa memakainya (murni CSS).
    plugin(({ addVariant }) => {
      addVariant('game', '[data-ui="game"] &')
      addVariant('terminal', '[data-ui="terminal"] &')
    }),
  ],
}
export default config
