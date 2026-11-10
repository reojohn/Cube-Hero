/** Each mechanics guide is introduced once per browser, independently by mode. */
export type MechanicsMode = 'ai' | 'ghost'

export const MECHANICS_SEEN_KEYS: Record<MechanicsMode, string> = {
  ai: 'cube-hero-mechanics-ai-seen-v1',
  ghost: 'cube-hero-mechanics-ghost-seen-v1',
}

export function hasSeenMechanics(mode: MechanicsMode): boolean {
  try {
    return window.localStorage.getItem(MECHANICS_SEEN_KEYS[mode]) === '1'
  } catch {
    // A private or blocked-storage browser can still use the guide manually.
    return false
  }
}

/** A guide counts as introduced after the user dismisses it, by any close action. */
export function markMechanicsSeen(mode: MechanicsMode): void {
  try {
    window.localStorage.setItem(MECHANICS_SEEN_KEYS[mode], '1')
  } catch {
    // Do not interrupt races when browser storage is disabled.
  }
}
