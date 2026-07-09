-- ============================================
-- CV/Resume download + status "Available for Work" di Hero.
-- ============================================

alter table profile
  add column if not exists cv_url text,
  add column if not exists is_available boolean not null default true;

-- Bucket untuk file CV (PDF). Terpisah dari bucket gambar karena tipe
-- filenya beda dan tidak perlu di-resize/optimize seperti gambar.
insert into storage.buckets (id, name, public)
values ('resume', 'resume', true)
on conflict (id) do nothing;

create policy "Public read resume"
  on storage.objects for select
  using (bucket_id = 'resume');

create policy "Auth write resume"
  on storage.objects for insert
  with check (bucket_id = 'resume' and auth.role() = 'authenticated');

create policy "Auth update resume"
  on storage.objects for update
  using (bucket_id = 'resume' and auth.role() = 'authenticated');

create policy "Auth delete resume"
  on storage.objects for delete
  using (bucket_id = 'resume' and auth.role() = 'authenticated');
