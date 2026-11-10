/** Offline-first browser profile; no login, remote API, or database. */
export const PLAYER_NAME_STORAGE_KEY = 'cube-hero-local-player-name-v1'
export const PLAYER_NAME_MAX_LENGTH = 24

/** Normalize display names once, independent of the race/XP data model. */
export function normalizePlayerName(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').replace(/\s+/g, ' ').trim().slice(0, PLAYER_NAME_MAX_LENGTH).trim()
}

export function isValidPlayerName(value: unknown): boolean {
  const name = normalizePlayerName(value)
  return name.length >= 2 && name.length <= PLAYER_NAME_MAX_LENGTH
}

export function loadPlayerName(): string {
  try {
    const name = normalizePlayerName(window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY))
    return isValidPlayerName(name) ? name : ''
  } catch { return '' }
}

/** Returns false when storage is unavailable, but allows this browser session to continue. */
export function persistPlayerName(value: string): boolean {
  try { window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, normalizePlayerName(value)); return true }
  catch { return false }
}
