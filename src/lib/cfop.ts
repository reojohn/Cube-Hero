import { cubeFacesAt, isVisuallySolved } from './cubeState'
import { tokenizeCubeMoves } from './cubeMoves'
import type { CubeFaces, Face } from './cubeState'

/** The only permitted solution method for newly recorded Cube Hero races. */
export const CFOP_IDS = ['cross', 'f2l1', 'f2l2', 'f2l3', 'f2l4', 'oll', 'pll'] as const
export type CfopStageId = typeof CFOP_IDS[number]
export const CFOP_LABELS: Record<CfopStageId, string> = {
  cross: 'Cross', f2l1: 'F2L · Pair 1', f2l2: 'F2L · Pair 2',
  f2l3: 'F2L · Pair 3', f2l4: 'F2L · Pair 4', oll: 'OLL', pll: 'PLL',
}
export interface CfopStage { id: CfopStageId; moves: string }
export interface CfopSolution { method: 'cfop'; solution: string; stages: CfopStage[] }
export interface CfopMarker { id: CfopStageId; startMove: number; endMove: number; moves: string }

function center(faces: CubeFaces, face: Face): Face { return faces[face][4] }
function facelet(faces: CubeFaces, face: Face, i: number): boolean {
  return faces[face][i] === center(faces, face)
}
/** Bottom cross = D edges + adjacent bottom-side edges match their face centers. */
export function crossSolved(faces: CubeFaces): boolean {
  return [1, 3, 5, 7].every(i => facelet(faces, 'D', i)) &&
    (['F', 'R', 'B', 'L'] as Face[]).every(f => facelet(faces, f, 7))
}
/** Count correctly paired AND inserted F2L corner-edge slots (FR, FL, BR, BL). */
export function solvedF2LSlots(faces: CubeFaces): number {
  const slots: [Face, number, number, Face, number, number, number][] = [
    ['F', 5, 8, 'R', 3, 6, 2],
    ['F', 3, 6, 'L', 5, 8, 0],
    ['B', 3, 6, 'R', 5, 8, 8],
    ['B', 5, 8, 'L', 3, 6, 6],
  ]
  return slots.filter(([a, edgeA, cornerA, b, edgeB, cornerB, downCorner]) =>
    facelet(faces, a, edgeA) && facelet(faces, a, cornerA) &&
    facelet(faces, b, edgeB) && facelet(faces, b, cornerB) &&
    facelet(faces, 'D', downCorner),
  ).length
}
export function ollSolved(faces: CubeFaces): boolean {
  return faces.U.every(sticker => sticker === faces.U[4])
}

export function cfopMarkers(solution: CfopSolution): CfopMarker[] {
  if (solution.method !== 'cfop' || solution.stages.length !== 7) throw new Error('CFOP requires seven verified stages.')
  let count = 0
  return solution.stages.map((stage, index) => {
    if (stage.id !== CFOP_IDS[index]) throw new Error('The CFOP stages are not in Cross/F2L/OLL/PLL order.')
    const startMove = count
    count += tokenizeCubeMoves(stage.moves).length
    return { id: stage.id, startMove, endMove: count, moves: stage.moves }
  })
}

/** 24 legal whole-cube orientations, used to evaluate CFOP stages in one
 * canonical frame even when the human-style solution regrips or rotates. */
function rotationOptions(): string[][] {
  const queue: string[][] = [[]]
  const visited = new Set<string>()
  const result: string[][] = []
  for (let i=0; i<queue.length && result.length<24; i++) {
    const path = queue[i]
    const faces = cubeFacesAt('', path, path.length)
    const signature = (['U','R','F','D','L','B'] as Face[]).map(f=>faces[f][4]).join('')
    if (visited.has(signature)) continue
    visited.add(signature)
    result.push(path)
    for (const rotation of ['x','y','z']) queue.push([...path,rotation])
  }
  if (result.length!==24) throw new Error('Could not establish 24 cube orientations.')
  return result
}
const ALL_ORIENTATIONS = rotationOptions()
function normalizedStageFaces(scramble: string, moves: readonly string[]): CubeFaces {
  const all = [...moves]
  for (const rotation of ALL_ORIENTATIONS) {
    const sequence = [...all, ...rotation]
    const faces = cubeFacesAt(scramble, sequence, sequence.length)
    if ((['U','R','F','D','L','B'] as Face[]).every(f=>faces[f][4]===f)) return faces
  }
  throw new Error('CFOP returned an invalid cube center orientation.')
}

