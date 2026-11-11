/** Verify that Android pages redraw only at real rival finish boundaries. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { transpileModule, ModuleKind, ScriptTarget } = require('typescript')
const source = fs.readFileSync('src/lib/mobilePerformance.ts', 'utf8')
const compiled = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 } }).outputText

let now = 0
let seq = 0
let hidden = false
const pending = new Map()
const listeners = new Map()
const fakeDocument = {
  get hidden() { return hidden },
  addEventListener(event, callback) { listeners.set(event, callback) },
  removeEventListener(event, callback) { if (listeners.get(event) === callback) listeners.delete(event) },
}
const fakeWindow = {
  matchMedia: () => ({ matches: true }),
  setTimeout(callback, delay) { const id = ++seq; pending.set(id, { callback, at: now + delay }); return id },
  clearTimeout(id) { pending.delete(id) },
}
const fakePerformance = { now: () => now }
const module = { exports: {} }
new Function('module','exports','window','navigator','document','performance',compiled)(
  module,module.exports,fakeWindow,{userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'},fakeDocument,fakePerformance,
)
const { shouldRenderAndroidOnFinishOnly, scheduleOpponentFinishRefreshes } = module.exports
assert.equal(shouldRenderAndroidOnFinishOnly(),true)
const refreshes = []
const cleanup = scheduleOpponentFinishRefreshes(0,[1000,2000,4000],()=>refreshes.push(now))
const advanceTo = target => {
  assert.ok(target >= now)
  while (true) {
    const next = [...pending.entries()].sort((a,b)=>a[1].at-b[1].at)[0]
    if (!next || next[1].at > target) break
    now = next[1].at; pending.delete(next[0]); next[1].callback()
  }
  now = target
}
advanceTo(999)
assert.equal(refreshes.length,0,'No page-wide redraw while rival is solving')
advanceTo(1012)
assert.equal(refreshes.length,1,'First finish updates the leaderboard')
advanceTo(2012)
assert.equal(refreshes.length,2,'Second finish updates the leaderboard')
advanceTo(4012)
assert.equal(refreshes.length,3,'Third finish updates the leaderboard')
assert.equal(pending.size,0,'No constant polling continues after all rivals finish')
// Resume from a suspended Android WebView: refresh immediately and catch up.
now = 0
const cleanup2 = scheduleOpponentFinishRefreshes(0,[500,1500],()=>refreshes.push(now))
hidden = true
listeners.get('visibilitychange')()
assert.equal(pending.size,0,'No background callbacks')
now = 5000; hidden = false
listeners.get('visibilitychange')()
assert.equal(refreshes.at(-1),5000,'Resume paints the finished state immediately')
assert.equal(pending.size,0,'Past finishes never schedule stale callbacks')
cleanup2();cleanup()
assert.equal(listeners.size,0,'Visibility listeners cleaned up')
console.log('PASS: Android no full-screen polling, opponent finishes, background catch-up, teardown.')
