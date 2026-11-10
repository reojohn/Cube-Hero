import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ghost-prefetch-test-'))
try {
  const code=ts.transpileModule(fs.readFileSync('src/lib/ghostPrefetchCore.ts','utf8'),{
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},
  }).outputText
  const file=path.join(dir,'ghostPrefetchCore.mjs')
  fs.writeFileSync(file,code)
  const {createGhostPrefetch}=await import(pathToFileURL(file).href)
  let counter=0, solveCalls=0
  const pending=new Map()
  const solve=s=>{ solveCalls++; return new Promise((resolve,reject)=>pending.set(s,{resolve,reject})) }
  const engine=createGhostPrefetch(()=>`SCRAMBLE_${++counter}`,solve,2)

  engine.prewarm()
  engine.prewarm()
  assert.equal(counter,1,'repeated prewarm must not create another scramble')
  const selected=engine.takeNext()
  assert.equal(selected,'SCRAMBLE_1')
  const a=engine.prepare(selected),b=engine.prepare(selected)
  assert.strictEqual(a,b,'race must share in-flight verified work')
  await Promise.resolve()
  assert.equal(solveCalls,1,'prewarming and racing must only solve once')
  pending.get(selected).resolve({kind:'verified',id:1})
  assert.deepEqual(await a,{kind:'verified',id:1})
  assert.deepEqual(await engine.prepare(selected),{kind:'verified',id:1})
  assert.equal(solveCalls,1,'verified cache must avoid recomputation')

  engine.prewarm()
  assert.equal(engine.takeNext(),'SCRAMBLE_2')
  const c=engine.prepare('SCRAMBLE_2');await Promise.resolve()
  pending.get('SCRAMBLE_2').resolve({kind:'verified',id:2})
  assert.equal((await c).id,2)

  engine.prewarm()
  const d=engine.prepare('SCRAMBLE_3');await Promise.resolve()
  pending.get('SCRAMBLE_3').resolve({kind:'verified',id:3})
  assert.equal((await d).id,3)
  // Core cache retains at most 2 results; the oldest must be solved again.
  const old=engine.prepare('SCRAMBLE_1');await Promise.resolve()
  assert.equal(solveCalls,4,'old cache entry should be evicted')
  pending.get('SCRAMBLE_1').resolve({kind:'verified',id:4})
  assert.equal((await old).id,4)

  const seeded=createGhostPrefetch(()=>{throw Error('should not generate')},async()=>{throw Error('should not solve')})
  seeded.seedNext('CACHED', {kind:'verified'})
  assert.equal(seeded.peekNext(),'CACHED')
  assert.equal(seeded.takeNext(),'CACHED')
  assert.deepEqual(await seeded.prepare('CACHED'),{kind:'verified'})

  let count=0
  const failureEngine=createGhostPrefetch(()=>`FAIL_${++count}`,async ()=>{throw new Error('CFOP timeout')})
  failureEngine.prewarm()
  await new Promise(resolve=>setImmediate(resolve))
  failureEngine.prewarm()
  assert.equal(count,2,'failure clears speculative slot for retry')
  console.log('Ghost verified-solution prefetch tests passed: reuse, deduplication, cache eviction, failure recovery.')
} finally {fs.rmSync(dir,{recursive:true,force:true})}
