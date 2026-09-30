export interface Profile {
  id: string
  name: string
  role: string
  short_description: string
  long_description: string | null
  avatar_url: string | null
  avatar_size: 'sm' | 'md' | 'lg' | 'xl'
  github_url: string | null
  linkedin_url: string | null
  email: string | null
  whatsapp_number: string | null
  cv_url: string | null
  is_available: boolean
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

export interface Project {
  id: string
  title: string
  title_en: string | null
  description: string
  description_en: string | null
  image_url: string | null
  project_url: string | null
  github_url: string | null
  tech_stack: string[]
  is_featured: boolean
  display_order: number
  created_at: string
  // Case study — semua opsional. Kartu proyek menampilkan tombol "Read
  // Case Study" hanya kalau MINIMAL SATU field ini diisi, bukan
  // mewajibkan keempatnya. Dipisah dari `description` (yang tetap
  // ringkasan pendek di kartu) karena ini konten panjang untuk halaman
  // /projects/[id] tersendiri, bukan untuk ditampilkan di grid.
  case_study_problem: string | null
  case_study_approach: string | null
  case_study_tradeoff: string | null
  case_study_learnings: string | null
}

export interface AboutSection {
  id: string
  title: string
  content: string
  content_en: string | null
  icon: string
  image_url: string | null
  display_order: number
  created_at: string
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  issue_date: string | null
  expiry_date: string | null
  credential_id: string | null
  credential_url: string | null
  image_url: string | null
  display_order: number
  created_at: string
}

export interface Skill {
  id: string
  name: string
  icon: string
  category: string | null
  display_order: number
  created_at: string
}