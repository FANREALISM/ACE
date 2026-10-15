'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme, type Theme } from '@/lib/theme/ThemeProvider'

/**
 * Latar belakang animasi bergaya "boot screen konsol era 2000-an":
 * kabut/nebula biru ethereal yang bergeser pelan, kubus kaca transparan
 * yang melayang dan berputar, dan orb cahaya warna-warni yang mengorbit.
 * Desain orisinal terinspirasi estetikanya — bukan salinan aset siapa pun.
 *
 * KENAPA CANVAS 2D, BUKAN three.js / @react-three/fiber:
 *  - @react-three/fiber v9 mensyaratkan React 19, proyek ini React 18.
 *  - Isi scene cuma ~6 kubus + ~30 sprite; three.js menambah ratusan KB
 *    JS untuk sesuatu yang proyeksi perspektif manual sudah cukup.
 *  - Kubus kaca ala era itu memang sederhana (muka transparan + tepi
 *    terang), jadi tidak butuh material transmission yang berat di GPU.
 *
 * PERFORMA: nebula digambar di canvas offscreen beresolusi 1/4 lalu
 * di-scale (kabut memang blur), orb memakai sprite pra-render, DPR
 * dibatasi, dan resolusi turun otomatis kalau frame time terus lambat.
 * rAF berhenti saat tab tersembunyi. prefers-reduced-motion → satu frame
 * statis, tanpa loop.
 *
 * LIFECYCLE: semua listener, observer, rAF, dan buffer offscreen
 * dibersihkan di cleanup useEffect (aman untuk React Strict Mode).
 *
 * Dipasang SEKALI di app/layout.tsx. Tidak dirender di /secret-cmd
 * (panel admin) supaya tidak membuang CPU di halaman yang tertutup.
 */

const TAU = Math.PI * 2

// ---------------------------------------------------------------------
// Palet per tema
// ---------------------------------------------------------------------

interface Palette {
  /** true = tema terang: tanpa blending additive, latar canvas transparan. */
  isLight: boolean
  nebulaColors: [number, number, number][]
  nebulaAlpha: number
  cubeFill: [number, number, number]
  cubeEdge: [number, number, number]
  cubeFillStrength: number
  cubeGlow: [number, number, number]
  orbColors: [number, number, number][]
}

const DARK_PALETTE: Palette = {
  isLight: false,
  nebulaColors: [
    [29, 78, 216],
    [59, 130, 246],
    [14, 165, 233],
    [67, 56, 202],
    [37, 99, 235],
  ],
  nebulaAlpha: 0.3,
  cubeFill: [150, 200, 255],
  cubeEdge: [175, 215, 255],
  cubeFillStrength: 1,
  cubeGlow: [59, 130, 246],
  orbColors: [
    [255, 77, 109], // merah
    [74, 222, 128], // hijau
    [96, 165, 250], // biru
    [192, 132, 252], // ungu
  ],
}

const LIGHT_PALETTE: Palette = {
  isLight: true,
  nebulaColors: [
    [252, 165, 165],
    [254, 202, 202],
    [253, 164, 175],
    [254, 215, 170],
    [252, 165, 165],
  ],
  nebulaAlpha: 0.32,
  cubeFill: [220, 38, 38],
  cubeEdge: [220, 38, 38],
  cubeFillStrength: 0.55,
  cubeGlow: [239, 68, 68],
  orbColors: [
    [225, 29, 72],
    [22, 163, 74],
    [37, 99, 235],
    [147, 51, 234],
  ],
}

const PALETTES: Record<Theme, Palette> = {
  dark: DARK_PALETTE,
  light: LIGHT_PALETTE,
}

// ---------------------------------------------------------------------
// Geometri kubus
// ---------------------------------------------------------------------

const CUBE_VERTICES: readonly [number, number, number][] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
]

/** Indeks vertex per muka, berurutan sejajar dengan CUBE_NORMALS. */
const CUBE_FACES: readonly number[][] = [
  [0, 1, 2, 3], // belakang  (z-)
  [4, 5, 6, 7], // depan     (z+)
  [0, 1, 5, 4], // bawah     (y-)
  [3, 2, 6, 7], // atas      (y+)
  [0, 3, 7, 4], // kiri      (x-)
  [1, 2, 6, 5], // kanan     (x+)
]

