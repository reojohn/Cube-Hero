/** Solo practice lives on-device and does not award Hero Journey XP. */
export const SOLO_TIMER_STORAGE_KEY = 'cube-hero-solo-timer-v1'
export const SOLO_SOLVE_LIMIT = 500
export type SoloPenalty = 'none' | 'plus2' | 'dnf'
export type SoloSolve = {
  id: string
  createdAt: number
  scramble: string
  rawMs: number
  penalty: SoloPenalty
}

export function parseSoloSolves(value: unknown): SoloSolve[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is SoloSolve =>
    !!item && typeof item === 'object' && typeof item.id === 'string' &&
    typeof item.createdAt === 'number' && Number.isFinite(item.createdAt) &&
    typeof item.scramble === 'string' && item.scramble.length < 500 &&
    typeof item.rawMs === 'number' && Number.isFinite(item.rawMs) &&
    item.rawMs >= 0 && item.rawMs < 86_400_000 &&
    ['none', 'plus2', 'dnf'].includes(item.penalty)
  ).slice(-SOLO_SOLVE_LIMIT)
}

/** WCA-style +2/DNF adjustment. DNF has no numeric value. */
export function officialSoloMs(solve: SoloSolve): number | null {
  return solve.penalty === 'dnf' ? null : Math.round(solve.rawMs) + (solve.penalty === 'plus2' ? 2000 : 0)
}

/** Trim one best and one worst result for Ao5/Ao12, counting DNFs as worst. */
export function soloAverageOf(solves: readonly SoloSolve[], count: 5 | 12): number | null | undefined {
  if (solves.length < count) return undefined
  const latest = solves.slice(-count).map(officialSoloMs)
  if (latest.filter(value => value === null).length >= 2) return null
  const sorted = latest.map(value => value === null ? Infinity : value).sort((a,b) => a-b)
  const middle = sorted.slice(1, -1)
  if (middle.some(value => !Number.isFinite(value))) return null
  return Math.round(middle.reduce((sum, value) => sum + value, 0) / middle.length)
}

export function soloBest(solves: readonly SoloSolve[]): number | null {
  const times = solves.map(officialSoloMs).filter((v): v is number => v !== null)
  return times.length ? Math.min(...times) : null
}

export function soloMean(solves: readonly SoloSolve[]): number | null {
  const times = solves.map(officialSoloMs).filter((v): v is number => v !== null)
  return times.length ? Math.round(times.reduce((a,b) => a+b,0)/times.length) : null
}
