import { useEffect, useRef } from 'react'
import { formatTime } from '../lib/racing'

/**
 * Paint the visible stopwatch without requesting a whole React race-tree
 * render. The actual elapsed time is always read from performance.now(),
 * not from an interval tick count. Race completion uses the original clocks.
 */
export default function LiveTimerText({
  className, timeMs, precision, running, startAt, limitMs, 'aria-label': ariaLabel,
}: {
  className: string
  timeMs: number
  precision: 2 | 3
  running: boolean
  startAt: number | null
  limitMs?: number
  'aria-label'?: string
}) {
  const textRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!running || startAt === null) return
    let frameId = 0
    let lastDraw = -Infinity
    const update = (timestamp: number) => {
      // Avoid scheduling unnecessary DOM mutations in background tabs.
      if (!document.hidden && timestamp - lastDraw >= 45) {
        const raw = Math.max(0, performance.now() - startAt)
        const ms = limitMs === undefined ? raw : Math.min(limitMs, raw)
        const value = formatTime(ms, precision)
        // Keep React's original text node attached. Replacing the whole
        // element.textContent would detach its node and break the final result.
        const textNode = textRef.current?.firstChild
        if (textNode && textNode.nodeValue !== value) {
          textNode.nodeValue = value
        }
        lastDraw = timestamp
      }
      frameId = requestAnimationFrame(update)
    }
    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [running, startAt, limitMs, precision])

  return <div ref={textRef} className={className} aria-live="off" aria-label={ariaLabel}>
    {formatTime(timeMs, precision)}
  </div>
}
