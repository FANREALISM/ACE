-- ============================================
-- Storage buckets untuk upload gambar lokal
-- (Project images, Certificate images)
-- Jalankan di Supabase SQL Editor.
-- Kalau bucket 'avatars' belum pernah dibuat, buat juga manual lewat
-- Dashboard > Storage > New Bucket (public) sebelum ini, atau uncomment
-- baris insert 'avatars' di bawah.
-- ============================================

insert into storage.buckets (id, name, public)
values
  ('project-images', 'project-images', true),
  ('certificate-images', 'certificate-images', true)
on conflict (id) do nothing;

-- Public boleh READ (supaya gambar tampil di halaman public tanpa login)
create policy "Public read project-images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Public read certificate-images"
  on storage.objects for select
  using (bucket_id = 'certificate-images');

-- Hanya user login (admin) yang boleh upload/replace/hapus
create policy "Auth write project-images"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "Auth update project-images"
  on storage.objects for update
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "Auth delete project-images"
  on storage.objects for delete
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "Auth write certificate-images"
  on storage.objects for insert
  with check (bucket_id = 'certificate-images' and auth.role() = 'authenticated');

create policy "Auth update certificate-images"
  on storage.objects for update
  using (bucket_id = 'certificate-images' and auth.role() = 'authenticated');

create policy "Auth delete certificate-images"
  on storage.objects for delete
  using (bucket_id = 'certificate-images' and auth.role() = 'authenticated');
