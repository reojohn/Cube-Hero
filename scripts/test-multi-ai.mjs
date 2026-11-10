/* AI racing mode tests: 1–10 opponents; ties, DNFs, preserved legacy history. */
import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const load=loadTestModules()
const racing=await load('racing')
const { createAiPlan, replayAiPlan }=await load('aiPlan')
const scramble="R U2 F' L2 D B' U R2 F2 D' L U' B2 R' F D2 L' U2"
const solution="R U2 F' L2 D B' U R2 F2 D' L U' B2 R' F D2 L' U2"
assert.equal(racing.getAiCount(undefined),1)
assert.equal(racing.getAiCount(1),1)
assert.equal(racing.getAiCount('10'),10)
for(const n of [0,11,-1,NaN,2.5,'bad',null])assert.equal(racing.getAiCount(n),1)
for(let n=1;n<=10;n++){
  for(const personality of racing.AI_PERSONALITIES){
    const settings={difficulty:'15',personality,aiCount:n,raceLength:'single',inspection:true,showCube:true,breakdown:true,puzzle:'333'}
    const session={id:'multi-test',settings,records:[]}
    const plans=Array.from({length:n},(_,i)=>createAiPlan(scramble,solution,'15',personality,i?`AI-${i+1}`:''))
    assert.equal(plans.length,n)
    for(const p of plans){assert.equal(p.solution,solution);assert.equal(p.moveEndsMs.at(-1),p.totalMs)}
    const rivals=plans.map((p,i)=>({id:`AI ${i+1}`,ms:p.totalMs}))
    const fastest=Math.min(...rivals.map(x=>x.ms))
    const leader=plans.find(p=>p.totalMs===fastest)
    const details={solution:leader.solution,moveCount:leader.moves.length,qtm:leader.qtm,segmentsMs:leader.segmentsMs,method:leader.method,opponents:rivals}
    const winner=racing.createRecord(session,scramble,fastest-25,'none',fastest,details)
    assert.equal(winner.win,true);assert.equal(winner.aiMs,fastest)
    assert.ok(racing.isRaceRecord(winner));assert.equal(racing.playerPlacement(winner.officialMs,rivals),1)
    if(n>1){assert.equal(winner.aiOpponents.length,n);assert.equal(winner.playerRank,1)}
    else assert.equal(winner.aiOpponents,undefined)
    const loss=racing.createRecord(session,scramble,Math.max(...rivals.map(x=>x.ms))+1000,'none',fastest,details)
    assert.equal(loss.win,false);assert.equal(racing.playerPlacement(loss.officialMs,rivals),n+1)
    const tie=racing.createRecord(session,scramble,fastest,'none',fastest,details)
    assert.equal(tie.win,false);assert.ok(racing.playerPlacement(tie.officialMs,rivals)>=2)
    const dnf=racing.createRecord(session,scramble,0,'dnf',fastest,details)
    assert.equal(dnf.officialMs,null);assert.equal(racing.playerPlacement(dnf.officialMs,rivals),n+1)
    const penalized=racing.createRecord(session,scramble,fastest-100,'plus2',fastest,details)
    assert.equal(penalized.win,false)
    const standings=racing.rankedFinishers(winner.officialMs,rivals)
    assert.equal(standings.length,n+1)
    assert.equal(standings[0].id,'YOU')
    assert.equal(standings.at(-1).place,n+1)
    assert.equal(replayAiPlan({...winner,aiSolution:solution}).totalMs,fastest)
  }
}
const legacySettings={difficulty:'15',personality:'balanced',raceLength:'single',inspection:true,showCube:true,breakdown:true,puzzle:'333'}
const oldRecord=racing.createRecord({id:'legacy',settings:legacySettings,records:[]},scramble,13000,'none',14100)
assert.equal(oldRecord.win,true);assert.ok(racing.isRaceRecord(oldRecord))
assert.equal(racing.playerPlacement(oldRecord.officialMs,[{id:'AI 1',ms:oldRecord.aiMs}]),1)
console.log('PASS: 30 multi-AI configurations (1–10 × 3 personalities), shared scramble plans, independent times, rankings, +2, DNF, ties, replay, and saved legacy compatibility.')
