/** Validate learning content and the cube's real turn state on every example.
 * Run: node scripts/test-academy.mjs
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import ts from 'typescript'
import { pathToFileURL } from 'node:url'
const root = path.resolve('src/lib')
const dir = fs.mkdtempSync(path.join(os.tmpdir(),'cubehero-academy-test-'))
process.on('exit',()=>fs.rmSync(dir,{recursive:true,force:true}))
for(const name of ['cubeMoves','cubeState','academyFullCases','academy']){
  const code = ts.transpileModule(fs.readFileSync(path.join(root,`${name}.ts`),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
    .replace(/from ['"]\.\/([^'".]+)['"]/g,(_,part)=>`from './${part}.mjs'`)
  fs.writeFileSync(path.join(dir,`${name}.mjs`),code)
}
const load=async name=>import(pathToFileURL(path.join(dir,`${name}.mjs`)).href)
const {cubeFacesAt,isVisuallySolved} = await load('cubeState')
const {parseCubeMove,tokenizeCubeMoves} = await load('cubeMoves')
const academy = await load('academy')
const {ACADEMY_LESSONS,ACADEMY_ALGORITHMS,ACADEMY_DRILLS,ACADEMY_MODULES,
  inverseAcademySequence,academyPlan,academyProgressPercent,parseAcademyProgress,initialAcademyProgress}=academy

assert.equal(ACADEMY_MODULES.length,6)
assert.equal(ACADEMY_LESSONS.length,6)
assert.equal(new Set(ACADEMY_LESSONS.map(x=>x.id)).size,6)
assert.deepEqual(ACADEMY_LESSONS.map(x=>x.id),ACADEMY_MODULES)
assert.equal(ACADEMY_ALGORITHMS.filter(x=>x.category==='f2l').length,41)
assert.equal(ACADEMY_ALGORITHMS.filter(x=>x.category==='oll').length,57)
assert.equal(ACADEMY_ALGORITHMS.filter(x=>x.category==='pll').length,21)
assert.equal(ACADEMY_ALGORITHMS.filter(x=>x.category==='cross').length,12)
assert.equal(new Set(ACADEMY_ALGORITHMS.map(x=>x.id)).size,ACADEMY_ALGORITHMS.length)
assert.equal(academyProgressPercent([]),0)
assert.equal(academyProgressPercent(['notation','cross','f2l','oll','pll','finger']),100)
assert.equal(academyProgressPercent(['notation','cross','f2l']),50)
const blank=initialAcademyProgress()
assert.deepEqual(parseAcademyProgress(null),blank)
assert.deepEqual(parseAcademyProgress({completed:['cross','cross','bad'],favorites:['sune','sune','bad'],notationTurns:-1,lastModule:'unknown'}),{
  completed:['cross'],favorites:['oll-27'],masteredCases:[],notationTurns:0,lastModule:'notation'
})
let count=0
for(const item of [...ACADEMY_ALGORITHMS,...ACADEMY_DRILLS]){
  const sequence=item.sequence
  const tokens=tokenizeCubeMoves(sequence)
  assert.ok(tokens.length)
  for(const token of tokens)parseCubeMove(token)
  const inverse=inverseAcademySequence(sequence)
  assert.equal(tokenizeCubeMoves(inverse).length,tokens.length)
  assert.ok(isVisuallySolved(cubeFacesAt(inverse,tokens,tokens.length)),`demo must finish solved: ${item.id}`)
  const plan=academyPlan(sequence,650)
  assert.deepEqual(plan.moves,tokens)
  assert.equal(plan.totalMs,tokens.length*650)
  assert.equal(plan.moveEndsMs.length,tokens.length)
  assert.equal(plan.moveEndsMs.at(-1),plan.totalMs)
  assert.equal(plan.solution,sequence)
  count++
}
for(const lesson of ACADEMY_LESSONS){
  assert.ok(ACADEMY_ALGORITHMS.some(x=>x.id===lesson.practiceAlgorithm))
  assert.ok(lesson.steps.length>=3)
}
assert.ok(isVisuallySolved(cubeFacesAt('',[],0)))
assert.ok(!isVisuallySolved(cubeFacesAt('R',[],0)))
for(const move of ["R","U'","F2","M","x","Rw'"]){
  const inverse=inverseAcademySequence(move)
  assert.ok(isVisuallySolved(cubeFacesAt(inverse,[move],1)))
}
console.log(`PASS: ${count} Academy demonstrations, 41 F2L + 57 OLL + 21 PLL + 12 Cross exercises, cube-state verification, and progress migration.`)
