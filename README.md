# Portfolio — Elegan & Futuristik

Website portofolio dengan CMS tersembunyi, dibangun dengan Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, dan Supabase.

## PENTING: ZIP ini belum bisa langsung di-build

`node_modules` tidak disertakan di ZIP (ukurannya bisa ratusan MB dan environment
yang membuat file ini tidak punya akses internet untuk generate-nya). Kamu **wajib**
jalankan `npm install` dulu di lokal sebelum `npm run build` atau `npm run dev`.

## Langkah Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Supabase
1. Buat project baru di https://supabase.com
2. Buka **SQL Editor**, jalankan seluruh isi file `supabase/schema.sql`
   (ini akan membuat tabel `profile`, `projects`, `certificates`, RLS policy,
   dan satu baris data profile default).
3. Buka **Authentication → Users → Add User**, buat akun admin kamu sendiri
   (email + password), centang **Auto Confirm User**.

### 3. Environment Variables
Copy `.env.local.example` menjadi `.env.local`, lalu isi dengan kredensial
project Supabase kamu (Settings → API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://domain-kamu.vercel.app
```

**Wajib diisi setelah deploy:** `NEXT_PUBLIC_SITE_URL` dipakai untuk
canonical URL, Open Graph, `robots.txt`, dan `sitemap.xml`. Kalau tetap
kosong, semua itu jatuh ke placeholder `your-domain.vercel.app` — link
preview di WhatsApp/LinkedIn dan hasil Google akan salah/broken.

## Checklist migrasi SQL (urutan tidak masalah, tapi semua wajib dijalankan)

Kalau kamu sudah pernah setup Supabase sebelumnya, kamu HANYA perlu
menjalankan file yang belum pernah dijalankan. Kalau setup dari nol,
jalankan `schema.sql` dulu, baru sisanya sesuai urutan file di bawah.

- [ ] `supabase/schema.sql` — tabel dasar (profile, projects, certificates)
- [ ] `supabase/add_about_icon_image.sql` — tabel about_sections + bucket about-images
- [ ] `supabase/add_storage_buckets.sql` — bucket project-images, certificate-images
- [ ] `supabase/add_en_translation_columns.sql` — kolom _en untuk translate-on-write
- [ ] `supabase/create_avatars_bucket.sql` — **kritis**, bucket avatars sebelumnya tidak pernah dibuat, ini sebabnya foto Hero tidak muncul
- [ ] `supabase/add_whatsapp.sql` — kolom whatsapp_number di profile
- [ ] `supabase/add_cv_and_availability.sql` — kolom cv_url + is_available, bucket resume
- [ ] `supabase/add_skills_table.sql` — tabel skills (tech stack section)

## Fitur yang sudah dibangun tapi tidak pernah tersambung (baru diperbaiki)

- **Tech Stack / Skills section** — komponen publik (`SkillsSection.tsx`),
  halaman admin (`/secret-cmd/skills`), tipe data, dan dictionary
  terjemahan semuanya sudah ada, tapi `app/page.tsx` tidak pernah
  meng-import atau merender-nya, dan link ke `/secret-cmd/skills` tidak
  ada di navigasi admin — jadi halamannya cuma bisa diakses kalau kamu
  ketik URL manual. Sudah disambungkan: section tampil di antara About
  dan Projects, link nav publik "TECH_STACK" ditambahkan ke menu utama,
  link admin ditambahkan ke navigasi dashboard.
- **`is_featured` pada Project** — kolom ada di database dan tipe data,
  bahkan ikut dikirim saat submit form, tapi nilainya di-hardcode ke
  `initial?.is_featured ?? false` karena tidak ada checkbox di form —
  jadi tidak mungkin diubah dari UI. Ditambahkan checkbox di
  `ProjectForm.tsx`; proyek featured sekarang tampil lebih dulu di grid
  + badge "Featured" di kartunya.

## Tambahan lain

- **Scroll progress bar** — garis tipis di atas viewport yang mengikuti
  posisi scroll, pakai gradient aksen situs.
- **Copy-to-clipboard pada email** di Contact section — tombol kecil di
  pojok ikon email, tidak menggantikan `mailto:` (itu tetap jalan seperti
  biasa), cuma alternatif buat orang yang mau salin alamatnya saja.
- **Filter proyek berdasarkan tech stack** — chip filter muncul otomatis
  kalau proyek kamu punya lebih dari satu tech unik, diurutkan berdasarkan
  yang paling sering dipakai. Klik badge tech di kartu proyek juga
  langsung memfilter (tidak perlu scroll ke atas dulu).
- **Command palette (Ctrl/Cmd + K)** — navigasi cepat ke tiap section,
  ganti bahasa, atau buka admin panel tanpa mouse. Ada tombol "⌘K" di
  navbar (setelah scroll) untuk pengguna yang tidak tahu shortcut-nya
  atau pakai touchscreen.
- **Vercel Analytics** — otomatis aktif begitu di-deploy ke Vercel, tidak
  perlu setup tambahan, tidak ada cookie consent banner yang perlu
  ditambahkan (Vercel Analytics tidak pakai cookie).

## Bug regresi yang ditemukan & diperbaiki di revisi ini

- **Font kustom (Inter/Space Grotesk/JetBrains Mono) berhenti dimuat.**
  `tailwind.config.ts` mereferensikan CSS variable `--font-inter` dkk,
  tapi `app/layout.tsx` di suatu titik berhenti memanggil
  `next/font/google` untuk mendefinisikannya — kemungkinan terhapus tidak
  sengaja di edit sebelumnya. Akibatnya seluruh situs diam-diam fallback
  ke font default browser, bukan crash yang kelihatan. Sudah dikembalikan.

## Perbaikan bug pada revisi ini

1. **Settings Hero tidak berfungsi / avatar tidak muncul** — root cause:
   kode query ke tabel `profiles` (plural) di 4 tempat, padahal tabel asli
   di database bernama `profile` (singular, sesuai `schema.sql`). Semua
   query gagal diam-diam karena tidak ada pengecekan error. Sudah
   diperbaiki di `app/page.tsx` dan `app/secret-cmd/(protected)/page.tsx`,
   plus ditambahkan pesan error yang tampil di layar kalau ini terjadi lagi.
2. **Bucket `avatars` tidak pernah dibuat** — hanya disebut di komentar SQL
   lama. Upload foto profil selalu gagal di step storage meski bug #1
   sudah diperbaiki. Jalankan `create_avatars_bucket.sql`.
3. **Dua navbar tumpang tindih** — `Navbar.tsx` (versi lama, sudah
   digantikan `MorphingNavbar.tsx`) masih ikut dirender di `page.tsx`.
   Dihapus.
4. **Semua CRUD di admin panel (`/secret-cmd/*`) tidak menampilkan error**
   — insert/update/delete/load yang gagal sebelumnya tidak terlihat sama
   sekali oleh user. Sekarang setiap halaman admin menampilkan pesan error
   merah kalau ada operasi yang gagal.
5. **Icon-only link di Contact section tanpa `aria-label`** — GitHub,
   LinkedIn, Email tidak punya nama yang bisa diumumkan screen reader.
   Diperbaiki, sekaligus menambahkan WhatsApp.

## Yang ditambahkan (fitur baru, bukan perbaikan bug)

- **Kontak WhatsApp** — field baru di Settings, tampil di Contact section
  sebagai link `wa.me`.
- **Footer** — copyright otomatis (tahun berjalan) + tombol back-to-top.
- **`error.tsx`, `not-found.tsx`, `loading.tsx`** — konvensi Next.js App
  Router yang sebelumnya tidak ada sama sekali. Tanpa ini, error yang
  tidak tertangani menampilkan halaman crash generik Next.js, bukan
  sesuatu yang sesuai desain situs.
- **`icon.svg`** — favicon dasar (monogram `</>`). Ini placeholder generik
  — ganti dengan inisial/logo kamu sendiri kalau mau branding personal.

## Yang BELUM diperbaiki (tahu tapi di luar scope permintaan ini)

- Kontras warna teks `white/40`/`white/30` pada latar hitam kemungkinan
  besar gagal WCAG AA — perlu keputusan desain, bukan cuma perbaikan bug.
- `middleware.ts` — Next.js 16 memberi peringatan deprecation, menyarankan
  konvensi `proxy.ts`. Masih berfungsi normal, belum wajib diganti.

### 4. Jalankan secara lokal
```bash
npm run dev
```
Buka http://localhost:3000 untuk halaman public, dan
http://localhost:3000/secret-cmd untuk login admin (akan redirect ke
`/secret-cmd/login` kalau belum login).

### 5. Build untuk production
```bash
npm run build
npm run start
```

## Struktur Proyek

```
app/
├── page.tsx                          # Halaman public
├── layout.tsx                        # Root layout + font
├── globals.css                       # Tailwind + glassmorphism utilities
└── secret-cmd/
    ├── login/page.tsx                # Login admin (Supabase Auth)
    └── (protected)/                  # Route group, semua di-guard middleware+layout
        ├── layout.tsx                # Auth guard + navbar admin
        ├── page.tsx                  # Edit profil
        ├── projects/page.tsx         # CRUD projects
        └── certificates/page.tsx     # CRUD certificates
components/
├── sections/                         # Navbar, Hero, ProjectsGrid, dll (public)
└── admin/                            # ProjectForm, CertificateForm, LogoutButton
lib/
├── supabase/client.ts                # Browser client
├── supabase/server.ts                # Server client (RSC)
└── types.ts                          # TypeScript types
supabase/
└── schema.sql                        # Schema + RLS + seed data
middleware.ts                         # Refresh session token untuk /secret-cmd/*
```

## Catatan Keamanan

- Rute `/secret-cmd` dilindungi Supabase Auth (bukan sekadar disembunyikan dari
  navigasi) — tanpa login, semua sub-halaman redirect ke `/secret-cmd/login`.
- Row Level Security (RLS) aktif di semua tabel: publik hanya bisa **membaca**,
  hanya user yang login yang bisa insert/update/delete.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` aman untuk publik — keamanan datang dari RLS,
  bukan dari menyembunyikan key ini.
- Jangan commit `.env.local` ke git (sudah ada di `.gitignore`).

## Yang Belum Diimplementasikan (sengaja, di luar scope awal)

- Upload gambar langsung (saat ini pakai URL gambar manual — kalau mau upload
  file, perlu tambah Supabase Storage bucket + form file input).
- Reorder drag-and-drop untuk `display_order` (saat ini harus diedit manual
  lewat Table Editor Supabase atau ditambahkan sebagai fitur lanjutan).
- Edit certificate (saat ini hanya create + delete, belum ada update).
