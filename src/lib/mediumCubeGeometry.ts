import type { Face } from './cubeState'
import type { Cubie } from './cubeTurning'

/** Surface budget for Medium. A moving cubie needs its original sticker faces
 * and both opaque faces normal to the rotating axis (these close cut holes).
 * All other hidden plastic faces are omitted. The unchanged cube shows only
 * 3 static 3x3 face planes, not 26 permanent 3D cubies. */
export const MEDIUM_STATIC_FACES: readonly Face[] = ['U', 'R', 'F']
export const MEDIUM_CUBIE_FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

export function mediumMovingFaces(piece: Cubie, axis: 'X' | 'Y' | 'Z'): Face[] {
  return MEDIUM_CUBIE_FACES.filter(face => Boolean(piece.stickers[face]) ||
    (axis === 'X' ? face === 'R' || face === 'L'
      : axis === 'Y' ? face === 'U' || face === 'D'
        : face === 'F' || face === 'B'))
}
