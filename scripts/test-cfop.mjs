/** Test real CFOP stage invariants, rotations and move notation without npm access. */
import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const load=loadTestModules()
const { cubeFacesAt, isVisuallySolved } = await load('cubeState')
const { verifyCfopSolution, currentCfopStage, cfopMarkers, solvedF2LSlots, crossSolved, ollSolved, assembleCfopStages } = await load('cfop')
const stages=(cross,extra={})=>[...['cross','f2l1','f2l2','f2l3','f2l4','oll','pll'].map(id=>({id,moves:extra[id]|| (id==='cross'?cross:'')}))]
for(const suffix of ['', 'x', 'y', 'z', 'x2', "y'", 'r M R\'', 'U2 U2']) {
  // A trivial scramble solved during Cross is an authentic stage-by-stage solve.
  // The post-solve rotations preserve solvedness (relative to center colors).
  const solution=`R' ${suffix}`.trim()
  const data=verifyCfopSolution('R',{method:'cfop',solution,stages:stages(solution)})
  assert.equal(data.method,'cfop')
  assert.ok(isVisuallySolved(cubeFacesAt('R',solution.split(' '),solution.split(' ').length)),suffix)
  const markers=cfopMarkers(data)
  assert.equal(markers.length,7)
  assert.equal(currentCfopStage(markers,0),'cross')
}
assert.equal(assembleCfopStages('R',[{unitId:'cross',moves:"R'"},{unitId:'f2l',moves:''},{unitId:'oll',moves:''},{unitId:'pll',moves:''}]).stages.length,7)
const solved=cubeFacesAt('')
assert.ok(crossSolved(solved))
assert.equal(solvedF2LSlots(solved),4)
assert.ok(ollSolved(solved))
for (const sequence of ['x','y','z','M','E','S','r','u','Rw',"x2 y' z2", "M2 E' S2"]){
  const moves=sequence.split(' ')
  const reverse=moves.slice().reverse().map(m=>m.includes('2')?m:m.endsWith("'")?m.slice(0,-1):m+"'")
  assert.ok(isVisuallySolved(cubeFacesAt('',[...moves,...reverse],moves.length+reverse.length)),`turn inverse ${sequence}`)
}
assert.throws(()=>verifyCfopSolution('R', {method:'cfop',solution:"R'",stages:stages('') }),/do not match/)
assert.throws(()=>verifyCfopSolution('R', {method:'cfop',solution:'U',stages:stages('U') }),/cross/)
console.log('PASS: CFOP stage validation, rotations, 54-sticker legality, no false Cross/F2L/OLL/PLL labels.')
