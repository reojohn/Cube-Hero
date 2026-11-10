import { createAiPlan } from './aiPlan'
import type { AiPlan } from './aiPlan'
import type { CfopSolution } from './cfop'
import type { InspectionPenalty } from './racing'

/** Solo records are deliberately separate from AI race statistics. */
export type GhostMode = 'qualifying' | 'ghost'
export interface GhostAttempt {
  id: string
  scramble: string
  date: string
  mode: GhostMode
  rawMs: number
  penalty: InspectionPenalty
  officialMs: number | null
  /** Personal-best target at the moment the duel started. */
  opponentMs: number | null
}
export interface GhostData {
  qualifications: GhostAttempt[]
  duels: GhostAttempt[]
}
export const GHOST_STORAGE_KEY = 'cube-hero-ghost-races-v1'
export const GHOST_QUALIFYING_SOLVES = 3
export const emptyGhostData = (): GhostData => ({ qualifications: [], duels: [] })

function validAttempt(raw: unknown): raw is GhostAttempt {
  if (!raw || typeof raw !== 'object') return false
  const a = raw as Partial<GhostAttempt>
  return typeof a.id === 'string' && typeof a.scramble === 'string' && typeof a.date === 'string' &&
    (a.mode === 'qualifying' || a.mode === 'ghost') && typeof a.rawMs === 'number' &&
    Number.isFinite(a.rawMs) && a.rawMs >= 0 &&
    (a.penalty === 'none' || a.penalty === 'plus2' || a.penalty === 'dnf') &&
    (a.officialMs === null || (typeof a.officialMs === 'number' && Number.isFinite(a.officialMs) && a.officialMs >= 0)) &&
    (a.opponentMs === null || (typeof a.opponentMs === 'number' && Number.isFinite(a.opponentMs) && a.opponentMs > 0))
}
export function parseGhostData(raw: unknown): GhostData {
  if (!raw || typeof raw !== 'object') return emptyGhostData()
  const value = raw as Partial<GhostData>
  return {
    qualifications: Array.isArray(value.qualifications) ? value.qualifications.filter(validAttempt).filter(a=>a.mode === 'qualifying' && a.officialMs !== null).slice(0, GHOST_QUALIFYING_SOLVES) : [],
    duels: Array.isArray(value.duels) ? value.duels.filter(validAttempt).filter(a=>a.mode === 'ghost').slice(-300) : [],
  }
}
export function bestGhostTime(data: GhostData): number | null {
  if (data.qualifications.length < GHOST_QUALIFYING_SOLVES) return null
  const times = [...data.qualifications, ...data.duels].map(x=>x.officialMs).filter((x): x is number=> x !== null && x > 0)
  return times.length ? Math.min(...times) : null
}
export function officialGhostTime(rawMs: number, penalty: InspectionPenalty): number | null {
  if (penalty === 'dnf' || !Number.isFinite(rawMs) || rawMs < 0) return null
  return rawMs + (penalty === 'plus2' ? 2000 : 0)
}
/** A verified CFOP sequence on today's scramble, with each turn paced to the
 * player's saved best. This is a synthetic ghost animation, not recorded moves.
 */
export function makeGhostPlan(scramble: string, solution: CfopSolution, targetMs: number): AiPlan {
  if (!Number.isFinite(targetMs) || targetMs <= 0) throw new Error('Missing a valid personal best.')
  const generated = createAiPlan(scramble, solution, '15', 'balanced', 'personal-ghost')
  const ratio = targetMs / generated.totalMs
  const segmentTimes = generated.segmentsMs.map(t=> Math.round(t*ratio))
  segmentTimes[segmentTimes.length - 1] = targetMs - segmentTimes.slice(0,-1).reduce((a,b)=>a+b,0)
  return { ...generated, totalMs: targetMs, moveEndsMs: generated.moveEndsMs.map((ms,i)=> i===generated.moveEndsMs.length-1 ? targetMs : ms * ratio), segmentsMs:segmentTimes }
}
