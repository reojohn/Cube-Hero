import { memo, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { AiPlan } from '../lib/aiPlan'
import { cubeFacesAt } from '../lib/cubeState'
import type { Face } from '../lib/cubeState'
import { cubiesFromFaces, inTurningLayer } from '../lib/cubeTurning'
import type { Cubie } from '../lib/cubeTurning'
import { moveIndexAt } from '../lib/aiPlan'
import { mobileSliceTurn, visibleStickerInLayer } from '../lib/mobileCubeTurn'

/**
 * Race-only lightweight *turning* cube for phones.
 *
 * Three static sticker planes (27 squares) stay mounted while just the active
 * physical slice rotates using one compositor-driven CSS transform. Unlike
 * the desktop renderer, we never mount all 26 cubelets / 156 cubie surfaces.
 * React wakes only at a verified move boundary, not on every animation frame.
 * It follows the exact AI/ghost plan relative to performance.now(), and the
 * official race clocks/results are never tied to the visual animation.
 */
const VISIBLE_FACES: readonly Face[] = ['U', 'F', 'R']
const ALL_FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B']

type Props = {
  scramble: string
  plan: AiPlan
  active: boolean
  startAt: number | null
}

type TurnFrame = { completed: number; offsetMs: number; startAt: number | null; plan: AiPlan | null }

const MobileTurnCubelet = memo(function MobileTurnCubelet({ piece }: { piece: Cubie }) {
  // Only build outward sticker faces. Interior cubie faces are not needed on
  // the tiny mobile model (the dark backing planes provide the cube body).
  return <div className="ai-turning-cubie ai-mobile-turn-cubie"
    style={{ transform: `translate3d(${piece.x * 100}%, ${-piece.y * 100}%, calc(var(--cube-cell) * ${piece.z}))` }}>
    {ALL_FACES.map(face => piece.stickers[face] ?
      <div key={face} className={`ai-turning-cubie-face ai-css-face-${face}`} aria-hidden="true">
        <span className={`ai-turning-sticker sticker-${piece.stickers[face]}`} />
      </div> : null)}
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

      // No per-frame JavaScript or React animation loop. Wake precisely at the
      // next move's real timestamp, even on very fast Sub-6 rivals.
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
  }, [active, startAt, plan, scramble])

  // On a new round, never accidentally show a prior round's final cube state.
  const completed = frame.plan === plan && frame.startAt === (active ? startAt : null)
    ? frame.completed : 0
  const cubeFaces = useMemo(() => cubeFacesAt(scramble, plan.moves, completed), [scramble, plan.moves, completed])
  const move = active && startAt !== null && completed < plan.moves.length ? plan.moves[completed] : null
  const turn = useMemo(() => move ? mobileSliceTurn(move) : null, [move])
  const movingPieces = useMemo(() => {
    if (!turn) return []
    return cubiesFromFaces(cubeFaces).filter(piece =>
      inTurningLayer(piece, turn.axis, turn.layers) && ALL_FACES.some(face => Boolean(piece.stickers[face])))
  }, [cubeFaces, turn])
  const priorEnd = completed ? plan.moveEndsMs[completed - 1] : 0
  const duration = completed < plan.moveEndsMs.length ? Math.max(1, plan.moveEndsMs[completed] - priorEnd) : 1
  const offset = frame.plan === plan && frame.startAt === startAt ? Math.min(frame.offsetMs, duration) : 0
  const animatedStyle = turn ? ({
    '--ch-mobile-slice-end': `rotate${turn.axis}(${turn.degrees}deg)`,
    animationDuration: `${duration}ms`,
    animationDelay: `-${offset}ms`,
  } as CSSProperties) : undefined

  return <div className="ai-3d-cube-shell ai-mobile-sticker-shell ai-mobile-turning-shell">
    <div className="ai-css-cube-stage ai-mobile-sticker-stage" role="img"
      aria-label={`Lightweight physically turning cube showing the real scramble-specific CFOP solution: ${completed} of ${plan.moves.length} moves completed${move ? `, turning ${move}` : ''}.`}>
      <div className="ai-css-cube ai-mobile-sticker-cube">
        {VISIBLE_FACES.map(face => <div className={`ai-css-cube-face ai-css-face-${face}`} key={face}>
          {cubeFaces[face].map((color, index) => <span
            className={`ai-css-facelet sticker-${color}${turn && visibleStickerInLayer(face, index, turn.axis, turn.layers) ? ' ai-mobile-hidden-turn-sticker' : ''}`}
            key={index} />)}
        </div>)}
        {turn && <div key={`${startAt}-${completed}-${move}`} className="ai-mobile-turn-layer" style={animatedStyle}>
          {movingPieces.map(piece => <MobileTurnCubelet key={piece.id} piece={piece} />)}
        </div>}
      </div>
    </div>
  </div>
})

export default MobileRaceCube
