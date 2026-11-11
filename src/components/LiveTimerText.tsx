import { memo, useEffect, useRef } from 'react'
import { formatTime } from '../lib/racing'
import { isAndroidBrowser, isCompactPerformanceViewport } from '../lib/mobilePerformance'
import { subscribeAndroidStopwatch } from '../lib/mobileClockScheduler'

/**
 * Paint the visible stopwatch without requesting a whole React race-tree
 * render. The actual elapsed time is always read from performance.now(),
 * not from an interval tick count. Race completion uses the original clocks.
 */
function LiveTimerText({
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
    const drawValue = (now: number) => {
      if (document.hidden) return
      const raw = Math.max(0, now - startAt)
      const ms = limitMs === undefined ? raw : Math.min(limitMs, raw)
      const value = formatTime(ms, precision)
      // Keep the React-owned text node: replacing textContent would break
      // React's next render and can leave a frozen time on screen.
      const textNode = textRef.current?.firstChild
      if (textNode && textNode.nodeValue !== value) textNode.nodeValue = value
      // A finished rival stays at its accurate limit without repainting.
      // The parent owns race completion. Once the exact limit is shown, this
      // individual text node can stop requesting further paints.
      if (limitMs !== undefined && raw >= limitMs) stopAndroidClock?.()
    }
    // A shared frame-synchronized Android clock follows the screen refresh,
    // rather than updating in visibly choppy 55 ms bursts. Actual race times
    // are still measured by the same independent monotonic time source.
    let stopAndroidClock: (() => void) | undefined
    if (isAndroidBrowser() && isCompactPerformanceViewport()) {
      stopAndroidClock = subscribeAndroidStopwatch(drawValue)
      return () => stopAndroidClock?.()
    }
    let frameId = 0
    let lastDraw = -Infinity
    const update = (timestamp: number) => {
      if (timestamp - lastDraw >= 45) {
        drawValue(performance.now())
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

// The Android stopwatch paints its own precise time. Ignore coarse parent
// race-tick props while it runs, preventing React from briefly writing an
// older value over the freshly painted display. A stop, restart, precision
// change, or new limit always renders normally.
export default memo(LiveTimerText, (previous, next) => {
  if (!isAndroidBrowser() || !isCompactPerformanceViewport()) return false
  return previous.running && next.running &&
    previous.startAt === next.startAt &&
    previous.precision === next.precision &&
    previous.limitMs === next.limitMs &&
    previous.className === next.className &&
    previous['aria-label'] === next['aria-label']
})
