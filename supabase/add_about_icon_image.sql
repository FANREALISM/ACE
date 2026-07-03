-- ============================================
-- Tambah kolom icon + image_url ke about_sections
-- Jalankan di Supabase SQL Editor.
-- ============================================

alter table about_sections
  add column if not exists icon text default 'Cpu',
  add column if not exists image_url text;

-- Bucket untuk gambar section About
insert into storage.buckets (id, name, public)
values ('about-images', 'about-images', true)
on conflict (id) do nothing;

create policy "Public read about-images"
  on storage.objects for select
  using (bucket_id = 'about-images');

create policy "Auth write about-images"
  on storage.objects for insert
  with check (bucket_id = 'about-images' and auth.role() = 'authenticated');

create policy "Auth update about-images"
  on storage.objects for update
  using (bucket_id = 'about-images' and auth.role() = 'authenticated');

create policy "Auth delete about-images"
  on storage.objects for delete
  using (bucket_id = 'about-images' and auth.role() = 'authenticated');
