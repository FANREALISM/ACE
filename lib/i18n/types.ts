export type Locale = 'id' | 'en'

export interface Dictionary {
  nav: {
    startJourney: string
    loadProjects: string
    achievements: string
    systemAdmin: string
  }
  hero: {
    roleFallback: string
    ctaButton: string
    scrollHint: string
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
