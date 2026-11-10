/**
 * The notation shared by the CFOP solver, the 54-sticker model and the CSS-3D
 * renderer. SiGN wide/slice/rotation turns are physical layer operations, not
 * instant sticker swaps. A cube rotation turns all 27 cubies, including centers.
 */
export type Axis = 'X' | 'Y' | 'Z'
export type Layer = -1 | 0 | 1
export type CubeMove = {
  notation: string
  axis: Axis
  layers: readonly Layer[]
  direction: -1 | 1
  turns: 1 | 2
}

const FACE: Record<string, { axis: Axis; layers: Layer[]; clockwise: -1 | 1 }> = {
  U: { axis: 'Y', layers: [1], clockwise: -1 },
  D: { axis: 'Y', layers: [-1], clockwise: 1 },
  R: { axis: 'X', layers: [1], clockwise: -1 },
  L: { axis: 'X', layers: [-1], clockwise: 1 },
  F: { axis: 'Z', layers: [1], clockwise: -1 },
  B: { axis: 'Z', layers: [-1], clockwise: 1 },
  u: { axis: 'Y', layers: [0, 1], clockwise: -1 },
  d: { axis: 'Y', layers: [-1, 0], clockwise: 1 },
  r: { axis: 'X', layers: [0, 1], clockwise: -1 },
  l: { axis: 'X', layers: [-1, 0], clockwise: 1 },
  f: { axis: 'Z', layers: [0, 1], clockwise: -1 },
  b: { axis: 'Z', layers: [-1, 0], clockwise: 1 },
  M: { axis: 'X', layers: [0], clockwise: 1 },
  E: { axis: 'Y', layers: [0], clockwise: 1 },
  S: { axis: 'Z', layers: [0], clockwise: -1 },
  x: { axis: 'X', layers: [-1, 0, 1], clockwise: -1 },
  y: { axis: 'Y', layers: [-1, 0, 1], clockwise: -1 },
  z: { axis: 'Z', layers: [-1, 0, 1], clockwise: -1 },
}

export function parseCubeMove(notation: string): CubeMove {
  const match = /^([URFDLB]w?|[urfdlbMESxyz])(2|')?$/.exec(notation)
  if (!match) throw new Error(`Unsupported CFOP move: ${notation}`)
  const letter = match[1].length === 2 ? match[1][0].toLowerCase() : match[1]
  const template = FACE[letter]
  if (!template) throw new Error(`Unsupported CFOP move: ${notation}`)
  const reverse = match[2] === "'" ? -1 : 1
  return {
    notation,
    axis: template.axis,
    layers: template.layers,
    direction: (template.clockwise * reverse) as -1 | 1,
    turns: match[2] === '2' ? 2 : 1,
  }
}

export function tokenizeCubeMoves(sequence: string): string[] {
  const moves = sequence.trim().split(/\s+/).filter(Boolean)
  moves.forEach(parseCubeMove)
  return moves
}
