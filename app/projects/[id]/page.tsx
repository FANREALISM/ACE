import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SITE_URL, buildPageMetadata, serializeJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/public'
import type { Project } from '@/lib/types'

/** Ambil satu proyek berdasarkan id. Return null (bukan throw) kalau
 *  tidak ditemukan — biar pemanggil yang putuskan mau notFound() atau
 *  penanganan lain. */
/** Halaman studi kasus di-cache (ISR), lihat catatan di app/page.tsx. */
export const revalidate = 60

/** Tanpa generateStaticParams, rute dinamis [id] dirender di setiap request
 *  (Cache-Control: no-store) walau `revalidate` diset. Dengan ini, semua
 *  studi kasus yang ada di-prerender saat build, dan proyek baru dibuat
 *  on-demand lalu di-cache (dynamicParams default = true). */
export async function generateStaticParams() {
  try {
    const { data } = await createPublicClient().from('projects').select('id')
    return (data ?? []).map((row: { id: string | number }) => ({ id: String(row.id) }))
  } catch {
    return []
  }
}

const getProjectById = cache(async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = createPublicClient()
  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle()
  return (projectRow as Project) ?? null
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: projectId } = await params
  const project = await getProjectById(projectId)
  if (!project) {
    return { title: 'Project Not Found', robots: { index: false, follow: false } }
  }

  // buildPageMetadata (lib/seo.ts) mengisi title, canonical, Open Graph
  // (siteName, locale) dan Twitter Card sekaligus. Gambar: gambar proyek
  // kalau ada, kalau tidak jatuh ke gambar OG situs. Sebelumnya proyek
  // TANPA gambar kehilangan og:image sama sekali — openGraph di level page
  // menimpa file convention opengraph-image.tsx milik layout.
  return buildPageMetadata({
    title: `${project.title} — Case Study`,
    description: project.description,
    path: `/projects/${projectId}`,
    type: 'article',
    image: project.image_url ?? undefined,
  })
}

// Baris label kecil untuk tiap bagian case study — dipisah jadi
// komponen kecil supaya markup section problem/approach/tradeoff/
// learnings konsisten tanpa duplikasi 4x.
function CaseStudySection({
  label,
  stepNumber,
  content,
}: {
  label: string
  stepNumber: string
  content: string | null
}) {
  // Section tidak dirender sama sekali kalau field-nya kosong — bukan
  // ditampilkan sebagai section kosong. Ini yang membuat case study
  // "opsional per bagian": admin bisa isi cuma Problem+Tradeoff tanpa
  // Approach, dan halaman tetap terlihat rapi tanpa celah kosong.
  if (!content) return null
  return (
    <div className="mb-10">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-400/70 mb-3">
        [ {stepNumber} {label} ]
      </p>
      <p className="text-white/70 text-lg leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </div>
  )
}

/**
 * Halaman case study tersendiri untuk satu proyek — cuma bisa diakses
 * kalau proyeknya ada DAN minimal satu field case study diisi. Diganti
 * dari pendekatan modal (yang dipakai Certificates) karena konten case
 * study cukup panjang untuk pantas punya URL sendiri yang bisa
 * dibagikan/di-bookmark.
 */
export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = await params
  const project = await getProjectById(projectId)

  if (!project) notFound()

  // Kalau tidak ada satupun field case study diisi, halaman ini tidak
  // seharusnya bisa diakses secara bermakna — daripada nampilin halaman
  // kosong, redirect balik ke kartu proyeknya di homepage lebih masuk
  // akal. notFound() dipakai di sini juga (bukan redirect) supaya URL
  // yang salah/proyek yang belum punya case study konsisten 404, bukan
  // silent redirect yang membingungkan.
  const hasCaseStudyContent =
    project.case_study_problem ||
    project.case_study_approach ||
    project.case_study_tradeoff ||
    project.case_study_learnings

  if (!hasCaseStudyContent) notFound()

  // JSON-LD CreativeWork — membantu Google memahami ini sebagai konten
  // portofolio/karya, bukan cuma halaman teks generik. Tidak render apa
  // pun secara visual.
  const pageUrl = `${SITE_URL}/projects/${projectId}`
  // @graph: CreativeWork (karya ini, ditautkan ke Person di halaman utama
  // lewat @id yang sama) + BreadcrumbList (Beranda › Proyek › judul) —
  // breadcrumb inilah yang tampil sebagai jejak di hasil pencarian Google.
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${pageUrl}#work`,
        name: project.title,
        description: project.description,
        url: pageUrl,
        image: project.image_url ?? undefined,
        keywords: project.tech_stack.join(', '),
        dateCreated: project.created_at,
        inLanguage: 'id-ID',
        author: { '@id': `${SITE_URL}/#person` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Proyek',
            item: `${SITE_URL}/#projects`,
          },
          { '@type': 'ListItem', position: 3, name: project.title, item: pageUrl },
        ],
      },
    ],
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen text-white focus-visible:outline-none"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-400 transition-colors mb-12"
        >
          <ArrowLeft size={16} /> Kembali ke Projects
        </Link>

        {project.image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 border border-white/10">
            {/* priority: ini gambar pertama & terbesar di halaman case
                study, jadi elemen LCP-nya — sama alasannya dengan avatar
                Hero di halaman utama. */}
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {project.title}
        </h1>
        <p className="text-white/60 text-lg mb-6">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-4 mb-16">
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm"
            >
              <ExternalLink size={15} /> Live Demo
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors text-sm"
            >
              <Github size={15} /> GitHub
            </a>
          )}
        </div>

        <div className="h-px bg-white/10 mb-12" />

        <CaseStudySection
          label="The Problem"
          stepNumber="01"
          content={project.case_study_problem}
        />
        <CaseStudySection
          label="The Approach"
          stepNumber="02"
          content={project.case_study_approach}
        />
        <CaseStudySection
          label="The Tradeoff"
          stepNumber="03"
          content={project.case_study_tradeoff}
        />
        <CaseStudySection
          label="What I'd Do Differently"
          stepNumber="04"
          content={project.case_study_learnings}
        />
      </div>
    </main>
  )
}