/** Turn an engine result with either four individual F2L steps or one
 * ordered-F2L unit into the seven presentation stages. In the latter case,
 * pair boundaries are derived from actual solved slot states, never guessed. */
export function assembleCfopStages(scramble: string, units: readonly {unitId:string;moves:string}[]): CfopSolution {
  const lookup = new Map(units.map(unit => [unit.unitId,unit.moves]))
  const acceptable = new Set<string>([...CFOP_IDS,'f2l'])
  if (units.some(unit => !acceptable.has(unit.unitId))) throw new Error('Unsupported CFOP stage layout.')
  const sections: CfopStage[] = []
  sections.push({id:'cross',moves:lookup.get('cross')||''})
  if (lookup.has('f2l')) {
    const crossMoves = tokenizeCubeMoves(lookup.get('cross')||'')
    const sequence = tokenizeCubeMoves(lookup.get('f2l')||'')
    let previous = 0
    for (let count = 1; count<=4; count++) {
      let end = previous
      if (count === 4) end = sequence.length
      else while (end < sequence.length) {
        const frame = normalizedStageFaces(scramble,[...crossMoves,...sequence.slice(0,end)])
        if (crossSolved(frame) && solvedF2LSlots(frame)>=count) break
        end++
      }
      sections.push({id:`f2l${count}` as CfopStageId,moves:sequence.slice(previous,end).join(' ')})
      previous=end
    }
  } else {
    for (let i=1;i<=4;i++) sections.push({id:`f2l${i}` as CfopStageId,moves:lookup.get(`f2l${i}`)||''})
  }
  sections.push({id:'oll',moves:lookup.get('oll')||''})
  sections.push({id:'pll',moves:lookup.get('pll')||''})
  return verifyCfopSolution(scramble,{
    method:'cfop',stages:sections,
    solution:sections.map(section=>section.moves).filter(Boolean).join(' '),
  })
}

/**
 * Verify the actual 3x3 after EVERY stage; a generic solver cannot qualify by
 * merely attaching CFOP names. On any failure the race stays blocked and displays
 * the error. No automatic two-phase fallback is allowed.
 */
export function verifyCfopSolution(scramble: string, candidate: CfopSolution): CfopSolution {
  const markers = cfopMarkers(candidate)
  const moves = markers.flatMap(segment => tokenizeCubeMoves(segment.moves))
  const declared = tokenizeCubeMoves(candidate.solution)
  if (!moves.length || moves.join(' ') !== declared.join(' ')) {
    throw new Error('CFOP stage moves do not match the reported solution.')
  }
  const all: string[] = []
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]
    all.push(...tokenizeCubeMoves(marker.moves))
    const state = normalizedStageFaces(scramble, all)
    if (!crossSolved(state)) throw new Error(`${CFOP_LABELS[marker.id]} did not preserve the solved cross.`)
    if (i >= 1 && i <= 4 && solvedF2LSlots(state) < i) {
      throw new Error(`${CFOP_LABELS[marker.id]} did not solve the required F2L pairs.`)
    }
    if (i >= 4 && solvedF2LSlots(state) !== 4) {
      throw new Error(`${CFOP_LABELS[marker.id]} did not preserve all four F2L pairs.`)
    }
    if (i >= 5 && !ollSolved(state)) throw new Error(`${CFOP_LABELS[marker.id]} did not orient the last layer.`)
    if (i === 6 && !isVisuallySolved(state)) throw new Error('PLL did not produce a solved cube.')
  }
  return { method: 'cfop', solution: moves.join(' '), stages: markers.map(({id,moves})=>({id,moves})) }
}

export function currentCfopStage(markers: readonly CfopMarker[], completedMoves: number): CfopStageId {
  const active = markers.find(stage => completedMoves < stage.endMove)
  return active?.id ?? 'pll'
}
