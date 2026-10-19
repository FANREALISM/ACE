import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/seo'

/**
 * sitemap.xml via Next.js metadata route convention.
 *
 * Isi: halaman utama + SETIAP halaman case study yang benar-benar ada.
 * Versi lama hanya memuat halaman utama, jadi halaman /projects/[id] —
 * konten yang paling "dalam" dan paling cocok untuk pencarian spesifik —
 * hanya bisa ditemukan lewat tautan, tidak lewat sitemap.
 *
 * Hanya proyek yang punya isi case study yang dimasukkan: halaman
 * /projects/[id] memanggil notFound() kalau keempat kolom case study
 * kosong, dan sitemap yang memuat URL 404 dihitung sebagai error oleh
 * Google Search Console.
 *
 * lastModified halaman utama sengaja tidak diisi: `new Date()` (versi
 * lama) berarti "berubah setiap kali sitemap diminta" — klaim palsu yang
 * membuat Google berhenti mempercayai lastmod situs ini.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    changeFrequency: 'monthly',
    priority: 1,
  }

  try {
    const supabase = await createClient()
    const { data: projectRows, error } = await supabase
      .from('projects')
      .select(
        'id, created_at, case_study_problem, case_study_approach, case_study_tradeoff, case_study_learnings'
      )
    if (error || !projectRows) return [homeEntry]

    const projectEntries: MetadataRoute.Sitemap = projectRows
      .filter(
        (projectRow) =>
          projectRow.case_study_problem ||
          projectRow.case_study_approach ||
          projectRow.case_study_tradeoff ||
          projectRow.case_study_learnings
      )
      .map((projectRow) => ({
        url: `${SITE_URL}/projects/${projectRow.id}`,
        lastModified: projectRow.created_at
          ? new Date(projectRow.created_at)
          : undefined,
        changeFrequency: 'yearly' as const,
        priority: 0.7,
      }))

    return [homeEntry, ...projectEntries]
  } catch {
    // Database tidak terjangkau saat sitemap diminta: tetap sajikan sitemap
    // valid (halaman utama) daripada 500 yang membuat crawler mundur.
    return [homeEntry]
  }
}
