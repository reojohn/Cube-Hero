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
