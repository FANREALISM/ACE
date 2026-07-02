-- ============================================
-- TABLE: profile (single row, data hero section)
-- ============================================
create table profile (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  short_description text not null,
  long_description text,
  avatar_url text,
  github_url text,
  linkedin_url text,
  email text,
  updated_at timestamptz default now()
);

-- ============================================
-- TABLE: projects
-- ============================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  project_url text,
  github_url text,
  tech_stack text[] not null default '{}',
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- TABLE: certificates
-- ============================================
create table certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issue_date date,
  credential_url text,
  image_url text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- RLS
-- ============================================
alter table profile enable row level security;
alter table projects enable row level security;
alter table certificates enable row level security;

create policy "Public read profile" on profile for select using (true);
create policy "Public read projects" on projects for select using (true);
create policy "Public read certificates" on certificates for select using (true);

create policy "Auth write profile" on profile for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth write projects" on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth write certificates" on certificates for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================
-- Seed data (WAJIB dijalankan sebelum test halaman public,
-- karena app/page.tsx pakai .single() pada tabel profile)
-- ============================================
insert into profile (name, role, short_description, github_url, linkedin_url, email)
values (
  'Nama Kamu',
  'Full-Stack Developer & UI/UX Designer',
  'Membangun pengalaman digital yang elegan dan futuristik.',
  'https://github.com/username',
  'https://linkedin.com/in/username',
  'email@kamu.com'
);
