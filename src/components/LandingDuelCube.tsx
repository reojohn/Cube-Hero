import { useEffect, useRef } from 'react'
import { parseCubeMove, type CubeMove } from '../lib/cubeMoves'

/**
 * Landing-page 3×3 duel illustration.
 * Real 26-piece geometry with sticker colors and animated quarter-turn layers.
 * Both contestants begin from the same shared scramble and play through the
 * exact inverse sequence; only their demo clock/solve duration differs.
 * No solver, save data, game timer, or live race code is modified here.
 */
type Vec3 = [number, number, number]
type Axis = 0 | 1 | 2
type Sticker = { normal: Vec3; color: string }
type Cubie = { position: Vec3; stickers: Sticker[] }
type Turn = { axis: Axis; layers: readonly number[]; direction: -1 | 1; turns: 1 | 2 }
type Face = { normal: Vec3; u: Vec3; v: Vec3 }
type Polygon = { depth: number; plastic: Vec3[]; sticker: Vec3[] | null; color: string | null; light: number }

// These moves are deliberately all legal quarter turns: inverse moves return
// every sticker to its original position, not merely to a decorative solid face.
const SCRAMBLE = ["R", "U", "F", "L'", "D", "R'", "U", "F'", "L", "U'", "R", "F"]
const invert = (move: string) => move.endsWith("'") ? move.slice(0, -1) : `${move}'`
const SOLUTION = [...SCRAMBLE].reverse().map(invert)
const FACE_COLORS: Record<string, string> = {
  U: '#ffda4a', R: '#ff584e', F: '#38a5ff',
  D: '#f1f4ff', L: '#ff913e', B: '#46d977',
}
const FACES: Face[] = [
  { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
  { normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
]
const FACE_KEYS = ['F', 'R', 'U', 'B', 'L', 'D'] as const
const PITCH = 0.99
const HALF = 0.483
const STICKER_HALF = 0.394
const YAW = -Math.PI / 5.7
const TILT = Math.PI / 7.1

function rotate(vector: Vec3, axis: Axis, radians: number): Vec3 {
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  const [x, y, z] = vector
  if (axis === 0) return [x, y * c - z * s, y * s + z * c]
  if (axis === 1) return [x * c + z * s, y, -x * s + z * c]
  return [x * c - y * s, x * s + y * c, z]
}
function add(a: Vec3, b: Vec3): Vec3 { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]] }
function scale(v: Vec3, n: number): Vec3 { return [v[0] * n, v[1] * n, v[2] * n] }
function dot(a: Vec3, b: Vec3): number { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] }
function view(v: Vec3): Vec3 { return rotate(rotate(v, 1, YAW), 0, TILT) }
function axisOf(move: CubeMove): Axis { return move.axis === 'X' ? 0 : move.axis === 'Y' ? 1 : 2 }
function toTurn(text: string): Turn {
  const move = parseCubeMove(text)
  return { axis: axisOf(move), layers: move.layers, direction: move.direction, turns: move.turns }
}

function solvedCubies(): Cubie[] {
  const cubies: Cubie[] = []
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    if (x === 0 && y === 0 && z === 0) continue
    const position: Vec3 = [x, y, z]
    cubies.push({ position, stickers: FACES.flatMap((face, i) =>
      dot(face.normal, position) === 1 ? [{ normal: [...face.normal] as Vec3, color: FACE_COLORS[FACE_KEYS[i]] }] : [],
    ) })
  }
  return cubies
}
function turnCubies(cubies: Cubie[], turn: Turn): void {
  for (let n = 0; n < turn.turns; n++) for (const cubie of cubies) {
    if (!turn.layers.includes(cubie.position[turn.axis])) continue
    const radians = turn.direction * Math.PI / 2
    cubie.position = rotate(cubie.position, turn.axis, radians).map(Math.round) as Vec3
    for (const sticker of cubie.stickers) sticker.normal = rotate(sticker.normal, turn.axis, radians).map(Math.round) as Vec3
  }
}
const solutionTurns = SOLUTION.map(toTurn)
// Build each complete physical pose once. Each animation frame merely interpolates
// the single active layer. Both racers reuse these exact same snapshots.
const SOLVE_STATES = (() => {
  const cubies = solvedCubies()
  SCRAMBLE.forEach(move => turnCubies(cubies, toTurn(move)))
  const copy = (): Cubie[] => cubies.map(cubie => ({
    position: [...cubie.position] as Vec3,
    stickers: cubie.stickers.map(sticker => ({ normal: [...sticker.normal] as Vec3, color: sticker.color })),
  }))
  const states = [copy()]
  solutionTurns.forEach(turn => { turnCubies(cubies, turn); states.push(copy()) })
  return states
})()

