import { memo, useEffect, useMemo, useState } from 'react'
import type { AiPlan } from '../lib/aiPlan'
import { cubeFacesAt } from '../lib/cubeState'
import type { Face } from '../lib/cubeState'
import { moveIndexAt } from '../lib/aiPlan'

/**
 * Low-cost, race-only cube for phone-sized viewports.
 *
 * The full 26-cubie physical 3D renderer is expensive on entry-level phones.
 * This shows the same verified scramble/CFOP move states using only three visible
 * sticker faces (27 tiles). Its own ~160ms clock is independent of the parent
 * arena's React updates and of the official performance.now() race clock.
 *
 * Desktop, Academy, and replay retain the complete physical turning cube.
 */
const VISIBLE_FACES: readonly Face[] = ['U', 'F', 'R']
const MOBILE_CUBE_DRAW_MS = 160

type Props = {
  scramble: string
  plan: AiPlan
  active: boolean
  startAt: number | null
}

const MobileRaceCube = memo(function MobileRaceCube({ scramble, plan, active, startAt }: Props) {
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    // A new scramble or round always starts from its verified scrambled state.
    if (!active || startAt === null) {
      setCompleted(0)
      return
    }
    const redraw = () => {
      if (document.hidden) return
      const elapsed = Math.max(0, performance.now() - startAt)
      const next = moveIndexAt(plan, elapsed)
      setCompleted(previous => previous === next ? previous : next)
    }
    redraw()
    const timer = window.setInterval(redraw, MOBILE_CUBE_DRAW_MS)
    return () => window.clearInterval(timer)
  }, [active, startAt, plan, scramble])

  const cubeFaces = useMemo(() => cubeFacesAt(scramble, plan.moves, completed), [scramble, plan, completed])
  return <div className="ai-3d-cube-shell ai-mobile-sticker-shell">
    <div className="ai-css-cube-stage ai-mobile-sticker-stage" role="img"
      aria-label={`Lightweight 3D cube, showing the real scramble-specific CFOP solution: ${completed} of ${plan.moves.length} moves completed.`}>
      <div className="ai-css-cube ai-mobile-sticker-cube">
        {VISIBLE_FACES.map(face => <div className={`ai-css-cube-face ai-css-face-${face}`} key={face}>
          {cubeFaces[face].map((color, index) => <span className={`ai-css-facelet sticker-${color}`} key={index} />)}
        </div>)}
      </div>
    </div>
  </div>
})

export default MobileRaceCube
