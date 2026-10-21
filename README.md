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
- [ ] `supabase/add_avatar_size.sql` — kolom avatar_size di profile (Small/Medium/Large/XL)
- [ ] `supabase/add_certificate_expiry_credential_id.sql` — expiry_date + credential_id di certificates
- [ ] `supabase/add_case_study_fields.sql` — 4 kolom opsional case study di projects
- [ ] `supabase/add_contact_messages.sql` — tabel contact_messages (form kontak publik)
- [ ] `supabase/add_timeline_entries.sql` — tabel timeline_entries (Timeline Karir & Pendidikan)

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

## Revisi "lebih lega" (lebih banyak ruang kosong)

Permintaan sebelumnya ("rapikan UI") ternyata soal kepadatan visual, bukan
bug — jadi ini murni perubahan spacing, tidak ada logika yang berubah:

- Padding vertikal tiap section: `py-24` → `py-32`
- Jarak antar card di grid (Projects/Certificates): `gap-6` → `gap-8`
- Padding dalam card: `p-5` → `p-6`
- Jarak antar elemen dalam card (gambar/judul/deskripsi/tag): dinaikkan
  satu step (mis. `mb-2`→`mb-3`, `mb-4`→`mb-5`)
- Heading margin-bottom tiap section: `mb-12`→`mb-16` (konsisten dengan
  About yang sudah `mb-16` dari awal)
- Chip Skills: padding `px-4 py-2.5`→`px-5 py-3`, jarak antar chip
  `gap-3`→`gap-4`
- Hero: jarak kolom foto↔menu `gap-12`→`gap-16`, jarak vertikal dalam
  blok foto `gap-6`→`gap-8`

Yang SENGAJA tidak diubah: bubble preview hover (tetap compact — itu
popup kecil, bukan konten utama), badge status "Available"/"Unavailable"
(tetap pill kecil), dan filter chip proyek (tetap rapat karena fungsinya
sebagai kontrol UI, bukan konten yang perlu ruang bernapas).

## Mode Light / Dark (tema "Putih Merah")

Toggle di tiga tempat: menu utama Hero, navbar setelah scroll, dan
command palette (Ctrl/Cmd+K → ketik "theme"). Tersimpan di localStorage,
default dark untuk pengunjung baru (kecuali OS mereka jelas set light
lewat `prefers-color-scheme`).

**Bagaimana ini bekerja teknisnya** (penting kalau nanti mau nambah
section baru): situs ini pakai literal Tailwind color class di mana-mana
(`text-white/60`, `bg-black`, dst) — bukan token warna semantik. Supaya
tetap bisa di-theme TANPA mengedit belasan file component satu-satu,
semua override dipusatkan di `app/globals.css` lewat attribute selector
`[data-theme="light"]` yang menyasar nama class Tailwind yang benar-benar
kepakai (dicek pakai grep ke source, bukan ditebak). Kalau kamu nambah
section baru dengan class warna yang belum pernah dipakai di situs ini
(misal `text-white/95` atau `bg-blue-500/20`), class itu TIDAK akan
otomatis ke-theme — perlu ditambahkan manual sebagai override baru di
`globals.css`. Cara ceknya: build situs, buka DevTools di light mode, cek
apakah ada elemen yang warnanya "salah" (masih dark-mode value).

Semua warna aksen (cyan/purple/emerald) dipetakan ke keluarga merah di
light mode, bukan dipertahankan multi-hue — konsisten dengan permintaan
"putih merah", bukan "putih + warna-warna lama tapi lebih terang".

**Sengaja TIDAK ikut tema:**
- Scrim backdrop Modal/CommandPalette (`bg-black/70`) — tetap gelap di
  kedua tema, itu konvensi UX peredup background, bukan soal warna tema.
- Admin panel (`/secret-cmd/*`) — form-form di sana pakai `bg-black/40`
  untuk input field, sengaja TIDAK di-override karena kalau ikut ter-theme
  akan bentrok dengan pemakaian literal class yang sama di Modal/chrome
  publik. Admin panel tetap dark-only by design.

Wajib tahu keterbatasannya: warna theme-color browser (search bar di
mobile) tetap statis hitam (`viewport.themeColor` di layout.tsx) — tidak
otomatis ikut toggle manual, cuma ikut `prefers-color-scheme` OS kalau
mau diperluas nanti.

## Bubble preview: lebih besar dari card, dan performa

Tiga masalah terpisah, ditangani terpisah:

**1. Bubble kekecilan** — sebelumnya lebar tetap 320px terlepas dari
ukuran card. Sekarang lebar bubble = 1.35x lebar card yang di-hover,
diukur langsung lewat `getBoundingClientRect()` saat mouse masuk (bukan
angka tebakan) — jadi konsisten lebih besar dari card aslinya di semua
breakpoint grid (1/2/3 kolom).

