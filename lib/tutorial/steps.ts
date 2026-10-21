import type { Locale } from '@/lib/i18n/types'
import type { UITheme } from '@/lib/ui/UIThemeContext'

/**
 * Data tutorial. Dipisah dari komponen supaya menambah/mengubah langkah
 * cukup edit array di sini — TutorialOverlay hanya membaca `steps`.
 *
 * `target` = nilai atribut `data-tutorial` pada elemen halaman, mis.
 * <section data-tutorial="skills">. Tanpa `target` (atau target tidak
 * ditemukan / tidak terlihat, mis. navbar yang belum muncul), dialog
 * tampil di tengah layar — tutorial tetap jalan di halaman mana pun.
 */
export interface TutorialStepText {
  title: string
  body: string
}

export interface TutorialStep {
  id: string
  target?: string
  text: Record<Locale, TutorialStepText>
}

/** Kunci terpisah per UI: mengganti ke Game HUD untuk pertama kalinya
 *  memunculkan tutorial versi Game HUD, walau Terminal sudah pernah dilihat. */
export const TUTORIAL_STORAGE_KEYS: Record<UITheme, string> = {
  terminal: 'tutorial_seen_terminal',
  game: 'tutorial_seen_gamehud',
}

export const TUTORIAL_CHROME: Record<
  Locale,
  {
    next: string
    back: string
    skip: string
    finish: string
    replay: string
    stepOf: (current: number, total: number) => string
  }
> = {
  id: {
    next: 'Lanjut',
    back: 'Kembali',
    skip: 'Lewati',
    finish: 'Selesai',
    replay: 'Putar ulang tutorial',
    stepOf: (current, total) => `Langkah ${current} dari ${total}`,
  },
  en: {
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    finish: 'Finish',
    replay: 'Replay tutorial',
    stepOf: (current, total) => `Step ${current} of ${total}`,
  },
}

const TERMINAL_STEPS: TutorialStep[] = [
  {
    id: 'boot',
    text: {
      id: {
        title: 'SYSTEM_BOOT',
        body: 'Selamat datang. Portofolio ini disusun seperti terminal: setiap bagian dibungkus kurung siku [ ... ]. Panduan ini hanya 6 langkah dan bisa dilewati kapan saja.',
      },
      en: {
        title: 'SYSTEM_BOOT',
        body: 'Welcome. This portfolio is laid out like a terminal: every part is wrapped in square brackets [ ... ]. This guide is only 6 steps and can be skipped at any time.',
      },
    },
  },
  {
    id: 'nav',
    target: 'hero-menu',
    text: {
      id: {
        title: '[ NAVIGASI ]',
        body: 'Setiap baris adalah satu modul. Klik atau tekan Enter pada [ TECH_STACK ] untuk melompat ke bagiannya. Setelah scroll, menu yang sama muncul sebagai bar di bagian atas.',
      },
      en: {
        title: '[ NAVIGATION ]',
        body: 'Each line is a module. Click or press Enter on [ TECH_STACK ] to jump to it. Once you scroll, the same menu appears as a bar at the top.',
      },
    },
  },
  {
    id: 'palette',
    text: {
      id: {
        title: 'COMMAND_PALETTE',
        body: 'Tekan Ctrl+K (⌘K di Mac) untuk membuka palette: ketik nama bagian, ganti bahasa, tema, atau latar tanpa mouse. Di HP, ketuk ikon kaca pembesar di bar atas.',
      },
      en: {
        title: 'COMMAND_PALETTE',
        body: 'Press Ctrl+K (⌘K on Mac) to open the palette: type a section name, switch language, theme or background without a mouse. On a phone, tap the magnifier in the top bar.',
      },
    },
  },
  {
    id: 'data',
    target: 'skills',
    text: {
      id: {
        title: 'DATA_STRUCT',
        body: 'Isi halaman dimuat sebagai modul: about, timeline, tech_stack, projects, achievements, contact. Di bagian projects, klik chip teknologi untuk memfilter hasilnya.',
      },
      en: {
        title: 'DATA_STRUCT',
        body: 'The page is loaded as modules: about, timeline, tech_stack, projects, achievements, contact. In projects, click a technology chip to filter the results.',
      },
    },
  },
  {
    id: 'display',
    target: 'display-controls',
    text: {
      id: {
        title: 'DISPLAY_MODE',
        body: '[ UI ] mengganti antarmuka antara Terminal dan Game HUD. [ BKG ] mengganti latar animasi. Pilihan Anda disimpan di perangkat ini.',
      },
      en: {
        title: 'DISPLAY_MODE',
        body: '[ UI ] switches the interface between Terminal and Game HUD. [ BKG ] changes the animated background. Your choice is saved on this device.',
      },
    },
  },
  {
    id: 'exit',
    target: 'replay',
    text: {
      id: {
        title: 'EXIT 0',
        body: 'Selesai. Tombol [ ? ] di footer atau di bar atas memutar ulang panduan ini kapan saja.',
      },
      en: {
        title: 'EXIT 0',
        body: 'Done. The [ ? ] button in the footer or the top bar replays this guide at any time.',
      },
    },
  },
]

