-- ============================================
-- TABLE: timeline_entries — Timeline Karir & Pendidikan.
-- Jalankan di Supabase SQL Editor. Aman dijalankan ulang (idempotent).
-- ============================================

create table if not exists timeline_entries (
  id uuid primary key default gen_random_uuid(),
  -- text + CHECK dipilih daripada enum Postgres: menambah tipe baru nanti
  -- (mis. 'volunteer') cukup ubah constraint, tanpa ALTER TYPE.
  type text not null check (type in ('career', 'education')),
  title text not null,
  organization text not null,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text,
  icon text not null default 'Briefcase',
  created_at timestamptz not null default now(),

  -- Entri yang masih berlangsung tidak boleh punya end_date, dan end_date
  -- (kalau ada) tidak boleh sebelum start_date. Divalidasi juga di form,
  -- tapi constraint DB adalah pagar terakhir kalau data diubah lewat
  -- Table Editor.
  constraint timeline_current_has_no_end_date
    check (not (is_current and end_date is not null)),
  constraint timeline_end_after_start
    check (end_date is null or end_date >= start_date)
);

-- Halaman publik selalu mengurutkan berdasarkan start_date terbaru dulu.
create index if not exists timeline_entries_start_date_idx
  on timeline_entries (start_date desc);

alter table timeline_entries enable row level security;

drop policy if exists "Public read timeline_entries" on timeline_entries;
create policy "Public read timeline_entries"
  on timeline_entries for select using (true);

drop policy if exists "Auth write timeline_entries" on timeline_entries;
create policy "Auth write timeline_entries"
  on timeline_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
