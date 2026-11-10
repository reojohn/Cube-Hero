import { generateAiTimeMs, getAiPersonality } from './racing'
import type { AiPersonality, Difficulty } from './racing'
import { cfopMarkers } from './cfop'
import type { CfopMarker, CfopSolution, CfopStage } from './cfop'
import { tokenizeCubeMoves } from './cubeMoves'

/** Playback schedule for a verified solution: real CFOP stages for new races. */
export interface AiPlan {
  method: 'cfop' | 'two-phase'
  solution: string
  cfopMarkers?: CfopMarker[]
  moves: string[]
  totalMs: number
  /** Ending real-world timestamp (ms) after each move. */
  moveEndsMs: number[]
  /** Matching timeline end timestamps for cubing.js's default 1000/1500ms turn durations. */
  animationEndsMs: number[]
  /** Four timings: actual Cross/F2L/OLL/PLL for CFOP, approximate intervals for legacy races. */
  segmentsMs: number[]
  qtm: number
}

const limits = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
function hashSeed(source: string): number {
  let hash = 2166136261
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619)
  return hash >>> 0
}
function prng(seed: number): () => number {
  let state = seed >>> 0
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 }
}
export function createAiPlan(
  scramble: string, input: string | CfopSolution, difficulty: Difficulty, personality: AiPersonality, variantKey = '',
): AiPlan {
  const method = typeof input === 'string' ? 'two-phase' : 'cfop'
  const solution = typeof input === 'string' ? input : input.solution
  const moves = tokenizeCubeMoves(solution)
  if (!moves.length) throw new Error('A solve cannot contain zero moves.')
  const markers = typeof input === 'string' ? undefined : cfopMarkers(input)
  const qtm = moves.reduce((sum, move) => sum + (move.includes('2') ? 2 : 1), 0)
  // CFOP solutions naturally use more moves than two-phase ones. Different
  // baselines keep the target Sub-level speed meaningful for both histories.
  const complexity = method === 'cfop'
    ? limits(1 + (qtm - 68) * .002 + (moves.length - 53) * .0018, .93, 1.07)
    : limits(1 + (qtm - 28) * .007 + (moves.length - 20) * .005, .90, 1.10)
  const totalMs = Math.max(1000, Math.round(generateAiTimeMs(difficulty, getAiPersonality(personality)) * complexity))
  const random = prng(hashSeed(variantKey ? `${scramble}|${solution}|${personality}|${variantKey}` : `${scramble}|${solution}|${personality}`))
  const hesitation = personality === 'casual' ? .95 : personality === 'competitive' ? .23 : .54
  const stageOfMove = (index: number) => markers?.find(m => index < m.endMove)?.id ?? 'cross'
  const weights = moves.map((move, index) => {
    const stage = stageOfMove(index)
    // Speedcubers tend to turn Cross/PLL more fluidly; F2L is recognition-heavy.
    const stageWeight = stage.startsWith('f2l') ? 1.21 : stage === 'cross' ? .89 : stage === 'oll' ? 1.08 : .98
    const turn = move.includes('2') ? 1.53 : 1
    const cadence = .83 + random() * .34
    const stageStart = Boolean(markers?.some(m => m.startMove === index && m.startMove > 0))
    const naturalPause = stageStart ? hesitation * (1.0 + random() * .45) : 0
    const chance = personality === 'casual' ? .23 : personality === 'balanced' ? .14 : .055
    const lookahead = index > 0 && index < moves.length - 1 && random() < chance
      ? hesitation * (.4 + random()) : 0
    return turn * cadence * (method === 'cfop' ? stageWeight : 1) + naturalPause + lookahead
  })
  const weightSum = weights.reduce((a,b)=>a+b,0)
  const moveEndsMs: number[] = []
  const animationEndsMs: number[] = []
  let elapsed=0, animation=0
  weights.forEach((weight, index) => {
    elapsed += totalMs * weight / weightSum
    animation += moves[index].includes('2') ? 1500 : 1000
    moveEndsMs.push(index === weights.length - 1 ? totalMs : elapsed)
    animationEndsMs.push(animation)
  })
  const markersAt = markers
    ? [markers[0].endMove, markers[4].endMove, markers[5].endMove, markers[6].endMove]
    : [Math.max(1,Math.round(moves.length*.24)),Math.max(2,Math.round(moves.length*.53)),Math.max(3,Math.round(moves.length*.78)),moves.length]
  const cuts = markersAt.map(index => index ? moveEndsMs[index-1] : 0)
  const segmentsMs = cuts.map((value,i) => Math.round(value-(i?cuts[i-1]:0)))
  segmentsMs[3] = totalMs - segmentsMs[0] - segmentsMs[1] - segmentsMs[2]
  return { method, solution, moves, cfopMarkers: markers, totalMs, moveEndsMs, animationEndsMs, segmentsMs, qtm }
}

/** Maps human-style motion cadence onto the 3D turn animation timeline. */
export function animationTimestamp(plan: AiPlan, raceElapsedMs: number): number | 'start' | 'end' {
  if (raceElapsedMs <= 0) return 'start'
  if (raceElapsedMs >= plan.totalMs) return 'end'
  let lo = 0
  let hi = plan.moveEndsMs.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (raceElapsedMs < plan.moveEndsMs[mid]) hi = mid
    else lo = mid + 1
  }
  const priorTime = lo ? plan.moveEndsMs[lo - 1] : 0
  const priorAnimation = lo ? plan.animationEndsMs[lo - 1] : 0
  return priorAnimation + ((raceElapsedMs - priorTime) / (plan.moveEndsMs[lo] - priorTime)) * (plan.animationEndsMs[lo] - priorAnimation)
}

export function moveIndexAt(plan: AiPlan, raceElapsedMs: number): number {
  return plan.moveEndsMs.filter(end => raceElapsedMs >= end).length
}

/** Reconstructs the exact deterministic turn cadence for a saved Phase 3 record.
 * AI time is restored from the record, NOT resampled for replay.
 */
export function replayAiPlan(record: {
  scramble: string; aiSolution: string; aiMs: number;
  difficulty: Difficulty; personality?: AiPersonality;
  aiMethod?: 'cfop' | 'two-phase'; aiCfopStages?: CfopStage[]; aiVariantKey?: string;
}): AiPlan {
  const input: CfopSolution | string = record.aiMethod === 'cfop' && record.aiCfopStages?.length === 7
    ? { method: 'cfop', solution: record.aiSolution, stages: record.aiCfopStages }
    : record.aiSolution
  const generated = createAiPlan(record.scramble,input,record.difficulty,getAiPersonality(record.personality),record.aiVariantKey??'')
  const ratio = record.aiMs / generated.totalMs
  const segmentsMs = generated.segmentsMs.map(t=>Math.round(t*ratio))
  segmentsMs[3] = record.aiMs - segmentsMs[0] - segmentsMs[1] - segmentsMs[2]
  return {...generated,totalMs:record.aiMs,moveEndsMs:generated.moveEndsMs.map(t=>t*ratio),segmentsMs}
}
