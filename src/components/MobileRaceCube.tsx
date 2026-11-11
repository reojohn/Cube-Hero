import { memo, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { AiPlan } from '../lib/aiPlan'
import { cubeFacesAt } from '../lib/cubeState'
import type { Face } from '../lib/cubeState'
import { cubiesFromFaces, inTurningLayer } from '../lib/cubeTurning'
import type { Cubie } from '../lib/cubeTurning'
import { moveIndexAt } from '../lib/aiPlan'
import { mobileSliceTurn } from '../lib/mobileCubeTurn'

/**
 * Mobile race cube: the same solid cubie geometry used by the desktop model,
 * but no React/requestAnimationFrame loop during a turn. The selected slice
 * rotates as a single CSS-composited layer and the verified cube state is
 * committed at the real move boundary.
 *
 * Keeping all six plastic/sticker sides of every cubie is important: V3 mixed
 * flat face planes with isolated rotating stickers, exposing black holes when
 * the turn uncovered a face that did not exist in the flat representation.
 */
const SIDES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

type Props = {
  scramble: string
  plan: AiPlan
  active: boolean
  startAt: number | null
}

type TurnFrame = { completed: number; offsetMs: number; startAt: number | null; plan: AiPlan | null }

const SolidMobileCubie = memo(function SolidMobileCubie({ piece }: { piece: Cubie }) {
  return <div className="ai-turning-cubie ai-mobile-solid-cubie"
    style={{ transform: `translate3d(${piece.x * 100}%, ${-piece.y * 100}%, calc(var(--cube-cell) * ${piece.z}))` }}>
    {SIDES.map(face => <div key={face} className={`ai-turning-cubie-face ai-css-face-${face} ai-mobile-solid-face`} aria-hidden="true">
      {piece.stickers[face] && <span className={`ai-turning-sticker sticker-${piece.stickers[face]}`} />}
    </div>)}
  </div>
})

const MobileRaceCube = memo(function MobileRaceCube({ scramble, plan, active, startAt }: Props) {
  const [frame, setFrame] = useState<TurnFrame>({ completed: 0, offsetMs: 0, startAt: null, plan: null })

  useEffect(() => {
    let timer: number | undefined
    let disposed = false
    const sync = () => {
      if (disposed) return
      window.clearTimeout(timer)
      if (!active || startAt === null) {
        setFrame(previous => previous.completed === 0 && previous.startAt === null && previous.plan === plan
          ? previous : { completed: 0, offsetMs: 0, startAt: null, plan })
        return
      }
      if (document.hidden) return

      const elapsed = Math.max(0, performance.now() - startAt)
      const completed = moveIndexAt(plan, elapsed)
      const priorEnd = completed ? plan.moveEndsMs[completed - 1] : 0
      setFrame(previous => previous.completed === completed && previous.startAt === startAt && previous.plan === plan
        ? previous : { completed, offsetMs: Math.max(0, elapsed - priorEnd), startAt, plan })

      // React wakes only on actual move boundaries. A delayed wake catches up
      // to the high-resolution race clock instead of slowing the opponent.
      if (completed < plan.moves.length) {
        timer = window.setTimeout(sync, Math.max(5, plan.moveEndsMs[completed] - elapsed + 2))
      }
    }
    const visibilityChanged = () => {
      window.clearTimeout(timer)
      if (!document.hidden) sync()
    }
    sync()
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      disposed = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', visibilityChanged)
    }
  }, [active, startAt, plan])

  // Reset visual state when a new plan starts; never show the previous round.
  const completed = frame.plan === plan && frame.startAt === (active ? startAt : null)
    ? frame.completed : 0
  const cubeFaces = useMemo(() => cubeFacesAt(scramble, plan.moves, completed), [scramble, plan.moves, completed])
  const allPieces = useMemo(() => cubiesFromFaces(cubeFaces), [cubeFaces])
  const move = active && startAt !== null && completed < plan.moves.length ? plan.moves[completed] : null
  const turn = useMemo(() => move ? mobileSliceTurn(move) : null, [move])
  const movingPieces = useMemo(() => turn
    ? allPieces.filter(piece => inTurningLayer(piece, turn.axis, turn.layers)) : [], [allPieces, turn])
  const stationaryPieces = useMemo(() => turn
    ? allPieces.filter(piece => !inTurningLayer(piece, turn.axis, turn.layers)) : allPieces, [allPieces, turn])

  const priorEnd = completed ? plan.moveEndsMs[completed - 1] : 0
  const duration = completed < plan.moveEndsMs.length ? Math.max(1, plan.moveEndsMs[completed] - priorEnd) : 1
  const offset = frame.plan === plan && frame.startAt === startAt ? Math.min(frame.offsetMs, duration) : 0
  const animatedStyle = turn ? ({
    '--ch-mobile-slice-end': `rotate${turn.axis}(${turn.degrees}deg)`,
    animationDuration: `${duration}ms`,
    animationDelay: `-${offset}ms`,
  } as CSSProperties) : undefined

  return <div className="ai-3d-cube-shell ai-physical-turn-shell ai-mobile-solid-shell">
    <div className="ai-css-cube-stage ai-physical-turn-stage ai-mobile-solid-stage" role="img"
      aria-label={`Solid three-dimensional cube following the real scramble-specific CFOP solution: ${completed} of ${plan.moves.length} moves completed${move ? `, turning ${move}` : ''}.`}>
      <div className="ai-css-cube-aura" />
      <div className="ai-physical-cube-camera ai-mobile-solid-camera">
        <div className="ai-physical-cube-body">
          <div className="ai-physical-layer ai-mobile-stationary-layer">
            {stationaryPieces.map(piece => <SolidMobileCubie key={piece.id} piece={piece} />)}
          </div>
          {turn && <div key={`${startAt}-${completed}-${move}`} className="ai-physical-layer ai-mobile-turn-layer" style={animatedStyle}>
            {movingPieces.map(piece => <SolidMobileCubie key={piece.id} piece={piece} />)}
          </div>}
        </div>
      </div>
      <div className="ai-css-cube-floor" />
    </div>
  </div>
})

export default MobileRaceCube
