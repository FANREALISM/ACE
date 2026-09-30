-- ============================================
-- Case study fields untuk project — SEMUA OPSIONAL. Untuk 1-2 proyek
-- unggulan yang mau kamu tulis lebih dalam (problem/approach/tradeoff/
-- learnings), bukan wajib diisi untuk setiap proyek.
-- ============================================

alter table projects
  add column if not exists case_study_problem text,
  add column if not exists case_study_approach text,
  add column if not exists case_study_tradeoff text,
  add column if not exists case_study_learnings text;
