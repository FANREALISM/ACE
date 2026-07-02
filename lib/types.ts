export interface Profile {
  id: string
  name: string
  role: string
  short_description: string
  long_description: string | null
  avatar_url: string | null
  github_url: string | null
  linkedin_url: string | null
  email: string | null
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  image_url: string | null
  project_url: string | null
  github_url: string | null
  tech_stack: string[]
  is_featured: boolean
  display_order: number
  created_at: string
}

export interface AboutSection {
  id: string
  title: string
  content: string
  display_order: number
  created_at: string
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  issue_date: string | null
  credential_url: string | null
  image_url: string | null
  display_order: number
  created_at: string
}