/**
 * The marketing homepage is at /. The existing Cube Hero arena is at /app.
 * Older shared /#/race links continue to open the arena, so bookmarks remain valid.
 */
const GAME_HASH_ROUTES = new Set(['home', 'race', 'room', 'results', 'practice', 'statistics', 'learn', 'journey', 'settings'])

export function isGameLocation(pathname: string, hash: string): boolean {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  if (normalizedPath === '/app') return true
  if (normalizedPath !== '/') return false
  const match = /^#\/([^/?#]+)/.exec(hash)
  return !!match && GAME_HASH_ROUTES.has(match[1])
}

export const GAME_START_URL = '/app#/home'
