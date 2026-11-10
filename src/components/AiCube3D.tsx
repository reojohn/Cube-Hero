import { memo, useMemo } from 'react'
import type { AiPlan } from '../lib/aiPlan'
import { cubeFacesAt } from '../lib/cubeState'
import type { Face } from '../lib/cubeState'
import { cubiesFromFaces, inTurningLayer, turnAt } from '../lib/cubeTurning'
import type { Cubie } from '../lib/cubeTurning'

const SIDE_NAMES: Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

/** Each piece is a real 3D cubelet, with stickers attached to its surfaces.
 * Rotating the selected layer moves all nine pieces AND stickers as rigid bodies.
 * At the move boundary, the verified sticker model commits the new positions.
 */
const Cubelet = memo(function Cubelet({ piece }: { piece: Cubie }) {
  return <div className="ai-turning-cubie" style={{ transform: `translate3d(${piece.x * 100}%, ${-piece.y * 100}%, calc(var(--cube-cell) * ${piece.z}))` }}>
    {SIDE_NAMES.map(face => <div key={face} className={`ai-turning-cubie-face ai-css-face-${face}`} aria-hidden="true">
      {piece.stickers[face] && <span className={`ai-turning-sticker sticker-${piece.stickers[face]}`} />}
    </div>)}
  </div>
})

export default function AiCube3D({ scramble, plan, elapsedMs, viewRotation }: { scramble: string; plan: AiPlan; elapsedMs: number; viewRotation?: { x: number; y: number } }) {
  const turn = turnAt(plan, elapsedMs)
  const pieces = useMemo(() => cubiesFromFaces(cubeFacesAt(scramble, plan.moves, turn.completed)), [scramble, plan.moves, turn.completed])
  const turning = turn.move && turn.progress > 0 ? pieces.filter(piece => inTurningLayer(piece, turn.axis, turn.layers)) : []
  const stationary = turn.move && turn.progress > 0 ? pieces.filter(piece => !inTurningLayer(piece, turn.axis, turn.layers)) : pieces
  const solved = turn.completed === plan.moves.length
  const rotation = turn.move && turn.progress > 0 ? `rotate${turn.axis}(${turn.degrees.toFixed(3)}deg)` : undefined

  return <div className="ai-3d-cube-shell ai-physical-turn-shell">
    <div className="ai-css-cube-stage ai-physical-turn-stage" role="img" aria-label={`Three-dimensional cube with physically rotating layers. ${solved ? 'Solved' : `${turn.completed} of ${plan.moves.length} moves completed${turn.move ? `. Turning ${turn.move}` : ''}`}.`}>
      <div className="ai-css-cube-aura" />
      <div className="ai-physical-cube-camera">
        <div className="ai-physical-cube-body" style={viewRotation ? { transform: `rotateX(${viewRotation.x}deg) rotateY(${viewRotation.y}deg)` } : undefined}>
          <div className="ai-physical-layer">
            {stationary.map(piece => <Cubelet key={piece.id} piece={piece} />)}
          </div>
          {turn.move && turn.progress > 0 && <div className="ai-physical-layer ai-active-turn" style={{ transform: rotation }}>
            {turning.map(piece => <Cubelet key={piece.id} piece={piece} />)}
          </div>}
        </div>
      </div>
      <div className="ai-css-cube-floor" />
    </div>
  </div>
}
