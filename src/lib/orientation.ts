/** Mobile-only display preference. Layout CSS follows the device's real dimensions. */
export type OrientationPreference = 'auto' | 'portrait' | 'landscape'
export type OrientationLockFeedback = 'auto' | 'locked' | 'manual'

export const orientationPreference = (value: unknown): OrientationPreference =>
  value === 'landscape' || value === 'portrait' ? value : 'auto'

/** Whether the current browser even offers the optional orientation lock API. */
export const canRequestOrientationLock = (): boolean =>
  typeof screen !== 'undefined' && typeof (screen.orientation as (ScreenOrientation & {lock?: unknown}) | undefined)?.lock === 'function'

/**
 * Orientation locking is allowed by some installed Android PWAs/fullscreen apps.
 * It is unavailable or restricted in ordinary browsers (notably iOS Safari).
 * Never enter fullscreen without user consent, and never resize/rotate the DOM.
 * Instead rely on the real orientation and responsive CSS if locking fails.
 * Call this directly from a user gesture where possible.
 */
export async function requestOrientationPreference(preference: OrientationPreference): Promise<OrientationLockFeedback> {
  if (typeof screen === 'undefined') return 'manual'
  const control = screen.orientation as (ScreenOrientation & {
    lock?: (value: 'portrait-primary' | 'landscape-primary') => Promise<void>
    unlock?: () => void
  }) | undefined
  if (preference === 'auto') {
    try { control?.unlock?.() } catch { /* restricted browser: still respect Auto layout */ }
    return 'auto'
  }
  if (typeof control?.lock !== 'function') return 'manual'
  try {
    await control.lock(preference === 'portrait' ? 'portrait-primary' : 'landscape-primary')
    return 'locked'
  } catch {
    return 'manual'
  }
}