**2. Hero menu hilang terlalu cepat di mobile** — root cause: fade
opacity dihitung dari `scrollY` piksel absolut dibanding konstanta tetap
500px, TIDAK PEDULI tinggi viewport. Di layar mobile yang pendek, 500px
itu porsi scroll yang jauh lebih besar relatif ke tinggi device
dibanding di desktop, jadi terasa "buru-buru hilang padahal baru
discroll sedikit". Diperbaiki jadi pakai `scrollYProgress` relatif ke
tinggi section Hero itu sendiri (`useScroll({ target: heroRef })`) —
proporsional di semua ukuran layar. Threshold navbar (`MorphingNavbar`)
punya bug yang sama (piksel absolut `[350, 550]`), ikut diperbaiki jadi
proporsional ke `window.innerHeight`.

**3. "Berat" saat dibuka & discroll** — tiga penyebab konkret, bukan
optimisasi generik:
- `backdrop-blur-xl` (24px) di `.glass-card`/`.glass-nav` dipakai di
  BELASAN elemen sekaligus (tiap project card, certificate card, navbar)
  — `backdrop-filter` memaksa browser re-composite area di belakangnya
  terus-menerus selama scroll, dan biayanya kalikan jumlah elemen.
  Dikurangi ke `backdrop-blur-md` (12px) — masih kelihatan "frosted
  glass", radius sampling yang harus dihitung jauh lebih kecil.
- Glow circle dekoratif di Hero pakai `blur-[130px]`/`blur-[110px]` —
  salah satu operasi CSS paling mahal yang ada, dan aktif render
  sepanjang Hero kelihatan (praktis seluruh initial load). Dikurangi ke
  `blur-[60px]`/`blur-[50px]`. Layer scanline (garis tipis berulang 3px)
  dihapus total — kontribusi visualnya minim di atas grid lines yang
  sudah ada, tapi butuh kalkulasi tiling di seluruh viewport.
- Semua `<img>` di bawah fold (project cards, certificate cards, About
  section images, avatar kecil di navbar) sekarang `loading="lazy"
  decoding="async"` — sebelumnya SEMUA gambar fetch langsung saat page
  load, termasuk yang di luar layar. Avatar utama di Hero (di atas fold,
  elemen LCP) sengaja TIDAK lazy — malah ditambah `fetchPriority="high"`
  supaya makin cepat muncul, bukan makin lambat.
- Bonus yang ikut kebawa dari fix bubble: `onMouseMove` untuk tracking
  kursor bubble di-throttle lewat `requestAnimationFrame` (maksimal satu
  update state per frame), bukan setiap raw mousemove event yang bisa
  fire puluhan-ratusan kali/detik.

Yang SENGAJA tidak disentuh: `backdrop-blur-xl` di halaman login admin
(`/secret-cmd/login`) — cuma satu panel, bukan belasan card sekaligus,
biayanya sudah kecil dan di luar scope (halaman admin, bukan portofolio
publik).

## Klik project → langsung ke website, bukan modal lagi

Modal untuk Projects sudah dihapus total (import `Modal` juga dicabut
dari `ProjectsGrid.tsx` — bukan cuma disembunyikan). Klik card sekarang:

1. Kalau `project_url` (input "Live Demo URL", sudah ada dari sebelumnya
   di admin form) diisi → buka itu di tab baru.
2. Kalau `project_url` kosong tapi `github_url` diisi → fallback ke
   GitHub, supaya klik tidak jadi aksi mati.
3. Kalau dua-duanya kosong → card tidak clickable sama sekali (cursor
   normal, bukan pointer) — tidak ada tujuan untuk dituju.

Hover preview bubble TIDAK berubah — itu fitur terpisah dari perilaku
klik, tetap jalan seperti sebelumnya.

Link "Live Demo" kecil di dalam card sengaja TIDAK dihapus meski sekarang
redundant dengan klik card (dua-duanya menuju URL yang sama) — masih ada
untuk kejelasan visual eksplisit dan sebagai target klik yang lebih kecil
kalau kamu cuma mau ke situ, bukan trigger seluruh card.

Certificates TIDAK berubah — klik card certificate tetap membuka modal
seperti sebelumnya, sesuai instruksi.

## Info sertifikat lebih lengkap (opsional)

Field baru di `CertificateForm.tsx`, keduanya OPSIONAL:

- **Tanggal Kedaluwarsa** — untuk sertifikat yang punya masa berlaku
  (AWS, Azure, dst). Modal certificate otomatis menampilkan badge
  "Expired" kalau tanggal ini sudah lewat hari ini.
