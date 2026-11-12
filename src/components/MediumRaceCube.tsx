import { memo, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { moveIndexAt } from '../lib/aiPlan'
import type { AiPlan } from '../lib/aiPlan'
import { cubeFacesTimeline } from '../lib/cubeState'
import { inTurningLayer } from '../lib/cubeTurning'
import type { Cubie } from '../lib/cubeTurning'
import { buildSolidCubeFrames } from '../lib/mobileCubeFrames'
import { mobileSliceTurn } from '../lib/mobileCubeTurn'
import { MEDIUM_STATIC_FACES, mediumMovingFaces } from '../lib/mediumCubeGeometry'

type Props = {
  scramble: string
  plan: AiPlan
  active: boolean
  startAt: number | null
}
type Frame = { plan: AiPlan | null; startedAt: number | null; completed: number; offsetMs: number }
type Turn = ReturnType<typeof mobileSliceTurn>

/**
 * Medium keeps one low-cost sticker-backed cube in the background and creates
 * actual rotating cubies only for the active slice. The backing (all six
 * faces) remains colored while a layer turns, so rotation cannot uncover a
 * black void. A recessed, six-sided colored core closes off the view through
 * corner gaps without the heavy 26-piece High renderer.
 */
const MediumMovingCubie = memo(function MediumMovingCubie({ piece, axis }: { piece: Cubie; axis: Turn['axis'] }) {
  return <div className="ai-turning-cubie ch-medium-moving-cubie"
    style={{ transform: `translate3d(${piece.x * 100}%, ${-piece.y * 100}%, calc(var(--cube-cell) * ${piece.z}))` }}>
    {mediumMovingFaces(piece, axis).map(face => <div key={face}
        className={`ai-turning-cubie-face ai-css-face-${face} ch-medium-moving-face${piece.stickers[face] ? ` sticker-${piece.stickers[face]}` : ''}`}
        aria-hidden="true" />)}
  </div>
})

const MediumRaceCube = memo(function MediumRaceCube({ scramble, plan, active, startAt }: Props) {
  const [frame, setFrame] = useState<Frame>({ plan: null, startedAt: null, completed: 0, offsetMs: 0 })

  useEffect(() => {
    let timer: number | undefined
    let disposed = false
    const sync = () => {
      window.clearTimeout(timer)
      if (disposed) return
      if (!active || startAt === null) {
        setFrame(previous => previous.plan === plan && previous.startedAt === null && previous.completed === 0
          ? previous : { plan, startedAt: null, completed: 0, offsetMs: 0 })
        return
      }
      if (document.hidden) return
      // Use the official performance clock. A delayed WebView wake skips ahead,
      // never accumulating animation/timer delay or modifying an AI result.
      const elapsed = Math.max(0, performance.now() - startAt)
      const completed = moveIndexAt(plan, elapsed)
      const priorEnd = completed ? plan.moveEndsMs[completed - 1] : 0
      setFrame(previous => previous.plan === plan && previous.startedAt === startAt && previous.completed === completed
        ? previous : { plan, startedAt: startAt, completed, offsetMs: Math.max(0, elapsed - priorEnd) })
      if (completed < plan.moves.length) {
        timer = window.setTimeout(sync, Math.max(5, plan.moveEndsMs[completed] - elapsed + 2))
      }
    }
    const onVisibilityChange = () => {
      window.clearTimeout(timer)
      if (!document.hidden) sync()
    }
    sync()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      disposed = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [active, startAt, plan])

  const completed = frame.plan === plan && frame.startedAt === (active ? startAt : null) ? frame.completed : 0
  // Prepare face states once; only the current layer changes in the live loop.
  // The backing has 54 flat stickers plus a six-face inset core (no 26-piece scene).
  const facesTimeline = useMemo(() => cubeFacesTimeline(scramble, plan.moves), [scramble, plan.moves])
  const cubieTimeline = useMemo(() => buildSolidCubeFrames(scramble, plan.moves), [scramble, plan.moves])
  const faces = facesTimeline[completed] ?? facesTimeline[0]
  const move = active && startAt !== null && completed < plan.moves.length ? plan.moves[completed] : null
  const turn = useMemo(() => move ? mobileSliceTurn(move) : null, [move])
  const pieces = cubieTimeline[completed] ?? cubieTimeline[0]
  const moving = useMemo(() => turn
    ? pieces.filter(piece => inTurningLayer(piece, turn.axis, turn.layers)) : [], [pieces, turn])
  const priorEnd = completed ? plan.moveEndsMs[completed - 1] : 0
  const duration = completed < plan.moveEndsMs.length ? Math.max(1, plan.moveEndsMs[completed] - priorEnd) : 1
  const offset = frame.plan === plan && frame.startedAt === startAt ? Math.min(frame.offsetMs, duration) : 0
  const animation = turn ? ({
    '--ch-mobile-slice-end': `rotate${turn.axis}(${turn.degrees}deg)`,
    animationDuration: `${duration}ms`,
    animationDelay: `-${offset}ms`,
  } as CSSProperties) : undefined

  return <div className="ai-3d-cube-shell ai-physical-turn-shell ch-medium-cube-shell">
    <div className="ai-css-cube-stage ai-physical-turn-stage ai-mobile-solid-stage ch-medium-stage" role="img"
      aria-label={`Three-dimensional cube with lightweight physical layer rotations. ${completed} of ${plan.moves.length} verified moves completed${move ? `, turning ${move}` : ''}.`}>
      <div className="ai-physical-cube-camera ai-mobile-solid-camera">
        <div className="ai-physical-cube-body">
          <div className="ch-medium-inner-core" aria-hidden="true">
            {MEDIUM_STATIC_FACES.map(face => <div key={face}
              className={`ch-medium-core-face ai-css-face-${face} sticker-${faces[face][4]}`} />)}
          </div>
          <div className="ch-medium-static-faces" aria-hidden="true">
            {MEDIUM_STATIC_FACES.map(face => <div key={face} className={`ai-css-cube-face ai-css-face-${face} ch-medium-static-face`}>
              {faces[face].map((sticker, index) => <span key={`${face}-${index}`}
                className={`ai-css-facelet sticker-${sticker}`} />)}
            </div>)}
          </div>
          {turn && <div key={`${startAt}-${completed}-${move}`} className="ai-physical-layer ai-mobile-turn-layer ch-medium-turn-layer" style={animation}>
            {moving.map(piece => <MediumMovingCubie key={piece.id} piece={piece} axis={turn.axis} />)}
          </div>}
        </div>
      </div>
    </div>
  </div>
})

export default MediumRaceCube