const CUBE_NORMALS: readonly [number, number, number][] = [
  [0, 0, -1],
  [0, 0, 1],
  [0, -1, 0],
  [0, 1, 0],
  [-1, 0, 0],
  [1, 0, 0],
]

/** Arah ke sumber cahaya (kiri-atas, menghadap kamera), sudah dinormalisasi. */
const LIGHT_DIRECTION: [number, number, number] = (() => {
  const x = -0.4
  const y = -0.6
  const z = -0.7
  const length = Math.hypot(x, y, z)
  return [x / length, y / length, z / length]
})()

// ---------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------

interface CubeState {
  anchorX: number // -0.5..0.5 dari lebar layar
  anchorY: number // -0.5..0.5 dari tinggi layar
  depth: number // jarak "kamera" relatif (makin besar makin jauh/kecil)
  halfSize: number // setengah sisi, dalam satuan min(lebar, tinggi)
  rotation: [number, number, number]
  spin: [number, number, number]
  bobPhase: number
  bobSpeed: number
  bobAmplitude: number
}

interface OrbState {
  centerX: number
  centerY: number
  radiusX: number
  radiusY: number
  tilt: number
  speed: number
  phase: number
  depth: number
  sizePx: number
  colorIndex: number
}

interface NebulaBlob {
  baseX: number
  baseY: number
  radius: number
  colorIndex: number
  alpha: number
  amplitudeX: number
  amplitudeY: number
  speedX: number
  speedY: number
  phase: number
}

interface Scene {
  cubes: CubeState[]
  orbs: OrbState[]
  blobs: NebulaBlob[]
}

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min)

const randomSign = () => (Math.random() < 0.5 ? -1 : 1)

function createScene(isSmallScreen: boolean): Scene {
  const cubeAnchors: [number, number][] = [
    [-0.36, -0.24],
    [0.34, -0.3],
    [-0.18, 0.3],
    [0.32, 0.22],
    [0.02, -0.04],
    [-0.46, 0.06],
  ]
  const cubeCount = isSmallScreen ? 4 : 6
  const orbCount = isSmallScreen ? 16 : 30

  const cubes: CubeState[] = cubeAnchors.slice(0, cubeCount).map(
    ([anchorX, anchorY]) => ({
      // Di layar sempit anchor X dirapatkan supaya kubus tidak terpotong.
      anchorX: (anchorX + randomBetween(-0.04, 0.04)) * (isSmallScreen ? 0.75 : 1),
      anchorY: anchorY + randomBetween(-0.04, 0.04),
      depth: randomBetween(1.25, 2.4),
      halfSize: randomBetween(0.09, 0.17) * (isSmallScreen ? 0.8 : 1),
      rotation: [randomBetween(0, TAU), randomBetween(0, TAU), randomBetween(0, TAU)],
      // Sangat pelan: ~0.04–0.1 rad/detik → satu putaran penuh 60–150 detik.
      spin: [
        randomSign() * randomBetween(0.04, 0.1),
        randomSign() * randomBetween(0.04, 0.1),
        randomSign() * randomBetween(0.02, 0.06),
      ],
      bobPhase: randomBetween(0, TAU),
      bobSpeed: randomBetween(0.1, 0.22),
      bobAmplitude: randomBetween(0.015, 0.04),
    })
  )

  const orbs: OrbState[] = Array.from({ length: orbCount }, (_, orbIndex) => ({
    centerX: randomBetween(-0.08, 0.08),
    centerY: randomBetween(-0.06, 0.06),
    radiusX: randomBetween(0.25, 0.7),
    radiusY: randomBetween(0.15, 0.5),
    tilt: randomBetween(-0.8, 0.8),
    speed: randomSign() * randomBetween(0.03, 0.11),
    phase: randomBetween(0, TAU),
    depth: randomBetween(1, 2.6),
    sizePx: randomBetween(1.6, 4.2),
    colorIndex: orbIndex % 4,
  }))

  const blobs: NebulaBlob[] = Array.from({ length: 5 }, (_, blobIndex) => ({
    baseX: 0.5 + randomBetween(-0.14, 0.14),
    baseY: 0.5 + randomBetween(-0.1, 0.1),
    radius: randomBetween(0.35, 0.7),
    colorIndex: blobIndex,
    alpha: randomBetween(0.6, 1),
    amplitudeX: randomBetween(0.05, 0.16),
    amplitudeY: randomBetween(0.04, 0.12),
    speedX: randomBetween(0.03, 0.08),
    speedY: randomBetween(0.03, 0.08),
    phase: randomBetween(0, TAU),
  }))

  return { cubes, orbs, blobs }
}

