-- ============================================
-- Bucket 'avatars' — dipakai AvatarUpload.tsx untuk foto profil Hero.
-- Sebelumnya cuma disebut di komentar SQL, tidak pernah benar-benar
-- dibuat. Ini yang menyebabkan upload foto Hero gagal diam-diam.
-- ============================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Auth write avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Auth update avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Auth delete avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