- **Credential ID** — nomor/ID sertifikat, terpisah dari URL verifikasi
  (banyak penerbit sertifikat kasih keduanya secara terpisah).

Wajib jalankan `supabase/add_certificate_expiry_credential_id.sql`.
Field lama (`issue_date`, `credential_url`) tidak berubah — sudah
opsional dari sebelumnya, cuma ditambah label "(opsional)" eksplisit di
form biar jelas, dan "Judul"/"Penerbit" dilabel "(wajib)" untuk kontras.

## MIDDLEWARE_INVOCATION_TIMEOUT — kemungkinan besar bukan bug kode

Error ini beda dari `ERR_TOO_MANY_REDIRECTS` sebelumnya — ini artinya
`middleware.ts` HANG sampai Vercel sendiri yang membunuh eksekusinya,
bukan masalah redirect loop. Root cause paling mungkin, **dan ini di
sisi konfigurasi kamu, bukan sesuatu yang bisa saya perbaiki dari sini**:

1. **Cek dulu: project Supabase kamu paused?** Tier gratis Supabase
   auto-pause project setelah ~1 minggu tidak ada aktivitas. Buka
   Supabase Dashboard — kalau ada banner "Project Paused", klik resume.
   Ini penyebab PALING UMUM untuk error jenis ini.
2. **Cek: environment variables benar-benar ke-set di Vercel?**
   `.env.local` cuma jalan pas development lokal — Vercel butuh
   `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` diisi
   terpisah di Project Settings → Environment Variables di dashboard
   Vercel. Kalau belum pernah diisi di sana, middleware coba connect ke
   URL yang salah/kosong dan bisa hang.

Kode yang saya perbaiki (`middleware.ts` dan `(protected)/layout.tsx`)
sebelumnya melakukan `await supabase.auth.getUser()` polos — tanpa
timeout, tanpa try/catch. Kalau Supabase lambat merespons atau
unreachable, call itu bisa hang sampai batas eksekusi Vercel sendiri,
persis error di screenshot. Sekarang dibungkus `Promise.race` dengan
timeout (5 detik di middleware, 8 detik di layout):

- **Middleware**: kalau timeout, fail OPEN (request tetap lanjut) — ini
  aman karena middleware cuma bertugas refresh token, bukan gerbang auth
  sesungguhnya.
- **Protected layout**: kalau timeout, fail TERTUTUP (redirect ke
  login) — ini gerbang auth yang sebenarnya, jadi timeout harus
  diperlakukan sebagai "belum login", bukan "boleh masuk".

**Yang perlu kamu tahu**: fix ini menghilangkan gejala hang/timeout-nya,
tapi kalau root cause-nya memang Supabase project paused, kamu tetap
tidak akan bisa login sampai project-nya di-resume — bedanya sekarang
kamu akan lihat halaman login dengan pesan error yang jelas, bukan
seluruh halaman freeze 504.

## Audit bug (setelah sandbox reset)

Recovery dari `/mnt/user-data/outputs/portfolio.zip` (state terakhir),
lalu full audit: `tsc --noEmit`, cross-check semua `t.xxx.yyy` dictionary
key vs definisi, cross-check semua class warna publik vs override tema
light, cek `console.log`/TODO/`@ts-ignore` leftover, cek React key props,
full `next build`. Yang ditemukan dan diperbaiki:

- **rAF bubble-tracking tidak di-cleanup saat unmount** — di
  `ProjectsGrid.tsx`/`CertificatesSection.tsx`: kalau kamu hover project
  card (rAF pending dari mousemove), lalu langsung pindah ke `/secret-cmd`
  lewat command palette SAAT rAF itu belum sempat jalan, callback-nya
  tetap fire dan panggil `setState` di komponen yang sudah unmounted —
  React warning, berpotensi jadi error di versi React mendatang. Reachable
  bug beneran, bukan teoretis (ada jalur ⌘K→admin yang bisa memicu ini
  sambil hover). Fix: `cancelAnimationFrame` di cleanup `useEffect`.
- **Badge "Expired" sertifikat rawan salah timezone** — `new
  Date(expiry_date) < new Date()` membandingkan Date object: sisi kiri
  di-parse sebagai UTC tengah malam, sisi kanan waktu lokal pengunjung —
  bisa meleset sehari pas persis di tanggal batasnya tergantung timezone.
  Diganti perbandingan string ISO (`YYYY-MM-DD`) langsung, yang aman
  dibandingkan leksikografis tanpa isu parsing timezone sama sekali.
- **`hero.ctaButton` dictionary key mati** — didefinisikan di ketiga file
  i18n tapi tidak pernah dipakai (sisa dari desain Hero versi CTA-button
  sebelum jadi menu vertikal). Dihapus.
