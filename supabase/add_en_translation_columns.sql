-- ============================================
-- Kolom terjemahan EN untuk translate-on-write.
-- Kolom asli (bahasa Indonesia) tidak berubah — ini kolom TAMBAHAN,
-- diisi lewat tombol "Auto-translate to EN" di admin panel, atau manual.
-- Nullable: kalau kosong, frontend fallback ke teks Indonesia.
-- ============================================

alter table about_sections
  add column if not exists content_en text;

alter table projects
  add column if not exists title_en text,
  add column if not exists description_en text;
