import { createClient } from '@/lib/supabase/server'
import Hero from '@/components/sections/Hero'
import MorphingNavbar from '@/components/sections/MorphingNavbar'
import About from '@/components/sections/About'
import ProjectsGrid from '@/components/sections/ProjectsGrid'
import CertificatesSection from '@/components/sections/CertificatesSection'
import Contact from '@/components/sections/Contact'
import type { Profile, Project, Certificate, AboutSection } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  // try/catch: kalau Supabase down atau env var salah, halaman tetap render
  // dengan data kosong/default alih-alih crash total (white screen).
  let profile: Profile | null = null
  let projects: Project[] = []
  let certificates: Certificate[] = []
  let aboutSections: AboutSection[] = []

  try {
    const [profileRes, projectsRes, certificatesRes, aboutRes] =
      await Promise.all([
        supabase.from('profile').select('*').limit(1).maybeSingle(),
        supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('certificates')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('about_sections')
          .select('*')
          .order('display_order', { ascending: true }),
      ])

    profile = profileRes.data
    projects = projectsRes.data ?? []
    certificates = certificatesRes.data ?? []
    aboutSections = aboutRes.data ?? []
  } catch (err) {
    console.error('Gagal fetch data dari Supabase:', err)
  }

  return (
    <main>
      <MorphingNavbar profile={profile} />
      <Hero profile={profile} />
      <About sections={aboutSections} />
      <ProjectsGrid projects={projects} />
      <CertificatesSection certificates={certificates} />
      <Contact profile={profile} />
    </main>
  )
}