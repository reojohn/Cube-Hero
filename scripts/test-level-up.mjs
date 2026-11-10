/* Level celebration contract: real XP thresholds + working animation markup. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const require=createRequire(import.meta.url)
function load(file, dependencies={}){
  const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText
  const m={exports:{}}
  new Function('require','module','exports',code)((name)=>name.endsWith('.css')?{}:(dependencies[name]??require(name)),m,m.exports)
  return m.exports
}
const journey=load('src/lib/heroJourney.ts',{'./racing':{}})
const {earnedLevel}=load('src/lib/levelUp.ts',{'./heroJourney':journey})
const {levelInfo}=journey
assert.equal(earnedLevel(1,0),null)
assert.equal(earnedLevel(1,199),null)
assert.deepEqual(earnedLevel(1,200),{previousLevel:1,level:2,title:'Rookie'})
assert.equal(earnedLevel(2,200),null,'Do not replay on same level')
assert.equal(earnedLevel(2,199),null,'No celebration when XP falls')
assert.equal(earnedLevel(2,454),null)
assert.equal(earnedLevel(2,455)?.level,3)
assert.equal(earnedLevel(1,455)?.level,3,'Multiple levels are bundled in one celebration')
assert.equal(earnedLevel(100,1e7),null,'Never celebrate beyond capped level')
assert.equal(earnedLevel(1,Number.NaN),null)
for(let n=2;n<=100;n++){
  let xp=0
  while(levelInfo(xp).level<n)xp+=1
  const result=earnedLevel(n-1,xp)
  assert.equal(result?.level,n)
  assert.equal(earnedLevel(n,xp),null)
}
const React=require('react')
const {renderToStaticMarkup}=require('react-dom/server')
const {default:LevelUpCelebration}=load('src/components/LevelUpCelebration.tsx')
for(const level of [2,9,23,100]){
  const html=renderToStaticMarkup(React.createElement(LevelUpCelebration,{level,previousLevel:level-1,title:level>=25?'Legend':'Speedster',reducedMotion:false,onContinue:()=>{}}))
  assert.match(html,/role="dialog" aria-modal="true"/)
  assert.match(html,/<svg/)
  assert.match(html,/>LEVEL UP</)
  assert.match(html,/>CONTINUE/)
  assert.match(html,new RegExp(`Earned level ${level}`))
  assert.match(html,new RegExp(`>${level}</text>`))
  assert.ok(html.includes('ch-levelup-stage'))
  assert.ok(html.includes('ch-levelup-firework'))
}
const still=renderToStaticMarkup(React.createElement(LevelUpCelebration,{level:4,previousLevel:3,title:'Rookie',reducedMotion:true,onContinue:()=>{}}))
assert.match(still,/ch-levelup--still/)
const app=fs.readFileSync(path.join(root,'src/App.tsx'),'utf8')
assert.match(app,/syncJourney\(journey,history,ghost,academy\)/,'Initial baseline includes old imported XP')
assert.match(app,/earnedLevel\(lastLevelRef\.current,journeyMetrics\(journey\)\.xp\)/)
assert.match(app,/levelUp&&<LevelUpCelebration/)
assert.match(app,/vsPendingSession&&<VsIntro/,'VS introduction preserved')
const css=fs.readFileSync(path.join(root,'src/components/LevelUpCelebration.css'),'utf8')
assert.match(css,/@media\(max-width:650px\)/)
assert.match(css, /prefers-reduced-motion:reduce/)
console.log('PASS: threshold detection (levels 1–100), one-time events, no startup replay, medal/stadium/Continue markup, responsive/reduced-motion styling, VS preservation.')
