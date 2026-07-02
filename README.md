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
```

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
