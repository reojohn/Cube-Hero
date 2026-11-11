import { cubeFacesTimeline } from './cubeState'
import type { Face } from './cubeState'
import { cubiesFromFaces } from './cubeTurning'
import type { Cubie } from './cubeTurning'

const SIDES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

/** Prepare the exact same 26-piece geometry for every verified move boundary.
 * The cost is paid once when the plan is loaded, not during live competition.
 * Sharing unchanged cubie objects lets React.memo avoid re-rendering their
 * six physical faces; the animation and the sticker model are unchanged.
 */
export function buildSolidCubeFrames(scramble: string, moves: readonly string[]): readonly (readonly Cubie[])[] {
  let previous: readonly Cubie[] | null = null
  return cubeFacesTimeline(scramble, moves).map(faces => {
    const pieces = cubiesFromFaces(faces)
    if (previous) {
      for (let index = 0; index < pieces.length; index++) {
        const before = previous[index]
        const after = pieces[index]
        if (SIDES.every(face => before.stickers[face] === after.stickers[face])) {
          pieces[index] = before
        }
      }
    }
    previous = pieces
    return pieces
  })
}