- **Admin certificates list tidak menampilkan status expired** — cuma
  bisa tahu sertifikat mana yang sudah lewat masa berlaku dengan buka
  Edit satu-satu. Ditambahkan badge "Expired" kecil di list, konsisten
  dengan yang sudah ada di modal publik.

Yang dicek dan TERNYATA BUKAN bug (false positive dari script audit
sendiri, dikonfirmasi manual): dictionary key mismatch antara id.ts/en.ts
(regex-ku salah baca baris yang pakai double-quote karena ada apostrof di
"Let's") — TypeScript sendiri sudah menjamin ini lewat structural typing
terhadap interface `Dictionary` yang sama, jauh lebih ketat dari script
manual manapun.

## Empat fitur baru: case study, activity feed, contact form, OG image

**1. Case study untuk proyek unggulan** — 4 field opsional baru di
`ProjectForm.tsx` (collapsible, di bawah field lain): The Problem, The
Approach, The Tradeoff, What I'd Do Differently. Isi minimal satu untuk
memunculkan tombol "Read Case Study →" di kartu proyek, membuka halaman
tersendiri di `/projects/[id]` (bukan modal — modal proyek sudah dihapus
di revisi sebelumnya karena klik card sekarang navigasi ke website).
Halaman ini server-rendered, punya `generateMetadata` sendiri, dan akan
404 kalau proyek tidak ditemukan ATAU tidak ada satupun field case study
diisi (daripada nampilin halaman kosong).

**2. "Recently added" di Footer** — pakai `created_at` yang SUDAH ADA di
projects/certificates, tidak ada kolom baru. Digabung, diurutkan, ambil 3
teratas. Sengaja dilabel "Recently added" bukan "Last updated" — tidak
ada tracking edit yang sesungguhnya (tidak ada kolom `updated_at`),
mengklaim itu akan menyesatkan.

**3. Contact form** — tabel baru `contact_messages`, RLS: insert terbuka
untuk publik (memang tujuannya), select/update/delete cuma admin. Form
di `ContactForm.tsx` punya honeypot field untuk bot dasar (posisi
off-screen, bukan display:none — beberapa bot skip field yang
display:none tapi tetap isi yang cuma diposisikan di luar layar). Muncul
di Contact section di belakang toggle "Atau kirim pesan lewat form" —
sengaja tidak langsung tampil supaya section tetap minimal sesuai
keputusan desain sebelumnya. Admin baca/tandai-dibaca/hapus pesan di
`/secret-cmd/messages` (link baru di nav admin).

**PENTING soal spam**: endpoint insert publik tanpa CAPTCHA itu target
empuk untuk bot. Honeypot cuma baseline. Kalau mulai kebanjiran spam,
tambahkan Cloudflare Turnstile (gratis, tidak butuh kartu kredit) —
belum diimplementasikan di sini, di luar scope permintaan awal.

**4. OG image dinamis** — `app/opengraph-image.tsx` generate gambar
1200×630 dari nama+role (pakai `next/og`, jalan di Edge Runtime),
bukan cuma crop foto profil jadi kotak. **Bug yang saya temukan &
perbaiki sekalian**: `generateMetadata` di `app/page.tsx` sebelumnya
hardcode `openGraph.images: [avatar_url]` — metadata eksplisit itu
MENANG atas file convention, jadi kalau tidak dihapus, template OG baru
ini tidak akan pernah kepakai sama sekali (ke-override diam-diam).
Sudah dihapus dari `generateMetadata`.

## Tombol SYSTEM_ADMIN dihapus dari menu publik

Diganti dua jalur, keduanya lewat keyboard:

- **`Ctrl/Cmd + Shift + A`** — langsung lompat ke `/secret-cmd`, tanpa
  membuka command palette dulu.
- **`Ctrl/Cmd + K` → ketik "admin"** — tetap ada sebagai command di
  palette, untuk yang lupa shortcut langsungnya.

Catatan jujur: ini **security through obscurity**, bukan keamanan
tambahan yang sesungguhnya — siapa pun yang baca source JS (client-side,
bisa di-inspect) tetap bisa menemukan route-nya. Yang benar-benar menjaga
halaman admin tetap Supabase Auth di baliknya (lihat `(protected)/layout.tsx`),
bukan shortcut ini. Shortcut cuma menghilangkan link yang terlihat di UI,
bukan menutup akses.

## Ukuran foto profil bisa diatur

Settings admin panel sekarang punya 4 pilihan ukuran foto Hero: Small,
Medium (default), Large, Extra Large — tidak lagi hardcode di kode.
Berlaku HANYA untuk foto besar di Hero section; foto kecil di navbar
(setelah scroll) tetap ukuran tetap `w-8 h-8` karena itu ikon navigasi,
bukan tampilan utama, dan sengaja tidak dipengaruhi setting ini.

