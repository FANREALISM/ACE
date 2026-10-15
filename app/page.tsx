import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type {
  Profile,
  Project,
  AboutSection,
  Certificate,
  Skill,
  TimelineEntry,
} from '@/lib/types'
import MorphingNavbar from '@/components/sections/MorphingNavbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Timeline from '@/components/sections/Timeline'
import SkillsSection from '@/components/sections/SkillsSection'
import ProjectsGrid from '@/components/sections/ProjectsGrid'
import CertificatesSection from '@/components/sections/CertificatesSection'
import Contact from '@/components/sections/Contact'
import Footer, { type ActivityItem } from '@/components/sections/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import {
  SEO_DEFAULTS,
  SITE_URL,
  buildPageMetadata,
  serializeJsonLd,
} from '@/lib/seo'

/** Ambil semua data yang dibutuhkan halaman utama dalam satu batch
 *  paralel (Promise.all) — lebih cepat daripada fetch berurutan satu-
 *  satu, karena keenam query jalan bersamaan, bukan menunggu giliran. */
async function getData() {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: projects },
    { data: aboutSections },
    { data: certificates },
    { data: skills },
    { data: timelineEntries },
  ] = await Promise.all([
    supabase.from('profile').select('*').maybeSingle(),
    supabase.from('projects').select('*').order('display_order'),
    supabase.from('about_sections').select('*').order('display_order'),
    supabase.from('certificates').select('*').order('display_order'),
    supabase.from('skills').select('*').order('display_order'),
    // Terbaru dulu; created_at sebagai tie-breaker supaya urutan entri
    // dengan start_date sama tetap deterministik.
    supabase
      .from('timeline_entries')
      .select('*')
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  return {
    profile: (profile as Profile) ?? null,
    projects: (projects as Project[]) ?? [],
    aboutSections: (aboutSections as AboutSection[]) ?? [],
    certificates: (certificates as Certificate[]) ?? [],
    skills: (skills as Skill[]) ?? [],
    timelineEntries: (timelineEntries as TimelineEntry[]) ?? [],
  }
}

/**
 * Metadata dinamis (title, description, Open Graph, Twitter Card) yang
 * dihasilkan dari data profile sesungguhnya, bukan teks statis hardcode.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getData()

  const pageTitle = profile
    ? `${profile.name} — ${profile.role}`
    : SEO_DEFAULTS.defaultTitle
  const pageDescription =
    profile?.short_description ?? SEO_DEFAULTS.description

  // images sengaja TIDAK diisi di sini — app/opengraph-image.tsx (file
  // convention Next.js) generate gambar 1200x630 khusus dari nama+role,
  // bukan cuma crop foto profil jadi kotak. Kalau images diisi manual di
  // sini, itu akan override file convention tersebut sepenuhnya (metadata
  // eksplisit menang atas convention), jadi template OG-nya tidak akan
  // pernah kepakai.
  // openGraph di page MENGGANTI (bukan merge) openGraph di layout, jadi
  // objek lengkap dibangun lewat helper bersama.
  return buildPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: '/',
    absoluteTitle: true,
  })
}

/** Halaman utama portofolio — merangkai semua section publik secara
 *  berurutan, plus JSON-LD structured data untuk SEO dan strip aktivitas
 *  terbaru di Footer. */
export default async function Home() {
  const {
    profile,
    projects,
    aboutSections,
    certificates,
    skills,
    timelineEntries,
  } = await getData()

  // "Recently added" pakai created_at yang sudah ada — bukan "terakhir
  // diupdate" (tidak ada kolom updated_at, dan mengklaim itu tanpa
  // trigger yang benar-benar melacak edit akan menyesatkan). Gabung
  // projects+certificates, urutkan desc, ambil 3 teratas.
  const recentActivity: ActivityItem[] = [
    ...projects.map((project) => ({
      type: 'project' as const,
      title: project.title,
      date: project.created_at,
    })),
    ...certificates.map((certificate) => ({
      type: 'certificate' as const,
      title: certificate.title,
      date: certificate.created_at,
    })),
  ]
    .sort(
      (activityA, activityB) =>
        new Date(activityB.date).getTime() - new Date(activityA.date).getTime()
    )
    .slice(0, 3)

  const personStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: profile?.name ?? SEO_DEFAULTS.siteName,
        jobTitle: profile?.role,
        description: profile?.short_description,
        url: SITE_URL,
        image: profile?.avatar_url ?? undefined,
        sameAs: [profile?.github_url, profile?.linkedin_url].filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SEO_DEFAULTS.siteName,
        inLanguage: ['id-ID', 'en-US'],
        publisher: { '@id': `${SITE_URL}/#person` },
      },
    ],
  }

  return (
    <>
      <ScrollProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(personStructuredData),
        }}
      />
      <MorphingNavbar profile={profile} />
      <main id="main-content">
        <Hero profile={profile} />
        <About sections={aboutSections} />
        <Timeline entries={timelineEntries} />
        <SkillsSection skills={skills} />
        <ProjectsGrid projects={projects} />
        <CertificatesSection certificates={certificates} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} recentActivity={recentActivity} />
    </>
  )
}
