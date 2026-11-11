import type { Face } from './cubeState'
import { parseCubeMove } from './cubeMoves'
import type { Axis, Layer } from './cubeMoves'

/**
 * Locate a visible sticker in the same x/y/z coordinate system as
 * cubiesFromFaces(). This lets the low-cost sticker cube temporarily clear
 * only the squares occupied by a moving physical slice.
 *
 * Front is +Z, right is +X, up is +Y.
 */
export function visibleStickerInLayer(
  face: Face,
  index: number,
  axis: Axis,
  layers: readonly Layer[],
): boolean {
  const row = Math.floor(index / 3)
  const col = index % 3
  let x = 0, y = 0, z = 0
  switch (face) {
    case 'U': x = col - 1; y = 1; z = row - 1; break
    case 'D': x = col - 1; y = -1; z = 1 - row; break
    case 'F': x = col - 1; y = 1 - row; z = 1; break
    case 'B': x = 1 - col; y = 1 - row; z = -1; break
    case 'R': x = 1; y = 1 - row; z = 1 - col; break
    case 'L': x = -1; y = 1 - row; z = col - 1; break
  }
  return layers.includes((axis === 'X' ? x : axis === 'Y' ? y : z) as Layer)
}

export function mobileSliceTurn(move: string) {
  const instruction = parseCubeMove(move)
  // Mirror the coordinate convention in cubeTurning.turnAt(): CSS X/Z axes
  // have the opposite rotation sign to the integer sticker model.
  const cssSign = instruction.axis === 'Y' ? 1 : -1
  return {
    axis: instruction.axis,
    layers: instruction.layers,
    degrees: instruction.direction * cssSign * instruction.turns * 90,
  }
}
