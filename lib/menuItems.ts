export interface MenuItem {
  label: string
  href: string
  isAnchor: boolean
}

export const menuItems: MenuItem[] = [
  { label: 'START_JOURNEY', href: '#about', isAnchor: true },
  { label: 'LOAD_PROJECTS', href: '#projects', isAnchor: true },
  { label: 'ACHIEVEMENTS', href: '#certificates', isAnchor: true },
  { label: 'SYSTEM_ADMIN', href: '/secret-cmd', isAnchor: false },
]
