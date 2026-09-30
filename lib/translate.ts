// Panggil endpoint publik LibreTranslate. Tidak butuh API key — sesuai
// kebijakan resmi mereka untuk "personal, infrequent use", yang cocok
// dengan pola pakai kita: dipanggil sesekali dari admin panel, bukan
// setiap request pengunjung publik.
//
// TIDAK ADA jaminan uptime/kuota dari pihak LibreTranslate untuk endpoint
// tanpa key. Kalau ini sering gagal (429 / timeout), pertimbangkan
// self-host lewat Docker (lihat komentar di bawah) sebagai pengganti URL.

const LIBRETRANSLATE_ENDPOINT = 'https://libretranslate.com/translate'

// Ganti ke 'http://localhost:5000/translate' kalau kamu self-host via:
//   docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

/**
 * Terjemahkan teks Bahasa Indonesia ke Inggris lewat LibreTranslate.
 * Dipakai oleh tombol "Auto-translate to EN" di admin panel (About,
 * Project) untuk mengisi kolom `_en` tanpa perlu diketik manual.
 *
 * @param indonesianText - teks sumber berbahasa Indonesia
 * @returns teks hasil terjemahan Inggris, atau string kosong kalau input
 *          kosong (tidak perlu panggil API untuk string kosong)
 * @throws Error kalau API gagal merespons (rate-limit, network down,
 *         dll) — pesan errornya sudah dibuat ramah untuk ditampilkan
 *         langsung ke admin di form, bukan raw error teknis.
 */
export async function translateToEnglish(
  indonesianText: string
): Promise<string> {
  if (!indonesianText.trim()) return ''

  const translateResponse = await fetch(LIBRETRANSLATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: indonesianText,
      source: 'id',
      target: 'en',
      format: 'text',
    }),
  })

  if (!translateResponse.ok) {
    throw new Error(
      `Translate gagal (${translateResponse.status}). Kemungkinan endpoint publik sedang rate-limit — coba lagi beberapa menit lagi, atau isi manual.`
    )
  }

  const translationResult = await translateResponse.json()
  if (!translationResult.translatedText) {
    throw new Error('Respons translate tidak berisi teks. Coba lagi.')
  }

  return translationResult.translatedText as string
}
