import { useEffect, useRef } from 'react'
import { isAndroidBrowser } from '../lib/mobilePerformance'
import './CubeVsLoader.css'

/** A real 3×3 cube: 26 cubies, exterior stickers, and animated quarter-turn layers. */
type Vec3 = [number, number, number]
type Axis = 0 | 1 | 2
type Turn = { axis: Axis; layer: -1 | 1; dir: -1 | 1 }
type Cubie = { pos: Vec3; stickers: Vec3[] }
type Face = { normal: Vec3; u: Vec3; v: Vec3 }

type Polygon = { depth: number; plastic: Vec3[]; sticker?: Vec3[]; light: number }

const FACES: Face[] = [
  { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
  { normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
]
const MOVES: Turn[] = [
  { axis: 0, layer: 1, dir: 1 },  // R
  { axis: 1, layer: 1, dir: -1 }, // U
  { axis: 2, layer: 1, dir: 1 },  // F
  { axis: 0, layer: -1, dir: -1 },// L
  { axis: 1, layer: -1, dir: 1 }, // D
  { axis: 2, layer: -1, dir: -1 },// B
  { axis: 0, layer: 1, dir: -1 }, // R'
  { axis: 1, layer: 1, dir: 1 },  // U'
]
const UNDO: Turn[] = [...MOVES].reverse().map(m => ({ ...m, dir: (m.dir * -1) as -1 | 1 }))
// A quick, readable quarter turn. Roughly 3.3× the original move cadence.
const TURN_MS = 195
const PAUSE_MS = 24
const PITCH = 0.99
const HALF = 0.478
const STICKER_HALF = 0.398
const YAW = -Math.PI / 5.7
const PITCH_ANGLE = Math.PI / 7.1

function rotate(v: Vec3, axis: Axis, angle: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  if (axis === 0) return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]
  if (axis === 1) return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
function scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s]
}
function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
function view(v: Vec3): Vec3 {
  return rotate(rotate(v, 1, YAW), 0, PITCH_ANGLE)
}

function createCube(): Cubie[] {
  const cubies: Cubie[] = []
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue
        const pos: Vec3 = [x, y, z]
        cubies.push({
          pos,
          stickers: FACES.filter(({ normal }) => dot(normal, pos) === 1).map(({ normal }) => [...normal] as Vec3),
        })
      }
    }
  }
  return cubies
}

function commitTurn(cube: Cubie[], move: Turn) {
  for (const cubie of cube) {
    if (cubie.pos[move.axis] !== move.layer) continue
    cubie.pos = rotate(cubie.pos, move.axis, move.dir * Math.PI / 2).map(Math.round) as Vec3
    cubie.stickers = cubie.stickers.map(n => rotate(n, move.axis, move.dir * Math.PI / 2).map(Math.round) as Vec3)
  }
}

function makeCorners(center: Vec3, normal: Vec3, u: Vec3, v: Vec3, half: number, offset: number): Vec3[] {
  const base = add(center, scale(normal, offset))
  return [
    add(add(base, scale(u, -half)), scale(v, -half)),
    add(add(base, scale(u, half)), scale(v, -half)),
    add(add(base, scale(u, half)), scale(v, half)),
    add(add(base, scale(u, -half)), scale(v, half)),
  ]
}

function getPolygons(cube: Cubie[], move: Turn | null, radians: number): Polygon[] {
  const polygons: Polygon[] = []
  for (const cubie of cube) {
    const turning = move !== null && cubie.pos[move.axis] === move.layer
    const transform = (v: Vec3): Vec3 => turning ? rotate(v, move.axis, radians) : v
    const center = transform(scale(cubie.pos, PITCH))
    for (const face of FACES) {
      const n = transform(face.normal)
      const normalInView = view(n)
      // Only paint faces looking toward the camera.
      if (normalInView[2] <= 0.005) continue
      const u = transform(face.u)
      const v = transform(face.v)
      const plastic = makeCorners(center, n, u, v, HALF, HALF).map(view)
      const isSticker = cubie.stickers.some(sticker => dot(sticker, face.normal) > 0.99)
      const sticker = isSticker ? makeCorners(center, n, u, v, STICKER_HALF, HALF + 0.007).map(view) : undefined
      polygons.push({
        plastic,
        sticker,
        depth: plastic.reduce((sum, p) => sum + p[2], 0) / 4,
        light: normalInView[2],
      })
    }
  }
  return polygons.sort((a, b) => a.depth - b.depth)
}

