import { memo, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { buildSolidCubeFrames } from '../lib/mobileCubeFrames'
import { inTurningLayer } from '../lib/cubeTurning'
import type { Cubie } from '../lib/cubeTurning'
import { mediumMovingFaces } from '../lib/mediumCubeGeometry'
import { mobileSliceTurn } from '../lib/mobileCubeTurn'

/**
 * Lightweight landing-page version of the app's Medium graphics renderer.
 *
 * The two racers share one legal scramble and inverse solution. Only the active
 * cubie slice is animated with one compositor-friendly CSS transform; we never
 * draw every canvas polygon or update React state on each animation frame.
 * The parent still owns the demo race clock and winner announcements.
 */
// The previous 12-move inverse took 0.67 s per turn in an 8 s race.
// A 44-turn legal sequence lets the same Medium-style physical slice
// animation run at speedcubing pace (~5.5 turns/s at an 8 s finish).
// Both competitors use the exact same scramble and inverse solve.
const SCRAMBLE = [
  'R', 'U2', "F'", 'L', 'D', 'B2', "R'", 'U', 'F2', "L'", 'D2', 'B',
  "U'", 'R2', 'F', "D'", 'L2', "B'", 'U2', 'R', "F'", 'D', "L'", 'B2',
  'R', "U'", 'F2', "D'", 'L2', 'B', 'U', "R'", 'D2', 'F', "L'", 'U2',
  "B'", 'R2', 'D', 'F2', "U'", 'L', 'B2', "R'",
] as const
// A 180-degree turn is its own inverse (B2 -> B2, never B2').
// The shared cube parser only accepts a prime on a quarter turn.
const inverse = (move: string) => move.endsWith('2')
  ? move
  : move.endsWith("'") ? move.slice(0, -1) : `${move}'`
const SOLUTION = [...SCRAMBLE].reverse().map(inverse)
const FRAMES = buildSolidCubeFrames(SCRAMBLE.join(' '), SOLUTION)
const TURNS = SOLUTION.map(mobileSliceTurn)

type Props = { elapsed: number; duration: number; ghost?: boolean }

function stepAt({ elapsed, duration }: Pick<Props, 'elapsed' | 'duration'>): number {
  if (duration <= 0) return SOLUTION.length
  return Math.min(SOLUTION.length, Math.floor(Math.min(1, Math.max(0, elapsed / duration)) * SOLUTION.length))
}

const MediumCubie = memo(function MediumCubie({ piece }: { piece: Cubie }) {
  const faces = mediumMovingFaces(piece)
  return <div className="lp-medium-cubie" style={{ transform: `translate3d(${piece.x * 100}%, ${-piece.y * 100}%, calc(var(--lp-cube-cell) * ${piece.z}))` }}>
    {faces.map(face => <div key={face} className={`lp-medium-face lp-medium-face-${face} lp-medium-sticker-${piece.stickers[face]}`} />)}
  </div>
})

function LandingDuelCube({ elapsed, duration, ghost = false }: Props) {
  const completed = stepAt({ elapsed, duration })
  const turn = TURNS[completed] ?? null
  const pieces = FRAMES[completed]
  const { stationary, moving } = useMemo(() => {
    if (!turn) return { stationary: pieces, moving: [] as readonly Cubie[] }
    return {
      stationary: pieces.filter(piece => !inTurningLayer(piece, turn.axis, turn.layers)),
      moving: pieces.filter(piece => inTurningLayer(piece, turn.axis, turn.layers)),
    }
  }, [pieces, turn])

  // A React wake-up can land partway into a turn: jump directly to that point
  // using a negative animation delay and let CSS finish smoothly at 60 fps.
  // The memo comparator prevents ordinary timer ticks from restarting it.
  const moveMs = duration * 1000 / SOLUTION.length
  const elapsedMs = Math.max(0, Math.min(duration, elapsed)) * 1000
  const startedMoveMs = completed * moveMs
  const offsetMs = Math.min(moveMs, Math.max(0, elapsedMs - startedMoveMs))
  const style = turn ? ({
    '--lp-slice-turn-end': `rotate${turn.axis}(${turn.degrees}deg)`,
    animationDuration: `${moveMs}ms`,
    animationDelay: `-${offsetMs}ms`,
  } as CSSProperties) : undefined

  return <div className={`lp-real-cube lp-medium-cube${ghost ? ' is-ghost' : ''}`} aria-hidden="true">
    <div className="lp-medium-camera"><div className="lp-medium-body">
      <div className="lp-medium-layer">
        {stationary.map(piece => <MediumCubie key={piece.id} piece={piece} />)}
      </div>
      {turn && <div className="lp-medium-layer lp-medium-turn-layer" key={completed} style={style}>
        {moving.map(piece => <MediumCubie key={piece.id} piece={piece} />)}
      </div>}
    </div></div>
  </div>
}

// Timer text may tick ~8 times a second; the cube should re-render only when
// the next physical layer turn starts (roughly 0.17-0.23 seconds per move).
export default memo(LandingDuelCube, (before, after) =>
  before.ghost === after.ghost &&
  before.duration === after.duration &&
  stepAt(before) === stepAt(after),
)
