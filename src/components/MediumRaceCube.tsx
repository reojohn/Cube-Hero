import { memo, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { moveIndexAt } from '../lib/aiPlan'
import type { AiPlan } from '../lib/aiPlan'
import { inTurningLayer } from '../lib/cubeTurning'
import type { Cubie } from '../lib/cubeTurning'
import { buildSolidCubeFrames } from '../lib/mobileCubeFrames'
import { mobileSliceTurn } from '../lib/mobileCubeTurn'
import { mediumMovingFaces } from '../lib/mediumCubeGeometry'

type Props = {
  scramble: string
  plan: AiPlan
  active: boolean
  startAt: number | null
}
type Frame = { plan: AiPlan | null; startedAt: number | null; completed: number; offsetMs: number }

/**
 * One real physical cube, with each sticker face rendered exactly once.
 * A moving slice is temporarily placed in the animated layer while the other
 * cubies remain stationary; no second cube or frozen face planes are drawn.
 * This uses at most 54 colored faces across 26 lightweight cubies, versus
 * High's 156 plastic faces plus separate sticker elements.
 */
const MediumCubie = memo(function MediumCubie({ piece }: { piece: Cubie }) {
  return <div className="ai-turning-cubie ch-medium-moving-cubie"
    style={{ transform: `translate3d(${piece.x * 100}%, ${-piece.y * 100}%, calc(var(--cube-cell) * ${piece.z}))` }}>
    {mediumMovingFaces(piece).map(face => <div key={face}
      className={`ai-turning-cubie-face ai-css-face-${face} ch-medium-moving-face sticker-${piece.stickers[face]}`}
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
  // Calculate the shared verified 26-cubie state once, before the race.
  // No separate flat cube, duplicate backing, or inner cube exists.
  const cubieTimeline = useMemo(() => buildSolidCubeFrames(scramble, plan.moves), [scramble, plan.moves])
  const move = active && startAt !== null && completed < plan.moves.length ? plan.moves[completed] : null
  const turn = useMemo(() => move ? mobileSliceTurn(move) : null, [move])
  const pieces = cubieTimeline[completed] ?? cubieTimeline[0]
  const moving = useMemo(() => turn
    ? pieces.filter(piece => inTurningLayer(piece, turn.axis, turn.layers)) : [], [pieces, turn])
  const stationary = useMemo(() => turn
    ? pieces.filter(piece => !inTurningLayer(piece, turn.axis, turn.layers)) : pieces, [pieces, turn])
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
          <div className="ai-physical-layer ch-medium-stationary-layer">
            {stationary.map(piece => <MediumCubie key={piece.id} piece={piece} />)}
          </div>
          {turn && <div key={`${startAt}-${completed}-${move}`} className="ai-physical-layer ai-mobile-turn-layer ch-medium-turn-layer" style={animation}>
            {moving.map(piece => <MediumCubie key={piece.id} piece={piece} />)}
          </div>}
        </div>
      </div>
    </div>
  </div>
})

export default MediumRaceCube
