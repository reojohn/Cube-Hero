import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const { parseGhostData, bestGhostTime, officialGhostTime, makeGhostPlan } = await loadTestModules()('ghost')
const q=(id,officialMs)=>({id,mode:'qualifying',scramble:'R U',date:'2026-11-08',rawMs:officialMs,penalty:'none',officialMs,opponentMs:null})
const empty=parseGhostData(null)
assert.equal(bestGhostTime(empty),null)
const one=parseGhostData({qualifications:[q('1',15000),q('2',13000)]})
assert.equal(bestGhostTime(one),null)
const complete=parseGhostData({qualifications:[q('1',15000),q('2',13000),q('3',17000)]})
assert.equal(bestGhostTime(complete),13000)
assert.equal(officialGhostTime(10000,'plus2'),12000)
assert.equal(officialGhostTime(10000,'dnf'),null)
const duel={...q('d',12000),mode:'ghost',opponentMs:13000}
assert.equal(bestGhostTime(parseGhostData({...complete,duels:[duel]})),12000)
assert.equal(parseGhostData({qualifications:[q('1',15000),{id:'bad'},q('2',13000),q('3',17000)]}).qualifications.length,3)
const solution={method:'cfop',solution:'R U',stages:[
  {id:'cross',moves:'R'}, {id:'f2l1',moves:''},{id:'f2l2',moves:''},{id:'f2l3',moves:''},{id:'f2l4',moves:''},{id:'oll',moves:''},{id:'pll',moves:'U'},
]}
const plan=makeGhostPlan('R U',solution,13450)
assert.equal(plan.totalMs,13450)
assert.equal(plan.moveEndsMs.at(-1),13450)
assert.equal(plan.segmentsMs.reduce((a,b)=>a+b,0),13450)
console.log('Ghost Race timing, persistence and pacing checks passed')
