-- ============================================
-- Ukuran foto profil Hero bisa diatur dari admin panel (Small/Medium/
-- Large/Extra Large) alih-alih hardcode di kode. Default 'md' supaya
-- situs yang sudah jalan tidak berubah tampilannya sampai diatur ulang.
-- ============================================

alter table profile
  add column if not exists avatar_size text not null default 'md';

-- Batasi ke nilai yang benar-benar dipetakan di Hero.tsx — mencegah
-- nilai sampah tersimpan kalau ada bug di form admin nanti.
alter table profile
  add constraint profile_avatar_size_check
  check (avatar_size in ('sm', 'md', 'lg', 'xl'));
