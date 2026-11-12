import type { Face } from './cubeState'
import type { Cubie } from './cubeTurning'

/** Surface budget for Medium. A moving cubie exposes only its real
 * stickered faces. This removes the dark filler/cut faces that were still
 * visible during some turns. A six-face sticker backing stays complete
 * through each turn, while only the moving slice uses individual cubies. */
export const MEDIUM_STATIC_FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']
export const MEDIUM_CUBIE_FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

export function mediumMovingFaces(piece: Cubie, _axis: 'X' | 'Y' | 'Z'): Face[] {
  return MEDIUM_CUBIE_FACES.filter(face => Boolean(piece.stickers[face]))
}
