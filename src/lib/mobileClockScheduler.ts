/**
 * Android stopwatch-only display scheduler.
 *
 * Repaint on animation frames so two visible clocks feel as fluid as the
 * compositor-animated cube. All clocks share ONE rAF and one monotonic time
 * sample per frame; solving/race completion still owns the authoritative times.
 * With many rivals, cap the text work near 30 fps to leave time for the cube.
 */
type ClockDraw = (now: number) => void

const activeClocks = new Map<ClockDraw, number>()
let frameId: number | null = null
let previousPaint = -Infinity

function paintClocks(now: number): void {
  for (const draw of activeClocks.keys()) draw(now)
}

function queueFrame(): void {
  if (frameId !== null || !activeClocks.size || document.hidden) return
  frameId = window.requestAnimationFrame(onFrame)
}

function cancelFrame(): void {
  if (frameId !== null) window.cancelAnimationFrame(frameId)
  frameId = null
}

function onFrame(): void {
  frameId = null
  if (!activeClocks.size || document.hidden) return
  // Draw every animation frame for 1-4 clocks. In a 5-10 AI race, batch all
  // clocks into one paint approximately every 33 ms instead of overwhelming
  // Android's main thread with hundreds of text/layout updates per second.
  const now = performance.now()
  // Low remains full-refresh for users whose phones can already display it
  // smoothly. Medium/High use a 30 Hz *display* budget to leave CPU/GPU time
  // for physical slice motion. Timekeeping and official finish times never
  // depend on this optional paint interval.
  const minInterval = Math.max(activeClocks.size > 4 ? 32 : 0, ...activeClocks.values())
  if (now - previousPaint >= minInterval) {
    previousPaint = now
    paintClocks(now)
  }
  queueFrame()
}

function syncVisibility(): void {
  if (document.hidden) {
    cancelFrame()
    return
  }
  // An Android WebView may suspend rAF while backgrounded. On resume, jump
  // straight to the real elapsed time instead of replaying missed ticks.
  previousPaint = -Infinity
  if (activeClocks.size) paintClocks(performance.now())
  queueFrame()
}

export function subscribeAndroidStopwatch(draw: ClockDraw, minPaintIntervalMs = 0): () => void {
  const firstClock = activeClocks.size === 0
  activeClocks.set(draw, Math.max(0, minPaintIntervalMs))
  if (firstClock) {
    document.addEventListener('visibilitychange', syncVisibility)
    window.addEventListener('pageshow', syncVisibility)
    previousPaint = -Infinity
  }
  // Draw immediately when a racer starts, without waiting for the first frame.
  if (!document.hidden) draw(performance.now())
  queueFrame()
  return () => {
    activeClocks.delete(draw)
    if (activeClocks.size) return
    cancelFrame()
    document.removeEventListener('visibilitychange', syncVisibility)
    window.removeEventListener('pageshow', syncVisibility)
    previousPaint = -Infinity
  }
}