function corners(center: Vec3, normal: Vec3, u: Vec3, v: Vec3, half: number, offset: number): Vec3[] {
  const base = add(center, scale(normal, offset))
  return [
    add(add(base, scale(u, -half)), scale(v, -half)),
    add(add(base, scale(u, half)), scale(v, -half)),
    add(add(base, scale(u, half)), scale(v, half)),
    add(add(base, scale(u, -half)), scale(v, half)),
  ]
}
function visiblePolygons(state: readonly Cubie[], active: Turn | null, radians: number): Polygon[] {
  const polygons: Polygon[] = []
  for (const cubie of state) {
    const moving = !!active && active.layers.includes(cubie.position[active.axis])
    const transform = (v: Vec3): Vec3 => moving && active ? rotate(v, active.axis, radians) : v
    const center = transform(scale(cubie.position, PITCH))
    for (const face of FACES) {
      const normal = transform(face.normal)
      const lightNormal = view(normal)
      if (lightNormal[2] <= 0.005) continue
      const u = transform(face.u)
      const v = transform(face.v)
      const plastic = corners(center, normal, u, v, HALF, HALF).map(view)
      const matchingSticker = cubie.stickers.find(sticker => dot(sticker.normal, face.normal) > .99)
      const sticker = matchingSticker ? corners(center, normal, u, v, STICKER_HALF, HALF + .012).map(view) : null
      polygons.push({
        plastic,
        sticker,
        color: matchingSticker?.color || null,
        depth: plastic.reduce((sum, point) => sum + point[2], 0) / 4,
        light: lightNormal[2],
      })
    }
  }
  return polygons.sort((a, b) => a.depth - b.depth)
}
function shade(hex: string, brightness: number): string {
  const value = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.round(((value >> 16) & 255) * brightness))
  const g = Math.min(255, Math.round(((value >> 8) & 255) * brightness))
  const b = Math.min(255, Math.round((value & 255) * brightness))
  return `rgb(${r},${g},${b})`
}
function drawCube(canvas: HTMLCanvasElement, elapsed: number, duration: number, ghost: boolean): void {
  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return
  const width = canvas.getBoundingClientRect().width || 180
  const height = canvas.getBoundingClientRect().height || 180
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.round(width * dpr)
  const h = Math.round(height * dpr)
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)

  const ratio = Math.min(1, Math.max(0, elapsed / duration))
  const movePosition = ratio * solutionTurns.length
  const completed = Math.min(solutionTurns.length, Math.floor(movePosition))
  const current = completed < solutionTurns.length ? solutionTurns[completed] : null
  const fraction = movePosition - completed
  const eased = fraction * fraction * (3 - 2 * fraction)
  const radians = current ? current.direction * eased * (Math.PI / 2) : 0
  const scaleFactor = Math.min(width, height) / 5.0
  const project = (point: Vec3): [number, number] => {
    const perspective = 9 / (9 - point[2])
    return [width / 2 + point[0] * scaleFactor * perspective, height / 2 - point[1] * scaleFactor * perspective]
  }
  function trace(points: Vec3[]) {
    context!.beginPath()
    points.forEach((point, i) => {
      const [x, y] = project(point)
      if (i === 0) context!.moveTo(x, y)
      else context!.lineTo(x, y)
    })
    context!.closePath()
  }
  context.globalAlpha = ghost ? .82 : 1
  for (const polygon of visiblePolygons(SOLVE_STATES[completed], current, radians)) {
    trace(polygon.plastic)
    context.fillStyle = '#11141f'
    context.fill()
    context.strokeStyle = '#282d45'
    context.lineWidth = Math.max(.7, scaleFactor * .024)
    context.stroke()
    if (!polygon.sticker || !polygon.color) continue
    trace(polygon.sticker)
    const brightness = .75 + Math.min(.26, Math.max(0, polygon.light) * .28)
    const gradient = context.createLinearGradient(...project(polygon.sticker[0]), ...project(polygon.sticker[2]))
    gradient.addColorStop(0, shade(polygon.color, Math.min(1.15, brightness + .15)))
    gradient.addColorStop(1, shade(polygon.color, brightness))
    context.fillStyle = gradient
    context.fill()
    context.strokeStyle = 'rgba(255,255,255,.18)'
    context.lineWidth = Math.max(.5, scaleFactor * .012)
    context.stroke()
  }
  context.globalAlpha = 1
}

export default function LandingDuelCube({ elapsed, duration, ghost = false }: { elapsed: number; duration: number; ghost?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const latest = useRef({ elapsed, duration, ghost })
  latest.current = { elapsed, duration, ghost }
  useEffect(() => {
    if (!canvas.current) return
    const observer = new ResizeObserver(() => {
      const current = latest.current
      if (canvas.current) drawCube(canvas.current, current.elapsed, current.duration, current.ghost)
    })
    observer.observe(canvas.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (canvas.current) drawCube(canvas.current, elapsed, duration, ghost)
  }, [elapsed, duration, ghost])
  return <canvas className={`lp-real-cube${ghost ? ' is-ghost' : ''}`} ref={canvas} width={160} height={160} aria-hidden="true" />
}
