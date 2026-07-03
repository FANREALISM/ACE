import type { Dictionary } from './i18n/types'

export interface MenuItem {
  key: keyof Dictionary['nav']
  href: string
  isAnchor: boolean
}

export const menuItems: MenuItem[] = [
  { key: 'startJourney', href: '#about', isAnchor: true },
  { key: 'loadProjects', href: '#projects', isAnchor: true },
  { key: 'achievements', href: '#certificates', isAnchor: true },
  { key: 'systemAdmin', href: '/secret-cmd', isAnchor: false },
]

