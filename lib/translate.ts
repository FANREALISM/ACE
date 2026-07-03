// Panggil endpoint publik LibreTranslate. Tidak butuh API key — sesuai
// kebijakan resmi mereka untuk "personal, infrequent use", yang cocok
// dengan pola pakai kita: dipanggil sesekali dari admin panel, bukan
// setiap request pengunjung publik.
//
// TIDAK ADA jaminan uptime/kuota dari pihak LibreTranslate untuk endpoint
// tanpa key. Kalau ini sering gagal (429 / timeout), pertimbangkan
// self-host lewat Docker (lihat komentar di bawah) sebagai pengganti URL.

const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate'

// Ganti ke 'http://localhost:5000/translate' kalau kamu self-host via:
//   docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

export async function translateToEnglish(text: string): Promise<string> {
  if (!text.trim()) return ''

  const res = await fetch(LIBRETRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'id',
      target: 'en',
      format: 'text',
    }),
  })

  if (!res.ok) {
    throw new Error(
      `Translate gagal (${res.status}). Kemungkinan endpoint publik sedang rate-limit — coba lagi beberapa menit lagi, atau isi manual.`
    )
  }

  const data = await res.json()
  if (!data.translatedText) {
    throw new Error('Respons translate tidak berisi teks. Coba lagi.')
  }

  return data.translatedText as string
}
