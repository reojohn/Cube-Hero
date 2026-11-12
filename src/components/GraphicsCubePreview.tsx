import { memo, useEffect, useState } from 'react'
import type { AiPlan } from '../lib/aiPlan'
import type { GraphicsQuality } from '../lib/graphicsQuality'
import RaceCubeVisual from './RaceCubeVisual'
import { isAndroidBrowser } from '../lib/mobilePerformance'

// This is a real, verified miniature playback of the same renderer used in
// Race AI and Ghost Race, not an SVG illustration of three identical cubes.
// Inverting the scramble makes the demonstrator finish solved.
const SCRAMBLE = "R U R' U' F R F'"
const MOVES = ['F', "R'", "F'", 'U', 'R', "U'", "R'"]
const MOVE_DURATION_MS = 550
const ENDS = MOVES.map((_, index) => (index + 1) * MOVE_DURATION_MS)
const ANIMATION_ENDS = MOVES.map((_, index) => (index + 1) * 1000)
const PLAN: AiPlan = {
  method: 'two-phase', solution: MOVES.join(' '), moves: MOVES,
  totalMs: ENDS[ENDS.length - 1], moveEndsMs: ENDS,
  animationEndsMs: ANIMATION_ENDS, segmentsMs: [1100, 1100, 1100, 550], qtm: MOVES.length,
}
const MODE_LABELS: Record<GraphicsQuality, string> = {
  low: 'STICKER UPDATES',
  medium: 'LIGHTWEIGHT 3D',
  high: 'DETAILED 3D',
}

function GraphicsCubePreview({ quality, playing, startAt }: {
  quality: GraphicsQuality
  playing: boolean
  startAt: number | null
}) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [compact] = useState(() => isAndroidBrowser() ||
    (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches))
  useEffect(() => {
    // The desktop High renderer needs a bounded visual frame update. Low and
    // Medium already wake up only at exact move boundaries by themselves.
    if (!playing || startAt === null || quality !== 'high' || compact) {
      setElapsedMs(0)
      return
    }
    let frame = 0
    let lastFrame = -Infinity
    const update = (now: number) => {
      if (now - lastFrame >= 33) {
        setElapsedMs(Math.min(PLAN.totalMs, Math.max(0, now - startAt)))
        lastFrame = now
      }
      if (now - startAt < PLAN.totalMs) frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [playing, startAt, quality, compact])

  return <span className={`ch-graphics-preview ch-graphics-preview-${quality}${playing ? ' is-playing' : ''}`}
    aria-label={`${quality} graphics cube preview. ${playing ? 'Simulating solution turns.' : 'Select Simulate turns for a live demonstration.'}`} role="img">
    <span className="ch-graphics-preview-actual" aria-hidden="true">
      <RaceCubeVisual graphics={quality} compact={compact} scramble={SCRAMBLE} plan={PLAN}
        elapsedMs={elapsedMs} active={playing} startAt={playing ? startAt : null}/>
    </span>
    <span className="ch-graphics-preview-quality" aria-hidden="true">{MODE_LABELS[quality]}</span>
    <span className="ch-graphics-preview-floor" aria-hidden="true" />
  </span>
}

export default memo(GraphicsCubePreview)
