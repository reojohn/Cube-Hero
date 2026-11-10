import { generateScramble } from './racing'
import { solveScramble } from './solver'
import { verifyCfopSolution } from './cfop'
import { createGhostPrefetch } from './ghostPrefetchCore'

/** A single ahead-of-time verified challenge, even after a browser refresh. */
const STORAGE_KEY='cube-hero-ghost-prepared-next-v1'
const core=createGhostPrefetch(generateScramble,solveScramble)

try {
  const text=localStorage.getItem(STORAGE_KEY)
  if(text){
    const saved=JSON.parse(text) as {scramble?:unknown;solution?:unknown}
    if(typeof saved.scramble!=='string'||!saved.solution||typeof saved.solution!=='object')throw Error('Invalid cached ghost')
    // Validate persisted data before treating it as a prepared CFOP solve.
    core.seedNext(saved.scramble,verifyCfopSolution(saved.scramble,saved.solution as Parameters<typeof verifyCfopSolution>[1]))
  }
} catch {
  try{localStorage.removeItem(STORAGE_KEY)}catch{/* storage disabled */}
}

export const ghostPrefetch = {
  prepare:core.prepare,
  prewarm(){
    core.prewarm()
    const scramble=core.peekNext()
    if(!scramble)return
    void core.prepare(scramble).then(solution=>{
      if(core.peekNext()!==scramble)return
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({scramble,solution}))}catch{/* optional cache */}
    }).catch(()=>{/* a future challenge will be generated on demand */})
  },
  // Reading the initial prepared scramble must have no side effects because
  // React StrictMode can evaluate useState initializers twice.
  peekNext:core.peekNext,
  claimInitial(scramble:string){
    if(core.peekNext()!==scramble)return
    core.takeNext()
    try{localStorage.removeItem(STORAGE_KEY)}catch{/* optional cache */}
  },
  takeNext(){
    const scramble=core.takeNext()
    try{localStorage.removeItem(STORAGE_KEY)}catch{/* optional cache */}
    return scramble
  },
}
