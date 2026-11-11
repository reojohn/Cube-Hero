/**
 * A rotating phone or tablet may report a fine pointer inside a WebView.
 * Include the real viewport dimensions so low-cost live rendering activates
 * in landscape as well as portrait, without changing solve timing.
 */
export const MOBILE_PERFORMANCE_QUERY = [
  '(max-width: 740px)',
  '(orientation: landscape) and (max-height: 620px) and (max-width: 1180px)',
  '(pointer: coarse) and (max-width: 1180px)',
].join(', ')

export const DESKTOP_COMPETITION_TICK_MS = 30
export const MOBILE_COMPETITION_TICK_MS = 90
export const MOBILE_RACING_TICK_MS = 240
// Fewer full-page React renders on Android while the independent stopwatches
// and compositor-animated cube continue at their normal accuracy/speed.
export const ANDROID_RACING_TICK_MS = 360

export function isAndroidBrowser(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
}

export function isCompactPerformanceViewport(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(MOBILE_PERFORMANCE_QUERY).matches
}

/** Only UI redraws slow down. Stopwatch and rival finishing times still use performance.now(). */
export function competitionRenderIntervalMs(racing = false): number {
  // During racing, the visible stopwatch has its own lightweight display loop,
  // and the featured mobile cube has its own isolated playback. Parent React
  // updates are needed only for coarse status/finish changes.
  return isCompactPerformanceViewport()
    ? (racing ? (isAndroidBrowser() ? ANDROID_RACING_TICK_MS : MOBILE_RACING_TICK_MS) : MOBILE_COMPETITION_TICK_MS)
    : DESKTOP_COMPETITION_TICK_MS
}

/**
 * Android WebViews are most likely to jank when the *entire* AI/Ghost page
 * reconciles during every stopwatch tick. The visible clocks paint in their
 * own tiny component, so the full page only needs refreshing when an opponent
 * actually finishes. We schedule those boundary refreshes from the monotonic
 * clock (never by incrementing an interval counter).
 *
 * The visibility handler catches up instantly after Android suspends a WebView.
 */
export function shouldRenderAndroidOnFinishOnly(): boolean {
  return isAndroidBrowser() && isCompactPerformanceViewport()
}

export function scheduleOpponentFinishRefreshes(
  startedAt: number,
  finishTimesMs: readonly number[],
  refresh: () => void,
): () => void {
  let timer: number | undefined
  let disposed = false
  const schedule = () => {
    window.clearTimeout(timer)
    if (disposed || document.hidden) return
    const elapsed = Math.max(0, performance.now() - startedAt)
    let next = Infinity
    for (const finishTime of finishTimesMs) {
      if (finishTime > elapsed && finishTime < next) next = finishTime
    }
    if (!Number.isFinite(next)) return
    timer = window.setTimeout(() => {
      if (disposed) return
      refresh()
      schedule()
    }, Math.max(5, Math.ceil(next - elapsed) + 12))
  }
  const onVisibilityChange = () => {
    if (document.hidden) window.clearTimeout(timer)
    else {
      refresh()
      schedule()
    }
  }
  schedule()
  document.addEventListener('visibilitychange', onVisibilityChange)
  return () => {
    disposed = true
    window.clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
