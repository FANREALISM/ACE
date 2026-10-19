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
    techStack: 'TECH_STACK',
    timeline: 'TIMELINE',
    contact: 'CONTACT',
  },
  navbar: {
    about: 'About',
    timeline: 'Timeline',
    skills: 'Skills',
    projects: 'Projects',
    certificates: 'Certificates',
    contact: 'Contact',
    mainNav: 'Main navigation',
    skipToContent: 'Skip to main content',
    backToTop: 'Back to top',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    search: 'Search & quick commands',
  },
  hero: {
    roleFallback: 'SOFTWARE ENGINEER',
    scrollHint: 'scroll ↓',
    availableBadge: 'Available for work',
    unavailableBadge: 'Not taking new projects',
    downloadCv: 'Download CV',
  },
  timeline: {
    label: 'TIMELINE_LOG',
    heading: 'Career &',
    headingAccent: 'Education',
    career: 'Career',
    education: 'Education',
    present: 'Present',
    showMore: 'Show More',
    showLess: 'Show Less',
  },
  skills: {
    heading: 'Tech',
    headingAccent: 'Stack',
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
    featured: 'Featured',
    allFilter: 'All',
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
