import type { AiPlan } from './aiPlan'
import type { CubeFaces, Face } from './cubeState'
import { parseCubeMove } from './cubeMoves'

/**
 * CSS 3D models each of the 26 physical pieces independently. The facelet
 * model is the single source of truth, so there is no separate fake cube state.
 * x: right, y: up, z: front (same convention as cubeState.ts).
 */
export type Cubie = {
  id: string
  x: -1 | 0 | 1
  y: -1 | 0 | 1
  z: -1 | 0 | 1
  stickers: Partial<Record<Face, Face>>
}

const COORDS = [-1, 0, 1] as const
export function cubiesFromFaces(faces: CubeFaces): Cubie[] {
  const cubies: Cubie[] = []
  for (const x of COORDS) for (const y of COORDS) for (const z of COORDS) {
    if (!x && !y && !z) continue
    const stickers: Partial<Record<Face, Face>> = {}
    if (y === 1) stickers.U = faces.U[(z + 1) * 3 + x + 1]
    if (y === -1) stickers.D = faces.D[(1 - z) * 3 + x + 1]
    if (z === 1) stickers.F = faces.F[(1 - y) * 3 + x + 1]
    if (z === -1) stickers.B = faces.B[(1 - y) * 3 + 1 - x]
    if (x === 1) stickers.R = faces.R[(1 - y) * 3 + 1 - z]
    if (x === -1) stickers.L = faces.L[(1 - y) * 3 + z + 1]
    cubies.push({ id: `${x}/${y}/${z}`, x, y, z, stickers })
  }
  return cubies
}

/** Maps the currently executing verified move onto a *physical slice rotation*.
 * CSS has a downward-facing y-axis; X and Z angles invert versus the cube model.
 * Scrubbing to an arbitrary timestamp reconstructs the same pose deterministically.
 */
export function turnAt(plan: AiPlan, elapsedMs: number): {
  completed: number
  face: Face | null
  layers: readonly (-1 | 0 | 1)[]
  axis: 'X' | 'Y' | 'Z'
  degrees: number
  progress: number
  move: string | null
} {
  let completed = 0
  while (completed < plan.moveEndsMs.length && elapsedMs >= plan.moveEndsMs[completed]) completed++
  const move = completed < plan.moves.length ? plan.moves[completed] : null
  const inactive = { completed, face: null, layers: [] as (-1 | 0 | 1)[], axis: 'Y' as const, degrees: 0, progress: 0, move }
  if (!move || elapsedMs <= 0) return inactive
  const instruction = parseCubeMove(move)
  const start = completed ? plan.moveEndsMs[completed - 1] : 0
  const end = plan.moveEndsMs[completed]
  const progress = Math.max(0, Math.min(1, (elapsedMs - start) / Math.max(1, end - start)))
  // CSS's X/Z rotation signs are reversed relative to the integer cubie model.
  const cssSign = instruction.axis === 'Y' ? 1 : -1
  const degrees = instruction.direction * cssSign * instruction.turns * 90 * progress
  return {
    completed,
    face: 'URFDLB'.includes(move[0]) ? move[0] as Face : null,
    layers: instruction.layers,
    axis: instruction.axis,
    degrees,
    progress,
    move,
  }
}

export function inTurningLayer(cubie: Cubie, axis: 'X' | 'Y' | 'Z', layers: readonly (-1 | 0 | 1)[]): boolean {
  return layers.includes(axis === 'X' ? cubie.x : axis === 'Y' ? cubie.y : cubie.z)
}
