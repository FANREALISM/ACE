-- ============================================
-- Pesan dari contact form publik. INSERT terbuka untuk siapa saja
-- (pengunjung tidak login) — itu memang tujuannya, form publik. SELECT/
-- UPDATE/DELETE cuma untuk admin yang sudah login, supaya orang lain
-- tidak bisa baca pesan yang masuk lewat REST API langsung.
-- ============================================

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;

create policy "Public insert contact_messages"
  on contact_messages for insert
  with check (true);

create policy "Auth read contact_messages"
  on contact_messages for select
  using (auth.role() = 'authenticated');

create policy "Auth update contact_messages"
  on contact_messages for update
  using (auth.role() = 'authenticated');

create policy "Auth delete contact_messages"
  on contact_messages for delete
  using (auth.role() = 'authenticated');