function drawCube(ctx: CanvasRenderingContext2D, cube: Cubie[], move: Turn | null, radians: number, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)
  const centerX = width / 2
  const centerY = height / 2
  const s = Math.min(width, height) / 5.15
  const project = (v: Vec3): [number, number] => {
    const perspective = 9 / (9 - v[2])
    return [centerX + v[0] * s * perspective, centerY - v[1] * s * perspective]
  }
  const trace = (vertices: Vec3[]) => {
    ctx.beginPath()
    vertices.forEach((vertex, i) => {
      const [x, y] = project(vertex)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
  }

  for (const polygon of getPolygons(cube, move, radians)) {
    trace(polygon.plastic)
    ctx.fillStyle = '#11131f'
    ctx.fill()
    ctx.strokeStyle = '#414657'
    ctx.lineWidth = Math.max(0.6, s * 0.014)
    ctx.stroke()
    if (polygon.sticker) {
      trace(polygon.sticker)
      // Every sticker remains white; neutral shading gives the cube real depth.
      const shade = Math.round(222 + polygon.light * 33)
      const edgeShade = Math.max(215, shade - 13)
      const [gx, gy] = project(polygon.sticker[0])
      const [ex, ey] = project(polygon.sticker[2])
      const fill = ctx.createLinearGradient(gx, gy, ex, ey)
      fill.addColorStop(0, `rgb(${shade},${shade},${shade})`)
      fill.addColorStop(1, `rgb(${edgeShade},${edgeShade},${edgeShade})`)
      ctx.fillStyle = fill
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.65)'
      ctx.lineWidth = Math.max(0.4, s * 0.009)
      ctx.stroke()
    }
  }
}

function CubeCanvas({ startsScrambled = false }: { startsScrambled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return
    const cubies = createCube()
    if (startsScrambled) MOVES.forEach(m => commitTurn(cubies, m))
    const sequence = startsScrambled ? [...UNDO, ...MOVES] : [...MOVES, ...UNDO]
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 220
    let height = 220
    let currentMoveIndex = 0
    let moveStart: number | null = null
    let frame = 0
    let stopped = false
    // Android browsers can become CPU-bound when drawing two canvas cubes
    // at 90/120Hz. Cap just the loader; this never touches live race cubes.
    const android = isAndroidBrowser()
    const minimumFrameMs = android ? 1000 / 40 : 0
    let lastDrawAt = -Infinity

    function render(now: number) {
      if (stopped || !context) return
      if (minimumFrameMs && now - lastDrawAt < minimumFrameMs) {
        frame = requestAnimationFrame(render)
        return
      }
      lastDrawAt = now
      if (moveStart === null) moveStart = now + 140
      const elapsed = now - moveStart
      if (elapsed >= TURN_MS + PAUSE_MS) {
        commitTurn(cubies, sequence[currentMoveIndex])
        currentMoveIndex = (currentMoveIndex + 1) % sequence.length
        moveStart = now
      }
      const t = Math.min(1, Math.max(0, (now - moveStart) / TURN_MS))
      const ease = t * t * (3 - 2 * t)
      const current = sequence[currentMoveIndex]
      const active = t > 0 ? current : null
      drawCube(context, cubies, active, current.dir * ease * Math.PI / 2, width, height)
      if (!reduceMotion.matches) frame = requestAnimationFrame(render)
    }
    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, android ? 1.5 : 2)
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      context!.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduceMotion.matches) drawCube(context!, cubies, null, 0, width, height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    if (!reduceMotion.matches) frame = requestAnimationFrame(render)
    const onMotionChanged = () => {
      cancelAnimationFrame(frame)
      if (reduceMotion.matches) drawCube(context, cubies, null, 0, width, height)
      else { moveStart = null; lastDrawAt = -Infinity; frame = requestAnimationFrame(render) }
    }
    reduceMotion.addEventListener('change', onMotionChanged)
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      reduceMotion.removeEventListener('change', onMotionChanged)
    }
  }, [startsScrambled])
  return <canvas ref={canvasRef} className="cube-loader-canvas" width={260} height={260} aria-hidden="true" />
}

export default function CubeVsLoader() {
  return (
    <div className="cube-loader-page" role="status" aria-live="polite" aria-label="Loading Cube Hero">
      <div className="cube-loader-backdrop" aria-hidden="true">
        <span className="cube-loader-orbit cube-loader-orbit-a" />
        <span className="cube-loader-orbit cube-loader-orbit-b" />
      </div>
      <div className="cube-loader-branding">
        <span className="cube-loader-brand-mark">✦</span>
        <div><strong>CUBE HERO</strong><small>RACE ARENA · HEAD TO HEAD</small></div>
      </div>
      <div className="cube-loader-matchup">
        <div className="cube-loader-scene">
          <div className="cube-loader-glow" aria-hidden="true" />
          <CubeCanvas />
        </div>
        <div className="cube-loader-vs-wrap" aria-hidden="true">
          <span className="cube-loader-vs-line" />
          <span className="cube-loader-vs">VS</span>
          <span className="cube-loader-vs-line" />
        </div>
        <div className="cube-loader-scene">
          <div className="cube-loader-glow" aria-hidden="true" />
          <CubeCanvas startsScrambled />
        </div>
      </div>
      <div className="cube-loader-caption">
        <span className="cube-loader-caption-title">Preparing your arena…</span>
        <span className="cube-loader-caption-subtitle">Two cubes. Real face turns. One challenge.</span>
      </div>
    </div>
  )
}