Wajib jalankan `supabase/add_avatar_size.sql` — kolomnya punya CHECK
constraint (`sm`/`md`/`lg`/`xl` saja) supaya nilai sampah tidak bisa
tersimpan kalau ada bug di form nanti.

## Bug regresi yang ditemukan & diperbaiki di revisi sebelumnya

- **Font kustom (Inter/Space Grotesk/JetBrains Mono) berhenti dimuat.**
  `tailwind.config.ts` mereferensikan CSS variable `--font-inter` dkk,
  tapi `app/layout.tsx` di suatu titik berhenti memanggil
  `next/font/google` untuk mendefinisikannya — kemungkinan terhapus tidak
  sengaja di edit sebelumnya. Akibatnya seluruh situs diam-diam fallback
  ke font default browser, bukan crash yang kelihatan. Sudah dikembalikan.
- **Hero berpotensi memotong konten di layar pendek.** Section Hero pakai
  `h-screen overflow-hidden` sementara isinya (badge status, foto, nama,
  role, tombol CV, 6 item menu) ditumpuk satu kolom di mobile —  di layar
  pendek (iPhone SE, mode landscape) konten yang lebih tinggi dari
  viewport akan TERPOTONG, bukan bisa di-scroll. Diubah ke `min-h-screen`
  + layer dekoratif (grid/glow/scanline) dipisah ke container
  `overflow-hidden`-nya sendiri, supaya efek visual tetap terjaga tanpa
  ikut memotong konten asli.
- **Navbar setelah scroll overflow horizontal di mobile.** 5 link nav +
  pill bahasa + badge ⌘K dipaksa satu baris tanpa wrap dan tanpa menu
  mobile sama sekali — dijamin overflow di layar <768px. Link penuh
  sekarang `hidden md:flex`; di mobile muncul satu tombol hamburger yang
  membuka command palette (sudah ada navigasi ke semua section + toggle
  bahasa + link admin di dalamnya, jadi dipakai ulang sebagai menu mobile
  alih-alih membangun drawer terpisah).

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

## SEO & Optimisasi Lanjutan

Audit ini fokus ke 3 gap konkret yang ditemukan lewat pengecekan
langsung (grep ke source, bukan tebakan):

**1. next/image dikonfigurasi tapi tidak dipakai sama sekali.**
`next.config.js` sudah punya `remotePatterns` wildcard sejak awal, tapi
10 SEMUA gambar di situs (public + admin) masih pakai `<img>` polos.
Dikonversi semua — kecuali `app/opengraph-image.tsx`, yang SENGAJA tetap
`<img>` karena itu jalan di konteks Satori/next-og, bukan browser, dan
`next/image` tidak kompatibel di situ.

Dua pola dipakai tergantung konteks:
- **`fill`** (10 lokasi) — untuk gambar di container yang ukurannya
  responsif/fluid (aspect-video, aspect-[4/3], avatarSizeClass). Wajib
  ada ancestor `position: relative` — ditambahkan ke tiap wrapper div
  yang belum punya, diverifikasi manual satu-satu (7 file, 10 usage)
  karena ini requirement runtime Next.js yang tidak ditangkap `tsc`.
- **`width`/`height` eksplisit** (2 lokasi: avatar kecil di
  MorphingNavbar, thumbnail admin) — untuk gambar ukuran tetap, bukan
  fluid, jadi tidak butuh wrapper `relative` tambahan.

Manfaat nyata: WebP/AVIF otomatis (bukan cuma format asli upload),
responsive `srcset` berdasarkan `sizes` prop, dan dimensi eksplisit yang
mencegah layout shift (CLS) — sebelumnya gambar bisa "melompat" saat
selesai load karena browser tidak tahu ukurannya sampai gambar benar-
benar termuat.

**Bug yang saya buat & tangkap sendiri saat mengerjakan ini**: satu edit
awal di `About.tsx` cuma mengganti atribut di dalam tag `<img>`,
meninggalkan tag pembuka `<img` menggantung di atas `<Image>` yang baru
— JSX yang rusak secara sintaks. Ketahuan karena saya buka lagi file-nya
untuk verifikasi (bukan asumsi editnya berhasil), diperbaiki sebelum
lanjut ke file berikutnya. Setelah insiden itu saya ganti pendekatan:
lihat blok lengkap dulu sebelum edit file gambar mana pun, bukan ganti
atribut sebagian.

