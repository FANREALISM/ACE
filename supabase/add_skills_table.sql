-- ============================================
-- TABLE: skills — Tech Stack section, dikelola dari admin panel.
-- Terpisah dari tech_stack di projects: itu tag per-proyek, ini daftar
-- kemampuan keseluruhan yang ditampilkan sebagai section sendiri —
-- lebih mudah di-scan recruiter dibanding menggali dari tiap project card.
-- ============================================

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'Code2',
  category text,
  display_order int default 0,
  created_at timestamptz default now()
);

alter table skills enable row level security;

create policy "Public read skills" on skills for select using (true);

create policy "Auth write skills" on skills for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
