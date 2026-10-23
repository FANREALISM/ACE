import {
  Cpu,
  Code2,
  Terminal,
  Rocket,
  Layers,
  Database,
  Gamepad2,
  Sparkles,
  GraduationCap,
  Award,
  Zap,
  Blocks,
  Brain,
  Globe,
  Wrench,
  Braces,
  Server,
  Cloud,
  GitBranch,
  Box,
  Palette,
  Smartphone,
  Briefcase,
  Building2,
  Laptop,
  BookOpen,
  School,
  Users,
  Trophy,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'

/**
 * Daftar ikon yang BOLEH dipakai di halaman publik (About, Skills, Timeline).
 *
 * KENAPA ADA FILE INI: `import * as Icons from 'lucide-react'` lalu mencari
 * ikon lewat nama string (Icons[name]) membuat bundler tidak bisa
 * tree-shake — seluruh ~3.400 ikon Lucide ikut dikirim ke browser (±130 KB
 * gzip, 99,9 persen tidak terpakai; terukur di Lighthouse "unused
 * JavaScript"). Dengan peta eksplisit ini hanya ikon yang tercantum yang
 * terkirim.
 *
 * Isinya = gabungan opsi icon picker di admin (AboutSectionForm, SkillForm,
 * TimelineForm). Kalau Anda menambah opsi ikon di picker admin, tambahkan
 * juga di sini; nama yang tidak ada di peta ini jatuh ke ikon fallback.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  Cpu,
  Code2,
  Terminal,
  Rocket,
  Layers,
  Database,
  Gamepad2,
  Sparkles,
  GraduationCap,
  Award,
  Zap,
  Blocks,
  Brain,
  Globe,
  Wrench,
  Braces,
  Server,
  Cloud,
  GitBranch,
  Box,
  Palette,
  Smartphone,
  Briefcase,
  Building2,
  Laptop,
  BookOpen,
  School,
  Users,
  Trophy,
  ChevronDown,
}

/** Cari ikon dari nama string di database; `fallback` bila tidak dikenali. */
export function getIcon(iconName: string, fallback: LucideIcon): LucideIcon {
  return ICON_MAP[iconName] ?? fallback
}

export { Briefcase, ChevronDown, Code2, Cpu, GraduationCap }