/** Sprite lingkaran bercahaya (pra-render sekali per warna). */
function createGlowSprite(color: [number, number, number]): HTMLCanvasElement {
  const spriteSize = 64
  const sprite = document.createElement('canvas')
  sprite.width = spriteSize
  sprite.height = spriteSize
  const spriteContext = sprite.getContext('2d')
  if (spriteContext) {
    const [red, green, blue] = color
    const gradient = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
    gradient.addColorStop(0.18, `rgba(${red},${green},${blue},0.85)`)
    gradient.addColorStop(0.5, `rgba(${red},${green},${blue},0.22)`)
    gradient.addColorStop(1, `rgba(${red},${green},${blue},0)`)
    spriteContext.fillStyle = gradient
    spriteContext.fillRect(0, 0, spriteSize, spriteSize)
  }
  return sprite
}

// ---------------------------------------------------------------------
// Komponen
// ---------------------------------------------------------------------

export default function PS2Background() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const isHidden = pathname?.startsWith('/secret-cmd') ?? false

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Palet dibaca tiap frame lewat ref — ganti tema tidak perlu membangun
  // ulang scene/loop, cukup menukar isi ref ini.
  const paletteRef = useRef<Palette>(PALETTES[theme])
  // Diisi effect utama; dipanggil saat tema berubah ketika loop tidak
  // berjalan (mode reduced-motion) supaya frame statis ikut ter-redraw.
  const redrawStaticFrameRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    paletteRef.current = PALETTES[theme]
    redrawStaticFrameRef.current?.()
  }, [theme])

  useEffect(() => {
    if (isHidden) return
    const canvasNode = canvasRef.current
    if (!canvasNode) return
    // Alias non-null: narrowing dari `if` tidak ikut masuk ke closure.
    const canvas: HTMLCanvasElement = canvasNode
    const context = canvas.getContext('2d')
    if (!context) return
    // Alias non-null supaya TypeScript tahu nilainya pasti ada di dalam
    // closure (narrowing dari `if` tidak ikut masuk ke fungsi bersarang).
    const ctx: CanvasRenderingContext2D = context

    // --- State lokal effect ---------------------------------------
    let viewportWidth = 0
    let viewportHeight = 0
    let isSmallScreen = window.innerWidth < 768
    let scene = createScene(isSmallScreen)
    let resolutionScale = 1
    let animationFrameId: number | null = null
    let lastFrameTime = 0
    let elapsedSeconds = 0
    let resizeTimeoutId: number | null = null
    let hasDrawnFirstFrame = false

    // Pointer & scroll (dihaluskan supaya gerak parallax tidak patah).
    const pointerTarget = { x: 0, y: 0 }
    const pointerCurrent = { x: 0, y: 0 }

    // Monitor performa adaptif.
    let slowFrameStreak = 0
    let lastQualityDropTime = 0

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )
    const canHover = window.matchMedia('(hover: hover)').matches

    // Buffer offscreen: nebula 1/4 resolusi + sprite orb per warna.
    const nebulaCanvas = document.createElement('canvas')
    const nebulaContext = nebulaCanvas.getContext('2d')
    const orbSprites = DARK_PALETTE.orbColors.map(createGlowSprite)
    // Sprite versi tema terang dibuat lazily saat dibutuhkan.
    let lightOrbSprites: HTMLCanvasElement[] | null = null
    const cubeGlowSprites = new Map<Theme, HTMLCanvasElement>()

    // Scratch array dipakai ulang tiap frame (hindari alokasi per frame).
    const projectedX = new Float32Array(8)
    const projectedY = new Float32Array(8)
    const projectedDepth = new Float32Array(8)
    const faceDepth = new Float32Array(6)
    const faceOrder = [0, 1, 2, 3, 4, 5]

    // --- Ukuran canvas --------------------------------------------
    function applyCanvasSize() {
      viewportWidth = window.innerWidth
      viewportHeight = window.innerHeight
      const devicePixelRatioCap = isSmallScreen ? 1 : 1.5
      const pixelRatio =
        Math.min(window.devicePixelRatio || 1, devicePixelRatioCap) *
        resolutionScale
      canvas.width = Math.max(1, Math.round(viewportWidth * pixelRatio))
      canvas.height = Math.max(1, Math.round(viewportHeight * pixelRatio))
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      nebulaCanvas.width = Math.max(1, Math.ceil(viewportWidth / 4))
      nebulaCanvas.height = Math.max(1, Math.ceil(viewportHeight / 4))
    }

    // --- Nebula ----------------------------------------------------
    function drawNebula(palette: Palette, seconds: number) {
      if (!nebulaContext) return
      const nebulaWidth = nebulaCanvas.width
      const nebulaHeight = nebulaCanvas.height
      nebulaContext.globalCompositeOperation = 'source-over'
      nebulaContext.clearRect(0, 0, nebulaWidth, nebulaHeight)
      nebulaContext.globalCompositeOperation = palette.isLight
        ? 'source-over'
        : 'lighter'
      const largestSide = Math.max(nebulaWidth, nebulaHeight)
      for (const blob of scene.blobs) {
        const centerX =
          (blob.baseX +
            Math.sin(seconds * blob.speedX + blob.phase) * blob.amplitudeX) *
          nebulaWidth
        const centerY =
          (blob.baseY +
            Math.cos(seconds * blob.speedY + blob.phase) * blob.amplitudeY) *
          nebulaHeight
        const radius = blob.radius * largestSide
        const [red, green, blue] =
          palette.nebulaColors[blob.colorIndex % palette.nebulaColors.length]
        const alpha = palette.nebulaAlpha * blob.alpha
        const gradient = nebulaContext.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius
        )
        gradient.addColorStop(0, `rgba(${red},${green},${blue},${alpha})`)
        gradient.addColorStop(0.55, `rgba(${red},${green},${blue},${alpha * 0.35})`)
        gradient.addColorStop(1, `rgba(${red},${green},${blue},0)`)
        nebulaContext.fillStyle = gradient
        nebulaContext.fillRect(0, 0, nebulaWidth, nebulaHeight)
      }
      nebulaContext.globalCompositeOperation = 'source-over'
    }

    // --- Kubus -----------------------------------------------------
    function getCubeGlowSprite(themeKey: Theme, palette: Palette) {
      let sprite = cubeGlowSprites.get(themeKey)
      if (!sprite) {
        sprite = createGlowSprite(palette.cubeGlow)
        cubeGlowSprites.set(themeKey, sprite)
      }
      return sprite
    }

    function drawCube(
      cube: CubeState,
      palette: Palette,
      themeKey: Theme,
      unit: number,
      seconds: number,
      parallaxX: number,
      parallaxY: number,
      scrollShift: number
    ) {
      const bob = Math.sin(seconds * cube.bobSpeed + cube.bobPhase)
      const drift = Math.cos(seconds * cube.bobSpeed * 0.7 + cube.bobPhase)
      const depthScale = 1 / cube.depth
      const centerX =
        viewportWidth / 2 +
        (cube.anchorX + drift * cube.bobAmplitude) * viewportWidth +
        parallaxX * depthScale
      const centerY =
        viewportHeight / 2 +
        (cube.anchorY + bob * cube.bobAmplitude) * viewportHeight +
        parallaxY * depthScale -
        scrollShift * depthScale

      // Pointer ikut memiringkan kubus sedikit (interaktif tapi halus).
      const rotationX = cube.rotation[0] + seconds * cube.spin[0] + pointerCurrent.y * 0.18
      const rotationY = cube.rotation[1] + seconds * cube.spin[1] + pointerCurrent.x * 0.18
      const rotationZ = cube.rotation[2] + seconds * cube.spin[2]
      const sinX = Math.sin(rotationX)
      const cosX = Math.cos(rotationX)
      const sinY = Math.sin(rotationY)
      const cosY = Math.cos(rotationY)
      const sinZ = Math.sin(rotationZ)
      const cosZ = Math.cos(rotationZ)

      /** Rotasi vektor: Rx → Ry → Rz. Hasil ditulis ke array `out`. */
      const rotate = (
        x: number,
        y: number,
        z: number,
        out: [number, number, number]
      ) => {
        const y1 = y * cosX - z * sinX
        const z1 = y * sinX + z * cosX
        const x2 = x * cosY + z1 * sinY
        const z2 = -x * sinY + z1 * cosY
        out[0] = x2 * cosZ - y1 * sinZ
        out[1] = x2 * sinZ + y1 * cosZ
        out[2] = z2
      }
      const rotated: [number, number, number] = [0, 0, 0]

      for (let vertexIndex = 0; vertexIndex < 8; vertexIndex++) {
        const [vx, vy, vz] = CUBE_VERTICES[vertexIndex]
        rotate(vx * cube.halfSize, vy * cube.halfSize, vz * cube.halfSize, rotated)
        const depth = cube.depth + rotated[2]
        // Proyeksi perspektif: makin dekat (depth kecil) makin besar.
        const perspective = unit / depth
        projectedX[vertexIndex] = centerX + rotated[0] * perspective
        projectedY[vertexIndex] = centerY + rotated[1] * perspective
        projectedDepth[vertexIndex] = depth
      }

      // Bloom lembut di belakang kubus.
      const glowRadius = cube.halfSize * unit * depthScale * 3.2
      ctx.globalCompositeOperation = palette.isLight ? 'source-over' : 'lighter'
      ctx.globalAlpha = palette.isLight ? 0.35 : 0.5
      ctx.drawImage(
        getCubeGlowSprite(themeKey, palette),
        centerX - glowRadius,
        centerY - glowRadius,
        glowRadius * 2,
        glowRadius * 2
      )
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      // Urutkan muka dari yang terjauh (painter's algorithm); kubus
      // transparan jadi muka belakang tetap terlihat menembus kaca.
      for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
        const face = CUBE_FACES[faceIndex]
        faceDepth[faceIndex] =
          (projectedDepth[face[0]] +
            projectedDepth[face[1]] +
            projectedDepth[face[2]] +
            projectedDepth[face[3]]) /
          4
      }
      faceOrder.sort((faceA, faceB) => faceDepth[faceB] - faceDepth[faceA])

      const [fillRed, fillGreen, fillBlue] = palette.cubeFill
      const [edgeRed, edgeGreen, edgeBlue] = palette.cubeEdge
      for (const faceIndex of faceOrder) {
        const face = CUBE_FACES[faceIndex]
        const [normalX, normalY, normalZ] = CUBE_NORMALS[faceIndex]
        rotate(normalX, normalY, normalZ, rotated)
        const lighting = Math.max(
          0,
          rotated[0] * LIGHT_DIRECTION[0] +
            rotated[1] * LIGHT_DIRECTION[1] +
            rotated[2] * LIGHT_DIRECTION[2]
        )
        // normal.z < 0 = muka menghadap kamera.
        const facing = Math.max(0, -rotated[2])

        ctx.beginPath()
        ctx.moveTo(projectedX[face[0]], projectedY[face[0]])
        ctx.lineTo(projectedX[face[1]], projectedY[face[1]])
        ctx.lineTo(projectedX[face[2]], projectedY[face[2]])
        ctx.lineTo(projectedX[face[3]], projectedY[face[3]])
        ctx.closePath()

        const fillAlpha =
          (0.03 + 0.11 * Math.pow(lighting, 1.5) + 0.035 * facing) *
          palette.cubeFillStrength
        ctx.fillStyle = `rgba(${fillRed},${fillGreen},${fillBlue},${fillAlpha})`
        ctx.fill()

        const edgeAlpha = (0.14 + 0.32 * facing + 0.2 * lighting) * (palette.isLight ? 0.8 : 1)
        ctx.strokeStyle = `rgba(${edgeRed},${edgeGreen},${edgeBlue},${edgeAlpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // --- Orb -------------------------------------------------------
    function drawOrbs(
      palette: Palette,
      unit: number,
      seconds: number,
      parallaxX: number,
      parallaxY: number,
      scrollShift: number,
      minDepth: number,
      maxDepth: number
    ) {
      const sprites = palette.isLight
        ? (lightOrbSprites ??= palette.orbColors.map(createGlowSprite))
        : orbSprites
      ctx.globalCompositeOperation = palette.isLight ? 'source-over' : 'lighter'
      for (const orb of scene.orbs) {
        if (orb.depth < minDepth || orb.depth >= maxDepth) continue
        const angle = orb.phase + seconds * orb.speed
        const ellipseX = Math.cos(angle) * orb.radiusX
        const ellipseY = Math.sin(angle) * orb.radiusY
        const tiltedX = ellipseX * Math.cos(orb.tilt) - ellipseY * Math.sin(orb.tilt)
        const tiltedY = ellipseX * Math.sin(orb.tilt) + ellipseY * Math.cos(orb.tilt)
        const depthScale = 1 / orb.depth
        const screenX =
          viewportWidth * (0.5 + orb.centerX) +
          tiltedX * viewportWidth * 0.5 +
          Math.sin(seconds * 0.4 + orb.phase) * 6 +
          parallaxX * depthScale
        const screenY =
          viewportHeight * (0.5 + orb.centerY) +
          tiltedY * viewportHeight * 0.5 +
          Math.cos(seconds * 0.35 + orb.phase) * 6 +
          parallaxY * depthScale -
          scrollShift * depthScale
        const spriteRadius = orb.sizePx * 4 * depthScale * 1.6
        if (
          screenX < -spriteRadius ||
          screenX > viewportWidth + spriteRadius ||
          screenY < -spriteRadius ||
          screenY > viewportHeight + spriteRadius
        ) {
          continue
        }
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(seconds * 1.3 + orb.phase * 3)
        ctx.drawImage(
          sprites[orb.colorIndex],
          screenX - spriteRadius,
          screenY - spriteRadius,
          spriteRadius * 2,
          spriteRadius * 2
        )
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      // `unit` tidak dipakai di sini tapi dipertahankan di signature supaya
      // pemanggilan drawCube/drawOrbs seragam.
      void unit
    }

    // --- Satu frame penuh -----------------------------------------
    function renderFrame(seconds: number) {
      const palette = paletteRef.current
      const themeKey: Theme = palette.isLight ? 'light' : 'dark'
      const unit = Math.min(viewportWidth, viewportHeight)

      // Latar: hitam pekat di tema gelap; transparan di tema terang
      // (body putih tetap terlihat).
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      if (palette.isLight) {
        ctx.clearRect(0, 0, viewportWidth, viewportHeight)
      } else {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, viewportWidth, viewportHeight)
      }

      drawNebula(palette, seconds)
      ctx.globalCompositeOperation = palette.isLight ? 'source-over' : 'lighter'
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(nebulaCanvas, 0, 0, viewportWidth, viewportHeight)
      ctx.globalCompositeOperation = 'source-over'

      // Parallax: pointer menggeser scene, scroll menggesernya vertikal
      // dengan redaman tanh supaya tidak melayang jauh di halaman panjang.
      const parallaxX = -pointerCurrent.x * unit * 0.05
      const parallaxY = -pointerCurrent.y * unit * 0.05
      const scrollShift =
        viewportHeight * 0.18 * Math.tanh(window.scrollY / (viewportHeight * 2))

      // Orb jauh → kubus (urut dari terjauh) → orb dekat.
      drawOrbs(palette, unit, seconds, parallaxX, parallaxY, scrollShift, 1.9, 99)
      const sortedCubes = [...scene.cubes].sort(
        (cubeA, cubeB) => cubeB.depth - cubeA.depth
      )
      for (const cube of sortedCubes) {
        drawCube(cube, palette, themeKey, unit, seconds, parallaxX, parallaxY, scrollShift)
      }
      drawOrbs(palette, unit, seconds, parallaxX, parallaxY, scrollShift, 0, 1.9)

      if (!hasDrawnFirstFrame) {
        hasDrawnFirstFrame = true
        // Fade-in setelah frame pertama siap, bukan kedip tiba-tiba.
        canvas.style.opacity = '1'
      }
    }

    // --- Loop ------------------------------------------------------
    function loop(now: number) {
      if (lastFrameTime === 0) lastFrameTime = now
      // Clamp: kalau tab baru kembali aktif dt bisa sangat besar dan
      // membuat semuanya "melompat".
      const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.05)
      lastFrameTime = now
      elapsedSeconds += deltaSeconds

      const smoothing = Math.min(1, deltaSeconds * 3)
      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * smoothing
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * smoothing

      renderFrame(elapsedSeconds)

      // Turunkan resolusi bertahap kalau device terus kesulitan (>28ms per
      // frame selama ~1.5 detik), maksimal sekali per 3 detik.
      if (deltaSeconds * 1000 > 28) slowFrameStreak++
      else slowFrameStreak = Math.max(0, slowFrameStreak - 1)
      if (
        slowFrameStreak > 90 &&
        resolutionScale > 0.55 &&
        now - lastQualityDropTime > 3000
      ) {
        resolutionScale = Math.max(0.55, resolutionScale - 0.15)
        lastQualityDropTime = now
        slowFrameStreak = 0
        applyCanvasSize()
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    function startLoop() {
      if (animationFrameId !== null) return
      lastFrameTime = 0
      animationFrameId = requestAnimationFrame(loop)
    }

    function stopLoop() {
      if (animationFrameId === null) return
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    /** Gambar satu frame statis (mode reduced-motion / ganti tema). */
    function drawStaticFrame() {
      renderFrame(20)
    }

    function syncMotionPreference() {
      if (reducedMotionQuery.matches) {
        stopLoop()
        redrawStaticFrameRef.current = drawStaticFrame
        drawStaticFrame()
      } else {
        redrawStaticFrameRef.current = null
        if (!document.hidden) startLoop()
      }
    }

    // --- Event handler --------------------------------------------
    function handleResize() {
      if (resizeTimeoutId !== null) window.clearTimeout(resizeTimeoutId)
      // Debounce: resize beruntun (drag window, address bar mobile) cuma
      // memicu satu alokasi ulang canvas.
      resizeTimeoutId = window.setTimeout(() => {
        resizeTimeoutId = null
        const nextIsSmallScreen = window.innerWidth < 768
        if (nextIsSmallScreen !== isSmallScreen) {
          isSmallScreen = nextIsSmallScreen
          scene = createScene(isSmallScreen)
        }
        applyCanvasSize()
        if (reducedMotionQuery.matches) drawStaticFrame()
      }, 150)
    }

    function handlePointerMove(pointerEvent: PointerEvent) {
      pointerTarget.x = (pointerEvent.clientX / window.innerWidth - 0.5) * 2
      pointerTarget.y = (pointerEvent.clientY / window.innerHeight - 0.5) * 2
    }

    function handleVisibilityChange() {
      if (document.hidden) stopLoop()
      else if (!reducedMotionQuery.matches) startLoop()
    }

    // --- Mulai -----------------------------------------------------
    applyCanvasSize()
    syncMotionPreference()

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    reducedMotionQuery.addEventListener('change', syncMotionPreference)
    // Interaksi pointer hanya di perangkat dengan hover (mouse/trackpad);
    // di layar sentuh scene tetap hidup lewat gerak otomatis + scroll.
    if (canHover) {
      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      })
    }

    // --- Cleanup (unmount / Strict Mode / pindah ke /secret-cmd) ---
    return () => {
      stopLoop()
      if (resizeTimeoutId !== null) window.clearTimeout(resizeTimeoutId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      reducedMotionQuery.removeEventListener('change', syncMotionPreference)
      window.removeEventListener('pointermove', handlePointerMove)
      redrawStaticFrameRef.current = null
      // Lepas backing store canvas (memori GPU/RAM) secara eksplisit.
      canvas.width = 0
      canvas.height = 0
      nebulaCanvas.width = 0
      nebulaCanvas.height = 0
      for (const sprite of orbSprites) {
        sprite.width = 0
        sprite.height = 0
      }
      for (const sprite of lightOrbSprites ?? []) {
        sprite.width = 0
        sprite.height = 0
      }
      for (const sprite of cubeGlowSprites.values()) {
        sprite.width = 0
        sprite.height = 0
      }
      cubeGlowSprites.clear()
    }
  }, [isHidden])

  if (isHidden) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        // Mulai transparan, di-fade-in setelah frame pertama tergambar.
        style={{ opacity: 0, transition: 'opacity 0.8s ease' }}
      />
      {/* Overlay keterbacaan: peredup merata + vignette di tepi, supaya
          teks dan motif terminal tetap kontras di atas kubus/orb terang.
          Gradient-nya diatur di globals.css (.ps2-overlay) per tema. */}
      <div className="ps2-overlay absolute inset-0" />
    </div>
  )
}
