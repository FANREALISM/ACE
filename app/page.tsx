import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Project, AboutSection, Certificate, Skill } from '@/lib/types'
import MorphingNavbar from '@/components/sections/MorphingNavbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import SkillsSection from '@/components/sections/SkillsSection'
import ProjectsGrid from '@/components/sections/ProjectsGrid'
import CertificatesSection from '@/components/sections/CertificatesSection'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'

async function getData() {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: projects },
    { data: about },
    { data: certificates },
    { data: skills },
  ] = await Promise.all([
    supabase.from('profile').select('*').maybeSingle(),
    supabase.from('projects').select('*').order('display_order'),
    supabase.from('about_sections').select('*').order('display_order'),
    supabase.from('certificates').select('*').order('display_order'),
    supabase.from('skills').select('*').order('display_order'),
  ])

  return {
    profile: (profile as Profile) ?? null,
    projects: (projects as Project[]) ?? [],
    about: (about as AboutSection[]) ?? [],
    certificates: (certificates as Certificate[]) ?? [],
    skills: (skills as Skill[]) ?? [],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getData()

  const title = profile ? `${profile.name} — ${profile.role}` : 'Portfolio'
  const description = profile?.short_description ?? 'Personal portfolio website.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile?.avatar_url ? [profile.avatar_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profile?.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

export default async function Home() {
  const { profile, projects, about, certificates, skills } = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile?.name,
    jobTitle: profile?.role,
    description: profile?.short_description,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    sameAs: [profile?.github_url, profile?.linkedin_url].filter(Boolean),
  }

  return (
    <>
      <ScrollProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MorphingNavbar profile={profile} />
      <main id="main-content">
        <Hero profile={profile} />
        <About sections={about} />
        <SkillsSection skills={skills} />
        <ProjectsGrid projects={projects} />
        <CertificatesSection certificates={certificates} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  )
}