/**
 * Preload one verified CFOP 3×3 scramble for AI Race, separately from Ghost Race.
 * All 1–10 AI opponents share this single solved state; the user-selected
 * Sub level and personality still generate independent turn timelines.
 *
 * The browser's worker verifies CFOP on completion; a persisted result is
 * independently verified again before it may be reused after a refresh.
 */
import { generateScramble } from './racing'
import { solveScramble } from './solver'
import { verifyCfopSolution } from './cfop'
import { createGhostPrefetch } from './ghostPrefetchCore'

const STORAGE_KEY='cube-hero-ai-prepared-next-v1'
const core=createGhostPrefetch(generateScramble,solveScramble)

try {
  const text=localStorage.getItem(STORAGE_KEY)
  if(text){
    const saved=JSON.parse(text) as {scramble?:unknown;solution?:unknown}
    if(typeof saved.scramble!=='string'||!saved.solution||typeof saved.solution!=='object')throw Error('Invalid cached AI race')
    core.seedNext(saved.scramble,verifyCfopSolution(saved.scramble,saved.solution as Parameters<typeof verifyCfopSolution>[1]))
  }
} catch {
  try{localStorage.removeItem(STORAGE_KEY)}catch{/* storage disabled */}
}

function forgetStoredNext(){
  try{localStorage.removeItem(STORAGE_KEY)}catch{/* storage disabled */}
}

export const aiPrefetch={
  prepare:core.prepare,
  /** Idempotent: repeated requests do not create more scrambles or solves. */
  prewarm(){
    core.prewarm()
    const scramble=core.peekNext()
    if(!scramble)return
    void core.prepare(scramble).then(solution=>{
      // Do not persist a scramble after the room has already consumed it.
      if(core.peekNext()!==scramble)return
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({scramble,solution}))}catch{/* optional browser cache */}
    }).catch(()=>{/* Fresh scramble will be prepared on demand. */})
  },
  /** Reading from a React initializer must not consume data under StrictMode. */
  peekNext:core.peekNext,
  claimInitial(scramble:string){
    if(core.peekNext()!==scramble)return
    core.takeNext()
    forgetStoredNext()
  },
  takeNext(){
    const scramble=core.takeNext()
    forgetStoredNext()
    return scramble
  },
}