**2. Halaman admin (`/secret-cmd/*`) cuma dilindungi `robots.txt`.**
Itu cuma instruksi ke crawler yang PATUH — kalau ada crawler yang
mengabaikannya, atau halaman ke-link dari luar dan ter-crawl lewat jalur
lain, `robots.txt` tidak menghentikannya. Ditambahkan `app/secret-cmd/layout.tsx`
baru — satu file yang membungkus SEMUA route di bawah `/secret-cmd`
(login DAN semua halaman protected sekaligus, karena posisinya satu
level di atas keduanya), isinya cuma `export const metadata` dengan
`robots: { index: false, follow: false }`. Lapisan kedua, bukan
pengganti `robots.txt` yang sudah ada.

**3. Halaman case study (`/projects/[id]`) tidak punya Open Graph sama
sekali.** Sebelumnya cuma title+description — kalau di-share di
WhatsApp/LinkedIn, preview-nya jatuh ke og:image DEFAULT situs (foto
profil), bukan gambar proyek yang sebenarnya relevan untuk konten itu.
Ditambahkan: canonical URL (`alternates.canonical`), Open Graph lengkap
dengan `project.image_url` sebagai gambar (kalau ada), Twitter Card, dan
JSON-LD `CreativeWork` structured data (nama, deskripsi, tech stack
sebagai keywords) supaya Google memahami ini sebagai konten
portofolio/karya, bukan halaman teks generik.

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

## Kompatibilitas Mobile & Device Lain

Audit konkret — cek langsung ke kode, bukan asumsi "harusnya sudah
responsive karena pakai Tailwind". 6 gap ditemukan dan diperbaiki:

**1. iOS Safari auto-zoom di SEMUA form field.** 42 elemen
`<input>`/`<textarea>` di seluruh situs (public + admin) tidak punya
class ukuran font eksplisit — jatuh ke default browser (~13px). Di
bawah 16px, iOS Safari otomatis zoom-in begitu field disentuh, perilaku
yang tidak bisa dimatikan lewat viewport meta (ini sengaja dikunci Apple
sebagai fitur aksesibilitas). Satu aturan CSS terpusat di
`globals.css` (`input, textarea, select { font-size: 16px }`) — bukan
edit 42 file satu-satu.

**2. Safe-area-inset untuk notch/Dynamic Island.** `viewport.viewportFit
= 'cover'` ditambahkan di `layout.tsx` (tanpa ini, `env(safe-area-inset-*)`
di CSS selalu resolve ke 0, tidak ada efeknya). Padding safe-area
ditambahkan ke `MorphingNavbar` (satu-satunya elemen fixed full-width
edge-to-edge dengan konten interaktif — risiko nyata di landscape, di
mana notch bisa menjorok dari SAMPING). `CommandPalette`/`Modal` DICEK
tapi TIDAK diberi padding tambahan — keduanya sudah centered dengan
margin `px-4`/`p-4 md:p-8`, jadi risikonya rendah, menambah padding di
situ cuma kerja tanpa manfaat nyata.

**3-5. Touch target di bawah standar minimum 44×44px** (Apple/Google
HIG) — `ThemeToggle` compact (32px), `LanguageSwitcher` compact (~28px),
hamburger mobile di `MorphingNavbar` (36px), tombol close `Modal`
(34px): semua dinaikkan ke `min-w/h-11` (44px) via flex centering —
ukuran visual ikon/teks tidak berubah, cuma area yang bisa di-tap yang
diperbesar. Tombol copy-email di `Contact.tsx` (24px, offender terkecil)
SENGAJA cuma dinaikkan ke 36px, bukan 44px penuh — itu badge sekunder
menempel di atas link Mail utama yang sudah 56px, dan WCAG 2.5.5 sendiri
punya pengecualian untuk target kecil kalau ada kontrol setara yang
lebih besar di halaman yang sama.

**6. Bubble preview bisa overflow di viewport sempit tapi hover-capable**
(mis. iPad dengan trackpad, tablet Windows kecil — perangkat yang lolos
`useHoverCapable()` tapi punya layar sempit). Lebar bubble (1.35x lebar
card) tidak pernah di-clamp ke lebar viewport — di device seperti itu,
`bubbleWidth` bisa lebih lebar dari viewport-nya sendiri, menghasilkan
`left` negatif dan bubble terpotong sebagian di luar layar kiri. Fix:
`clampedBubbleWidth` dihitung dulu sebelum posisi, di
`ProjectsGrid.tsx` dan `CertificatesSection.tsx`.

**Yang dicek dan TERNYATA aman** (dikonfirmasi, bukan diasumsikan): tidak
ada elemen `fixed bottom-0` (jadi tidak ada risiko home-indicator iOS),
tidak ada hardcoded `w-[Npx]` yang bisa memicu horizontal overflow di
viewport 320px (iPhone SE).


