import assert from 'node:assert/strict'
import ts from 'typescript'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const source=readFileSync(resolve(root,'src/components/SoloTimer.tsx'),'utf8')
const app=readFileSync(resolve(root,'src/App.tsx'),'utf8')
const navCss=readFileSync(resolve(root,'src/mobile-bottom-nav.css'),'utf8')
const style=readFileSync(resolve(root,'src/components/SoloTimer.css'),'utf8')
for(const x of ['generateScramble()', 'ARM_DELAY_MS','onPointerDown={pointerDown}','onPointerUp={pointerUp}',"event.code!=='Space'",'SOLO_TIMER_STORAGE_KEY','Start inspection','soloAverageOf(solves,5)','soloAverageOf(solves,12)','officialSoloMs','onActiveChange(active)','solo-confirm-modal']) assert.ok(source.includes(x), `Solo timer missing ${x}`)
for(const x of ["{page:'solo',label:'Solo Timer'", "page==='solo'&&<SoloTimer", "onClick={()=>goTo('solo')}", "page==='solo'&&to!=='solo'"])assert.ok(app.includes(x),`App navigation not wired: ${x}`)
assert.ok(navCss.includes('repeat(6, minmax(0, 1fr))'), 'Mobile dock should display Solo Timer directly')
assert.ok(style.includes('touch-action:none'),'Touch action should prevent scroll gesture during hold')
assert.ok(style.includes('max-width:370px'),'Needs smallest phone support')
const compiled=ts.transpileModule(readFileSync(resolve(root,'src/lib/soloTimer.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText
const {officialSoloMs,soloAverageOf,soloBest,soloMean,parseSoloSolves,SOLO_SOLVE_LIMIT}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))
const mk=(time,penalty='none',idx=0)=>({id:String(idx),createdAt:Date.now(),scramble:'R U R\' U\'',rawMs:time,penalty})
const five=[mk(10000,'none',1),mk(12000,'none',2),mk(11000,'none',3),mk(9000,'none',4),mk(14000,'none',5)]
assert.equal(officialSoloMs(mk(10000,'plus2')),12000)
assert.equal(officialSoloMs(mk(10000,'dnf')),null)
assert.equal(soloBest(five),9000)
assert.equal(soloMean(five),11200)
assert.equal(soloAverageOf(five,5),11000)
assert.equal(soloAverageOf(five.slice(0,4),5),undefined)
assert.equal(soloAverageOf([...five.slice(0,4),mk(15000,'dnf',5)],5),11000)
assert.equal(soloAverageOf([...five.slice(0,3),mk(15000,'dnf',4),mk(16000,'dnf',5)],5),null)
const twelve=Array.from({length:12},(_,i)=>mk((i+1)*1000,'none',i))
assert.equal(soloAverageOf(twelve,12),6500)
assert.equal(parseSoloSolves({}).length,0)
assert.equal(parseSoloSolves([mk(1000),{...mk(100),rawMs:-2}]).length,1)
assert.equal(parseSoloSolves(Array.from({length:SOLO_SOLVE_LIMIT+20},(_,i)=>mk(1000,'none',i))).length,SOLO_SOLVE_LIMIT)
assert.ok(!source.includes('setHistory(') && !source.includes('setJourney('),'Solo should not modify saved AI races/XP')
console.log('PASS: Solo Timer route and mobile nav, hold/release, local storage, +2/DNF, PB, mean, Ao5/Ao12, edit/clear protections, and race/XP isolation.')
