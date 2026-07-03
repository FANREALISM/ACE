import type { Dictionary } from './types'

// English dictionary — static UI strings only.
// Dynamic content (about/projects/certificates from Supabase) is NOT
// translated here. See i18n/README.md.
const en: Dictionary = {
  nav: {
    startJourney: 'START_JOURNEY',
    loadProjects: 'LOAD_PROJECTS',
    achievements: 'ACHIEVEMENTS',
    systemAdmin: 'SYSTEM_ADMIN',
  },
  hero: {
    roleFallback: 'SOFTWARE ENGINEER',
    ctaButton: 'View My Projects',
    scrollHint: 'scroll ↓',
  },
  about: {
    label: 'Profile',
    heading: 'About',
    headingAccent: 'Me',
    empty: 'No content yet.',
  },
  projects: {
    heading: 'My',
    headingAccent: 'Projects',
    empty: 'No projects added yet.',
    liveDemo: 'Live Demo',
    github: 'GitHub',
  },
  certificates: {
    heading: 'Certificates &',
    headingAccent: 'Achievements',
    viewCredential: 'View Credential',
  },
  contact: {
    heading: "Let's",
    headingAccent: 'Connect',
  },
}

export default en
