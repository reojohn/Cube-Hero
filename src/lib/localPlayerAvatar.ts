/** A cropped player portrait lives only in this browser. No remote upload. */
export const PLAYER_AVATAR_STORAGE_KEY = 'cube-hero-local-player-avatar-v1'
export const PLAYER_AVATAR_PRESET_STORAGE_KEY = 'cube-hero-local-player-avatar-preset-v1'
export const PLAYER_AVATAR_PRESET_IDS = [
  'default', 'emerald-druid', 'violet-starcube', 'golden-sunkeeper',
  'cobalt-frost', 'crimson-rogue', 'neon-guardian', 'cosmic-dreamer',
  'amber-desert', 'silver-moonkeeper', 'moss-traveler',
] as const

export function isPlayerAvatarPresetId(value: unknown): value is (typeof PLAYER_AVATAR_PRESET_IDS)[number] {
  return typeof value === 'string' && PLAYER_AVATAR_PRESET_IDS.some(id => id === value)
}

/** The selected built-in style is stored as an ID, not as a large base64 image. */
export function loadPlayerAvatarPreset(): string | null {
  try {
    const value = window.localStorage.getItem(PLAYER_AVATAR_PRESET_STORAGE_KEY)
    return isPlayerAvatarPresetId(value) ? value : null
  } catch { return null }
}

export function persistPlayerAvatarPreset(id: string): boolean {
  if (!isPlayerAvatarPresetId(id)) return false
  try { window.localStorage.setItem(PLAYER_AVATAR_PRESET_STORAGE_KEY, id); return true }
  catch { return false }
}

export function removePlayerAvatarPreset(): boolean {
  try { window.localStorage.removeItem(PLAYER_AVATAR_PRESET_STORAGE_KEY); return true }
  catch { return false }
}

export const PLAYER_AVATAR_MAX_FILE_BYTES = 10 * 1024 * 1024
export const PLAYER_AVATAR_EXPORT_SIZE = 320
export const PLAYER_AVATAR_MAX_STORED_LENGTH = 800_000

/** Only allow raster data URLs; never inject arbitrary URLs or SVG into an img tag. */
export function isSavedPlayerAvatar(value: unknown): value is string {
  return typeof value === 'string' && value.length < PLAYER_AVATAR_MAX_STORED_LENGTH &&
    /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)
}

export function loadPlayerAvatar(): string | null {
  try {
    const value = window.localStorage.getItem(PLAYER_AVATAR_STORAGE_KEY)
    return isSavedPlayerAvatar(value) ? value : null
  } catch { return null }
}

export function persistPlayerAvatar(value: string): boolean {
  if (!isSavedPlayerAvatar(value)) return false
  try { window.localStorage.setItem(PLAYER_AVATAR_STORAGE_KEY, value); return true }
  catch { return false }
}

export function removePlayerAvatar(): boolean {
  try { window.localStorage.removeItem(PLAYER_AVATAR_STORAGE_KEY); return true }
  catch { return false }
}

/** Pure crop geometry shared by the preview and canvas export.
 * Offsets are in preview CSS pixels; cropRect is in original image pixels.
 */
export function playerAvatarCropGeometry(
  imageWidth: number, imageHeight: number, stageSize: number,
  zoom: number, offsetX: number, offsetY: number,
) {
  if (![imageWidth,imageHeight,stageSize,zoom].every(n => Number.isFinite(n) && n > 0)) {
    throw new RangeError('Invalid image dimensions')
  }
  const scale = Math.max(stageSize / imageWidth, stageSize / imageHeight) * zoom
  const displayWidth = imageWidth * scale
  const displayHeight = imageHeight * scale
  const maxX = Math.max(0, (displayWidth - stageSize) / 2)
  const maxY = Math.max(0, (displayHeight - stageSize) / 2)
  const x = Math.min(maxX, Math.max(-maxX, offsetX))
  const y = Math.min(maxY, Math.max(-maxY, offsetY))
  const sourceSize = stageSize / scale
  return {
    displayWidth, displayHeight, x, y, maxX, maxY,
    sourceX: imageWidth / 2 - x / scale - sourceSize / 2,
    sourceY: imageHeight / 2 - y / scale - sourceSize / 2,
    sourceSize,
  }
}