## Animasi & Interaktivitas Baru (tanpa menambah beban performa)

Permintaan ini punya tegangan nyata dengan kerja optimisasi sebelumnya
(backdrop-blur dikurangi, glow blur radius dipangkas, mousemove
di-throttle) — jadi setiap penambahan di bawah ini dipilih SPESIFIK
karena murah secara struktur, bukan cuma "kelihatan animasinya dikit
jadi pasti ringan":

**1. Spotlight cursor-follow di card Projects & Certificates.**
Radial-gradient lembut yang mengikuti posisi kursor dalam card yang
di-hover. Posisinya (`--spotlight-x`/`--spotlight-y`) di-update dengan
`element.style.setProperty()` LANGSUNG ke DOM, BUKAN lewat React state —
menyatu dengan `requestAnimationFrame` throttle yang sudah ada untuk
bubble preview (satu rAF, dua efek, bukan listener terpisah yang
bersaing). Kalau ini pakai `setState`, tiap gerakan mouse akan re-render
seluruh grid; dengan direct DOM mutation, React sama sekali tidak tahu
posisi spotlight berubah. Radial-gradient polos ITU SENDIRI murah — beda
jauh dari `filter: blur()` yang mahal (itu yang dipangkas di revisi
optimisasi sebelumnya); ini cuma definisi warna gradient, nol kalkulasi
sampling blur tambahan.

**2. Magnetic hover pada tombol utama** (`components/ui/MagneticButton.tsx`,
baru) — tombol CV download di Hero dan tiga ikon kontak (WhatsApp/GitHub/
LinkedIn) sedikit "tertarik" ke arah kursor lalu pegas kembali. Dipakai
`useMotionValue`+`useSpring` dari Framer Motion, BUKAN React state —
prinsip yang sama dengan spotlight: motion value Framer Motion menulis
langsung ke `transform` CSS di luar siklus render React. Otomatis
nonaktif total di perangkat tanpa hover asli lewat `useHoverCapable()` —
di HP, komponen ini render statis, tidak ada listener mousemove
terpasang sama sekali secara efektif.

Sengaja TIDAK dipakai di tombol submit ContactForm (full-width,
`inline-block` wrapper akan bentrok dengan `w-full`) atau tombol toggle
"Atau kirim pesan lewat form" (link sekunder yang sengaja dibuat
understated — efek magnetic yang flashy akan menarik perhatian ke
sesuatu yang harusnya tetap diam-diam).

**3. Stagger reveal nama di Hero** — tiap huruf nama muncul satu-satu
saat halaman dimuat. Biaya SEKALI SAJA saat mount, tidak ada biaya
berkelanjutan setelahnya (beda dari spotlight/magnetic yang aktif
selama interaksi). **Detail aksesibilitas yang wajib**: teks yang
dipecah huruf-per-huruf akan dibaca screen reader huruf demi huruf
("A... F... F... A... N...") kalau tidak ditangani — elemen
per-karakter diberi `aria-hidden="true"`, teks utuh aslinya ada di
`aria-label` pada `<h1>` pembungkusnya.

**4. Scale-on-hover di skill chip** — murni CSS (`hover:scale-105`),
tanpa JavaScript sama sekali. Ini yang termurah dari semua penambahan:
browser sudah menangani CSS `:hover` + `transition` secara native, tidak
ada cost tambahan di luar yang sudah dilakukan browser untuk hover state
apa pun.

Semua animasi baru otomatis menghormati `prefers-reduced-motion` lewat
`MotionConfig reducedMotion="user"` yang sudah terpasang global di
`LanguageProvider.tsx` sejak revisi sebelumnya — tidak perlu pengaturan
tambahan per-komponen.

**Bug yang saya temukan & perbaiki sendiri saat mengerjakan ini**: draft
awal spotlight card menambahkan `overflow-hidden` ke card supaya sudut
gradient ikut membulat — tapi itu akan memotong badge "Featured" yang
sengaja diposisikan sedikit di luar tepi card (`-top-2 -right-2`).
Ketahuan sebelum di-build, diperbaiki dengan `rounded-2xl` di div
spotlight itu sendiri, bukan `overflow-hidden` di parent.


## Animasi Tambahan (revisi kedua, masih dengan batasan performa yang sama)

Empat penambahan lagi, semuanya baru — beda dari spotlight/magnetic/
stagger/scale-chip di revisi sebelumnya:

**1. Parallax lembut di glow circle Hero.** Dua lingkaran dekoratif
bergerak dengan kecepatan berbeda (60px vs -40px) saat scroll, kesan
kedalaman bukan geser satu lapis datar. REUSE `heroScrollProgress` yang
sudah ada untuk efek fade Hero — cuma nambah dua `useTransform` dari
motion value yang sama, BUKAN scroll listener baru.

