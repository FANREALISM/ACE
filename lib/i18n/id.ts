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
    techStack: 'TECH_STACK',
    timeline: 'TIMELINE',
  },
  hero: {
    roleFallback: 'SOFTWARE ENGINEER // REKAYASA PERANGKAT LUNAK',
    scrollHint: 'scroll ↓',
    availableBadge: 'Terbuka untuk kerja',
    unavailableBadge: 'Sedang tidak menerima proyek',
    downloadCv: 'Unduh CV',
  },
  timeline: {
    label: 'TIMELINE_LOG',
    heading: 'Karir &',
    headingAccent: 'Pendidikan',
    career: 'Karir',
    education: 'Pendidikan',
    present: 'Sekarang',
  },
  skills: {
    heading: 'Tech',
    headingAccent: 'Stack',
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
    featured: 'Unggulan',
    allFilter: 'Semua',
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