const GAME_STEPS: TutorialStep[] = [
  {
    id: 'briefing',
    text: {
      id: {
        title: 'INCOMING TRANSMISSION',
        body: 'NAV-AI online. Selamat datang, Operator. Saya akan memandu Anda membaca profil ini seperti sebuah misi: 6 langkah, bisa di-skip kapan saja.',
      },
      en: {
        title: 'INCOMING TRANSMISSION',
        body: 'NAV-AI online. Welcome, Operator. I will guide you through this profile like a mission: 6 steps, skippable at any time.',
      },
    },
  },
  {
    id: 'status',
    target: 'hero-status',
    text: {
      id: {
        title: 'STATUS INDICATOR',
        body: 'Lencana ini menunjukkan ketersediaan kerja. Panel lain memiliki kode ID dan barcode di sudutnya, dan akan memindai serta menyala saat di-hover.',
      },
      en: {
        title: 'STATUS INDICATOR',
        body: 'This badge shows work availability. Other panels carry an ID code and barcode in their corner, and scan and glow on hover.',
      },
    },
  },
  {
    id: 'stats',
    target: 'skills',
    text: {
      id: {
        title: 'STATS // TECH STACK',
        body: 'Panel stat Anda: deretan teknologi yang dikuasai. Dua baris bergerak berlawanan arah; arahkan kursor untuk menjeda.',
      },
      en: {
        title: 'STATS // TECH STACK',
        body: 'Your stats panel: the technologies mastered. Two rows scroll in opposite directions; hover to pause.',
      },
    },
  },
  {
    id: 'missions',
    target: 'projects',
    text: {
      id: {
        title: 'MISSION LOGS // PROJECTS',
        body: 'Setiap kartu adalah satu misi yang telah diselesaikan. Klik chip teknologi untuk menyaring misi, lalu buka Live Demo, GitHub, atau Case Study untuk laporan lengkapnya.',
      },
      en: {
        title: 'MISSION LOGS // PROJECTS',
        body: 'Each card is a completed mission. Click a technology chip to filter missions, then open Live Demo, GitHub or the Case Study for the full report.',
      },
    },
  },
  {
    id: 'hud',
    target: 'display-controls',
    text: {
      id: {
        title: 'HUD CONTROLS',
        body: '[ UI ] kembali ke antarmuka Terminal kapan saja. [ BKG ] mengganti latar. Pilihan disimpan di perangkat ini.',
      },
      en: {
        title: 'HUD CONTROLS',
        body: '[ UI ] returns to the Terminal interface at any time. [ BKG ] changes the background. Your choice is saved on this device.',
      },
    },
  },
  {
    id: 'complete',
    target: 'replay',
    text: {
      id: {
        title: 'MISSION BRIEFING COMPLETE',
        body: 'Tombol [ ? ] di footer atau di bar atas memanggil NAV-AI lagi kapan saja. Selamat menjelajah, Operator.',
      },
      en: {
        title: 'MISSION BRIEFING COMPLETE',
        body: 'The [ ? ] button in the footer or the top bar calls NAV-AI again at any time. Good hunting, Operator.',
      },
    },
  },
]

export const TUTORIAL_STEPS: Record<UITheme, TutorialStep[]> = {
  terminal: TERMINAL_STEPS,
  game: GAME_STEPS,
}
