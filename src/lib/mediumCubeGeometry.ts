import type { Face } from './cubeState'
import type { Cubie } from './cubeTurning'

/** Only render colored exterior stickers in Medium, once per physical cubie.
 * No hidden black plastic faces, translucent backing cube, or inset core. */
export const MEDIUM_CUBIE_FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

export function mediumMovingFaces(piece: Cubie): Face[] {
  return MEDIUM_CUBIE_FACES.filter(face => Boolean(piece.stickers[face]))
}
