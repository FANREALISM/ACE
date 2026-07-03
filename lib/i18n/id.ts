import type { Dictionary } from './types'

// Kamus Bahasa Indonesia — hanya string UI statis.
// Konten dinamis (about/projects/certificates dari Supabase) TIDAK
// diterjemahkan di sini. Lihat catatan di i18n/README.md.
const id: Dictionary = {
  nav: {
    startJourney: 'START_JOURNEY',
    loadProjects: 'LOAD_PROJECTS',
    achievements: 'ACHIEVEMENTS',
    systemAdmin: 'SYSTEM_ADMIN',
  },
  hero: {
    roleFallback: 'SOFTWARE ENGINEER // REKAYASA PERANGKAT LUNAK',
    ctaButton: 'Lihat Proyek Saya',
    scrollHint: 'scroll ↓',
  },
  about: {
    label: 'Profile',
    heading: 'Tentang',
    headingAccent: 'Saya',
    empty: 'Belum ada konten.',
  },
  projects: {
    heading: 'Proyek',
    headingAccent: 'Saya',
    empty: 'Belum ada proyek ditambahkan.',
    liveDemo: 'Live Demo',
    github: 'GitHub',
  },
  certificates: {
    heading: 'Sertifikat &',
    headingAccent: 'Pencapaian',
    viewCredential: 'Lihat Kredensial',
  },
  contact: {
    heading: 'Mari',
    headingAccent: 'Terhubung',
  },
}

export default id
