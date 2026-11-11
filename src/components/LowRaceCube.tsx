import { memo, useEffect, useMemo, useState } from 'react'
import type { AiPlan } from '../lib/aiPlan'
import { moveIndexAt } from '../lib/aiPlan'
import type { Face } from '../lib/cubeState'
import { cubeFacesTimeline } from '../lib/cubeState'

const VISIBLE_FACES: readonly Face[] = ['U', 'R', 'F']

type Props = {
  scramble: string
  plan: AiPlan
  active: boolean
  startAt: number | null
}

/**
 * 27 visible sticker squares only: no physical cubelets, no animated layers,
 * no per-frame React rendering. This faithfully commits the scramble-specific
 * solution state at its ORIGINAL move boundaries, including on a late wake-up.
 */
const LowRaceCube = memo(function LowRaceCube({ scramble, plan, active, startAt }: Props) {
  const [frame, setFrame] = useState({ plan: null as AiPlan | null, startAt: null as number | null, completed: 0 })
  const snapshots = useMemo(() => cubeFacesTimeline(scramble, plan.moves), [scramble, plan.moves])

  useEffect(() => {
    let timer: number | undefined
    let disposed = false
    const sync = () => {
      window.clearTimeout(timer)
      if (disposed) return
      if (!active || startAt === null) {
        setFrame(previous => previous.plan === plan && previous.startAt === null && previous.completed === 0
          ? previous : { plan, startAt: null, completed: 0 })
        return
      }
      if (document.hidden) return
      const elapsed = Math.max(0, performance.now() - startAt)
      const completed = moveIndexAt(plan, elapsed)
      setFrame(previous => previous.plan === plan && previous.startAt === startAt && previous.completed === completed
        ? previous : { plan, startAt, completed })
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

  // Never briefly show the previous round's final colors before a new plan starts.
  const completed = frame.plan === plan && frame.startAt === (active ? startAt : null) ? frame.completed : 0
  const faces = snapshots[completed] ?? snapshots[0]
  return <div className="ai-3d-cube-shell ch-low-cube-shell">
    <div className="ai-css-cube-stage ch-low-cube-stage" role="img" aria-label={`Three-dimensional sticker cube, low graphics. ${completed} of ${plan.moves.length} verified moves completed.`}>
      <div className="ai-css-cube ch-low-sticker-cube">
        {VISIBLE_FACES.map(face => <div key={face} className={`ai-css-cube-face ai-css-face-${face}`}>
          {faces[face].map((sticker, index) => <span key={`${face}-${index}`} className={`ai-css-facelet sticker-${sticker}`} />)}
        </div>)}
      </div>
    </div>
  </div>
})

export default LowRaceCube
