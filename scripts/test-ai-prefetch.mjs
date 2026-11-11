/** AI Race preparation regression tests: dedup, ahead-of-time use, cache restore. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cubehero-ai-preload-'))
const compile=(source,dest)=>{
  const result=ts.transpileModule(fs.readFileSync(source,'utf8'),{
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},
  }).outputText
  fs.writeFileSync(path.join(dir,dest),result)
}
try {
  compile('src/lib/ghostPrefetchCore.ts','ghostPrefetchCore.mjs')
  const {createGhostPrefetch}=await import(pathToFileURL(path.join(dir,'ghostPrefetchCore.mjs')).href)
  let generation=0,solverCalls=0
  const pending=new Map()
  const core=createGhostPrefetch(()=>`SCRAMBLE_${++generation}`,(scramble)=>{
    solverCalls++
    return new Promise((resolve,reject)=>pending.set(scramble,{resolve,reject}))
  })
  core.prewarm();core.prewarm()
  assert.equal(generation,1,'repeated prewarm must be idempotent')
  const current=core.peekNext()
  assert.equal(current,'SCRAMBLE_1')
  assert.equal(core.takeNext(),current)
  const first=core.prepare(current)
  const second=core.prepare(current)
  assert.strictEqual(first,second,'current round must reuse the same in-flight verified solve')
  await Promise.resolve()
  assert.equal(solverCalls,1,'do not compute the same scramble twice')
  pending.get(current).resolve({method:'cfop',solution:'verified-1'})
  assert.deepEqual(await first,await second)
  core.prewarm()
  assert.equal(generation,2,'a new upcoming scramble is prewarmed after the current one')
  const future=core.peekNext()
  const futurePromise=core.prepare(future)
  await Promise.resolve()
  pending.get(future).resolve({method:'cfop',solution:'verified-2'})
  await futurePromise
  assert.equal(core.takeNext(),future)
  assert.equal((await core.prepare(future)).solution,'verified-2')
  assert.equal(solverCalls,2,'verified future solution should be reused without another solve')

  // Exercise the real AI Race wrapper with a synthetic storage + verification
  // boundary, so loading from disk can NEVER bypass verification.
  const store=new Map()
  globalThis.localStorage={
    getItem:k=>store.get(k)??null,
    setItem:(k,v)=>{store.set(k,v)},
    removeItem:k=>{store.delete(k)},
  }
  const STORAGE_KEY='cube-hero-ai-prepared-next-v1'
  let wrapperSolverCalls=0,wrapperGeneration=0
  globalThis.__aiTest={
    generate:()=>`PREPARED_${++wrapperGeneration}`,
    solve:async scramble=>{wrapperSolverCalls++;return{method:'cfop',verifiedFor:scramble}},
    verify:(scramble,solution)=>{
      if(solution?.method!=='cfop'||solution?.verifiedFor!==scramble)throw Error('unverified CFOP solution')
      return solution
    },
  }
  fs.writeFileSync(path.join(dir,'racing.mjs'),`export const generateScramble=()=>globalThis.__aiTest.generate()`)
  fs.writeFileSync(path.join(dir,'solver.mjs'),`export const solveScramble=(s)=>globalThis.__aiTest.solve(s)`)
  fs.writeFileSync(path.join(dir,'cfop.mjs'),`export const verifyCfopSolution=(s,v)=>globalThis.__aiTest.verify(s,v)`)
  const aiSource=fs.readFileSync('src/lib/aiPrefetch.ts','utf8')
  let aiCode=ts.transpileModule(aiSource,{
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},
  }).outputText
  for(const name of ['racing','solver','cfop','ghostPrefetchCore'])aiCode=aiCode.replace(`from './${name}'`,`from './${name}.mjs'`)
  fs.writeFileSync(path.join(dir,'aiPrefetch.mjs'),aiCode)
  store.set(STORAGE_KEY,JSON.stringify({scramble:'SAVED',solution:{method:'cfop',verifiedFor:'SAVED'}}))
  const {aiPrefetch}=await import(pathToFileURL(path.join(dir,'aiPrefetch.mjs')).href)
  assert.equal(aiPrefetch.peekNext(),'SAVED')
  assert.equal((await aiPrefetch.prepare('SAVED')).verifiedFor,'SAVED')
  assert.equal(wrapperSolverCalls,0,'verified persisted solution should require no worker solve')
  aiPrefetch.claimInitial('SAVED')
  assert.equal(aiPrefetch.peekNext(),null)
  assert.equal(store.has(STORAGE_KEY),false,'claim must clear consumed future cache')
  aiPrefetch.prewarm()
  aiPrefetch.prewarm()
  const next=aiPrefetch.peekNext()
  assert.equal(next,'PREPARED_1')
  await aiPrefetch.prepare(next)
  await new Promise(resolve=>setImmediate(resolve))
  assert.equal(wrapperSolverCalls,1,'prewarm should solve one future scramble')
  assert.ok(store.has(STORAGE_KEY),'verified future solution is saved for refresh')
  assert.equal(aiPrefetch.takeNext(),next)
  assert.equal(store.has(STORAGE_KEY),false,'taking the next round removes stale disk cache')

  store.set(STORAGE_KEY,JSON.stringify({scramble:'SAVED',solution:{method:'cfop',verifiedFor:'WRONG'}}))
  fs.writeFileSync(path.join(dir,'aiPrefetchInvalid.mjs'),aiCode)
  const invalid=await import(pathToFileURL(path.join(dir,'aiPrefetchInvalid.mjs')).href)
  assert.equal(invalid.aiPrefetch.peekNext(),null,'invalid persisted solution must be rejected')
  assert.equal(store.has(STORAGE_KEY),false,'invalid cache must be deleted')
  const room=fs.readFileSync('src/components/RaceRoom.tsx','utf8')
  const setup=fs.readFileSync('src/App.tsx','utf8')
  assert.ok(room.includes('aiPrefetch.peekNext()'),'initial render should peek without consuming the prepared scramble under StrictMode')
  assert.ok(room.includes('aiPrefetch.claimInitial(scramble)'),'claim the prepared scramble only after React commits')
  assert.ok(room.includes('aiPrefetch.prepare(scramble)'),'race room must reuse verified cached solution')
  assert.ok(!room.includes('solveScramble(scramble)'),'live room must not launch a duplicate CFOP solve')
  assert.ok(room.includes('aiPrefetch.takeNext()'),'new scramble must consume prewarmed choice')
  assert.ok(room.includes('createAiPlan(scramble,solution'),'all AI rivals must derive from one verified CFOP solution')
  assert.ok(setup.includes('aiPrefetch.prewarm()'),'race setup must start speculative preparation')
  console.log('PASS: AI verified CFOP preload; single in-flight solve; ready next round; persisted verification; rejection; shared multi-AI plans.')
} finally {
  delete globalThis.__aiTest
  fs.rmSync(dir,{recursive:true,force:true})
}
