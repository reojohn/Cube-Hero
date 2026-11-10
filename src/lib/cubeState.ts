/**
 * Tiny, dependency-free 3x3 sticker model for the Cube Hero 3D visualization.
 * Every sticker is tracked by its cubie position + outward-facing normal.
 * This avoids an empty cube panel when WebGL / cubing.js rendering is unavailable.
 * Supports the same face turns (U R F D L B, prime, double) as the race solver.
 */
import { parseCubeMove } from './cubeMoves'

export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'
type Vector = [number, number, number]
type Sticker = { position: Vector; normal: Vector; color: Face }
export type CubeFaces = Record<Face, Face[]>

const FACES: Face[] = ['U', 'R', 'F', 'D', 'L', 'B']
function sticker(face: Face, row: number, col: number): Sticker {
  const x = col - 1
  const y = 1 - row
  const plane = row - 1
  switch (face) {
    case 'F': return { position: [x, y, 1], normal: [0, 0, 1], color: face }
    case 'B': return { position: [-x, y, -1], normal: [0, 0, -1], color: face }
    case 'U': return { position: [x, 1, plane], normal: [0, 1, 0], color: face }
    case 'D': return { position: [x, -1, -plane], normal: [0, -1, 0], color: face }
    case 'R': return { position: [1, y, -x], normal: [1, 0, 0], color: face }
    case 'L': return { position: [-1, y, x], normal: [-1, 0, 0], color: face }
  }
}

function rotate(v: Vector, axis: 0 | 1 | 2, sign: -1 | 1): Vector {
  const [x, y, z] = v
  switch (axis) {
    case 0: return sign === 1 ? [x, -z, y] : [x, z, -y]
    case 1: return sign === 1 ? [z, y, -x] : [-z, y, x]
    case 2: return sign === 1 ? [-y, x, z] : [y, -x, z]
  }
}

function makeSolvedStickers(): Sticker[] {
  const result: Sticker[] = []
  for (const face of FACES) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) result.push(sticker(face, row, col))
    }
  }
  return result
}

function turn(stickers: Sticker[], move: string): void {
  const motion = parseCubeMove(move)
  const axis: 0 | 1 | 2 = motion.axis === 'X' ? 0 : motion.axis === 'Y' ? 1 : 2
  for (let n = 0; n < motion.turns; n++) {
    for (const piece of stickers) {
      if (motion.layers.includes(piece.position[axis] as -1 | 0 | 1)) {
        piece.position = rotate(piece.position, axis, motion.direction)
        piece.normal = rotate(piece.normal, axis, motion.direction)
      }
    }
  }
}

function visibleFace(normal: Vector): Face {
  if (normal[0] === 1) return 'R'
  if (normal[0] === -1) return 'L'
  if (normal[1] === 1) return 'U'
  if (normal[1] === -1) return 'D'
  if (normal[2] === 1) return 'F'
  return 'B'
}

function faceIndex(face: Face, position: Vector): number {
  const [x, y, z] = position
  let row: number
  let col: number
  switch (face) {
    case 'F': row = 1 - y; col = x + 1; break
    case 'B': row = 1 - y; col = 1 - x; break
    case 'U': row = z + 1; col = x + 1; break
    case 'D': row = 1 - z; col = x + 1; break
    case 'R': row = 1 - y; col = 1 - z; break
    case 'L': row = 1 - y; col = z + 1; break
  }
  return row * 3 + col
}

/** Return the visible cube state after the shared scramble and N solution moves. */
export function cubeFacesAt(scramble: string, solutionMoves: readonly string[] = [], completedMoves = 0): CubeFaces {
  const stickers = makeSolvedStickers()
  for (const move of scramble.trim().split(/\s+/).filter(Boolean)) turn(stickers, move)
  for (const move of solutionMoves.slice(0, Math.max(0, Math.min(solutionMoves.length, completedMoves)))) turn(stickers, move)
  const output: CubeFaces = { U: Array(9), R: Array(9), F: Array(9), D: Array(9), L: Array(9), B: Array(9) }
  for (const piece of stickers) {
    const face = visibleFace(piece.normal)
    output[face][faceIndex(face, piece.position)] = piece.color
  }
  return output
}

/** All six faces are single-colored, regardless of legal whole-cube rotations. */
export function isVisuallySolved(faces: CubeFaces): boolean {
  return FACES.every(face => faces[face].every(color => color === faces[face][4]))
}

