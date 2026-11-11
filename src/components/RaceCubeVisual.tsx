import type { AiPlan } from '../lib/aiPlan'
import type { GraphicsQuality } from '../lib/graphicsQuality'
import AiCube3D from './AiCube3D'
import LowRaceCube from './LowRaceCube'
import MobileRaceCube from './MobileRaceCube'

type Props = {
  scramble: string
  plan: AiPlan
  elapsedMs: number
  active: boolean
  startAt: number | null
  compact: boolean
  graphics: GraphicsQuality
}

/** One renderer selection for both AI racing and Ghost racing, including multi-AI. */
export default function RaceCubeVisual({ scramble, plan, elapsedMs, active, startAt, compact, graphics }: Props) {
  if (graphics === 'low') {
    return <LowRaceCube scramble={scramble} plan={plan} active={active} startAt={startAt} />
  }
  if (graphics === 'medium' || compact) {
    return <MobileRaceCube scramble={scramble} plan={plan} active={active} startAt={startAt} quality={graphics} />
  }
  // High on desktop stays exactly the existing high-fidelity renderer.
  return <AiCube3D scramble={scramble} plan={plan} elapsedMs={elapsedMs} />
}