**Bug yang ketemu & diperbaiki sebelum sempat jadi masalah**: lingkaran
kedua sebelumnya punya class Tailwind statis `translate-x-32` (offset
horizontal). Begitu ditambah `style={{ y: ... }}` dari Framer Motion di
elemen yang sama, dua-duanya sama-sama menulis ke `transform` CSS —
inline style Framer akan MENANG lewat specificity dan diam-diam
menghapus offset horizontal dari class Tailwind. Ini persis kelas bug
yang sama dengan masalah centering kursor jauh sebelumnya di percakapan
ini. Fix: offset horizontal dipindah jadi `x: 128` di style Framer yang
sama, supaya x dan y dikelola satu mekanisme, bukan campur Tailwind
class + inline style di properti yang sama.

**2. Underline animasi di link navbar** (`MorphingNavbar`) — garis tipis
yang scale-in dari kiri saat hover. Murni CSS (`scale-x-0` ke
`scale-x-100` lewat `group-hover`, `transform-only`), nol JavaScript,
nol listener tambahan.

**3. `whileTap` di card Project & Certificate** — sedikit mengecil
(scale 0.98) SELAMA ditekan/diklik, otomatis kembali begitu dilepas.
Framer Motion yang atur penuh, transform-only, tidak perlu state atau
listener manual dari sisi kita.

**4. Animasi gradient mengalir di semua heading `.text-gradient`** —
`background-position` bergeser lambat (8 detik per siklus) di atas
`background-size: 200%`. INI SATU-SATUNYA dari empat penambahan yang
BUKAN murni `transform`/`opacity` — `background-position` memicu paint,
bukan cuma composite. Durasinya sengaja dibuat lambat: pergeseran
per-frame jadi kecil, browser bisa optimasi lebih baik, dan area yang
di-repaint cuma teks heading (kecil), bukan background penuh halaman.
`prefers-reduced-motion` OTOMATIS ter-cover lewat aturan global yang
sudah ada di `globals.css` sejak revisi tema light/dark (aturan itu
menargetkan SEMUA `animation-duration`, bukan cuma punya Framer Motion),
tidak perlu override terpisah.

## UI Theme (Terminal / Game HUD) & Tutorial Onboarding

Tiga sumbu tampilan yang independen, semuanya atribut di `<html>`:
`data-theme` (dark/light), `data-bkg` (ps2/ambient/normal), `data-ui` (terminal/game).

- **UI theme** — `lib/ui/UIThemeContext.tsx` (kunci localStorage `portfolio-ui`),
  tombol `components/ui/UISwitcher.tsx`. Atribut diset sebelum hydrate oleh inline
  script di `app/layout.tsx` (tanpa kedip). Komponen TIDAK memakai ternary: pakai
  varian Tailwind `game:` / `terminal:` (plugin di `tailwind.config.ts`) dan kelas
  `glass-card`, `hud-chip`, `hud-cut`, `hud-title` (CSS di `app/globals.css`, semua
  di bawah `[data-ui='game']`, jadi Terminal tidak berubah).
- **Catatan clip-path**: bentuk chamfer memotong SEMUA yang digambar di luar bentuk
  (outline, `filter: drop-shadow`, elemen `absolute` yang menonjol). Cahaya hover dan
  cincin fokus karena itu digambar DI DALAM (inset shadow pada `::before`).
- **Tutorial** — `lib/tutorial/` (`steps.ts` = data langkah per UI + 2 bahasa,
  `useTutorial.ts` = hook/logika, `TutorialProvider.tsx`) dan komponen
  `components/ui/TutorialOverlay.tsx`, `TutorialReplayButton.tsx`. Target sorotan =
  atribut `data-tutorial="..."`; target tak ditemukan/tersembunyi → dialog di tengah.
  Status dilihat disimpan terpisah per UI: `tutorial_seen_terminal` dan
  `tutorial_seen_gamehud` (cadangan: sessionStorage → memori bila localStorage ditolak).
  Replay: tombol `[ ? ]` di navbar & footer, atau Command Palette; dari mana pun cukup
  `window.dispatchEvent(new CustomEvent('start-tutorial'))`.
- **Tombol melayang UI/BKG** (`FloatingBackgroundSwitcher`): di bawah 640 px berupa dua
  tombol bulat berisi ikon; dari 640 px ke atas berupa label teks `[ UI: … ]` `[ BKG: … ]`.
- **Reveal fail-safe** — semua animasi muncul-saat-scroll memakai `components/ui/Reveal.tsx`
  (konten terlihat secara default; tidak ada lagi `whileInView` Framer Motion).

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
