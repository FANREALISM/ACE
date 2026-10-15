export type Locale = 'id' | 'en'

/** Struktur lengkap kamus terjemahan — id.ts dan en.ts harus punya
 *  bentuk yang PERSIS SAMA (TypeScript memaksa ini lewat structural
 *  typing terhadap interface ini; kalau salah satu file kurang/lebih
 *  key, tsc akan error saat build, bukan diam-diam lolos). */
export interface Dictionary {
  nav: {
    startJourney: string
    loadProjects: string
    achievements: string
    systemAdmin: string
    techStack: string
    timeline: string
    contact: string
  }
  hero: {
    roleFallback: string
    scrollHint: string
    availableBadge: string
    unavailableBadge: string
    downloadCv: string
  }
  timeline: {
    label: string
    heading: string
    headingAccent: string
    career: string
    education: string
    present: string
  }
  skills: {
    heading: string
    headingAccent: string
  }
  about: {
    label: string
    heading: string
    headingAccent: string
    empty: string
  }
  projects: {
    heading: string
    headingAccent: string
    empty: string
    liveDemo: string
    github: string
    featured: string
    allFilter: string
  }
  certificates: {
    heading: string
    headingAccent: string
    viewCredential: string
  }
  contact: {
    heading: string
    headingAccent: string
  }
}
