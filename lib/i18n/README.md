# Sistem Dua Bahasa (i18n)

## Apa yang diterjemahkan
Semua string UI statis: label navbar, judul section, tombol, empty state.
Lihat `lib/i18n/id.ts` dan `lib/i18n/en.ts` — dua file terpisah, ditype lewat
`lib/i18n/types.ts` (interface `Dictionary`).

## Apa yang TIDAK diterjemahkan (dan kenapa)
Isi About, deskripsi Project, dan nama Certificate berasal dari tabel
Supabase (`about_sections.content`, `projects.description`, dst). Itu teks
bebas yang kamu tulis sendiri lewat admin panel — dictionary TypeScript
tidak bisa menerjemahkan data yang tidak ada di dalamnya. Kalau kamu ganti
ke EN, judul section berubah ("About Me"), tapi paragraf yang kamu tulis
tetap dalam bahasa aslinya.

Kalau nanti kamu mau konten juga bilingual, ada dua opsi (belum
diimplementasikan, effort-nya jauh lebih besar dari yang diminta sekarang):
1. Tambah kolom `_en` untuk tiap field teks (mis. `content_en`,
   `description_en`) — sederhana tapi menambah field ganda ke setiap form.
2. Tabel translations terpisah (`content_translations`) dengan foreign key
   + locale — lebih rapi tapi butuh restrukturisasi query dan admin form.

## Cara kerja switch
- State bahasa disimpan di `LanguageProvider` (React Context) + localStorage
  (`portfolio-locale`), jadi pilihan bahasa persist antar reload.
- Default: `id` (Indonesia) sampai localStorage terbaca di client.
- Switch tampil di dua tempat: menu utama Hero (`components/sections/Hero.tsx`)
  dan navbar setelah scroll (`components/sections/MorphingNavbar.tsx`) —
  keduanya baca dari context yang sama, jadi pilihan tetap sinkron saat
  scroll turun/naik.
