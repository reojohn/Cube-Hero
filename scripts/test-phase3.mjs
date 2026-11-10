/* Dependency-free test harness for the race model; uses the project's existing TypeScript dependency. */
import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const load = loadTestModules()
const racing = await load('racing')
const { createAiPlan, animationTimestamp, moveIndexAt } = await load('aiPlan')
{
  for(let i=0;i<120;i++) {
    const scramble=racing.generateScramble()
    assert.equal(scramble.split(' ').length,25)
    assert.ok(/^(?:[URFDLB](?:2|')?)(?:\s+[URFDLB](?:2|')?)*$/.test(scramble))
  }
  const tiers=['20','15','12','10','8','6']
  const profiles=['casual','balanced','competitive']
  const solved='R U2 F D\' L2 B R\' U F2 D L U2 F\' R B2 U\' L F D2 R\''
  let cases=0
  for(const tier of tiers) for(const profile of profiles){
    const results=[]
    for(let i=0;i<160;i++){
      const plan=createAiPlan(racing.generateScramble(),solved,tier,profile)
      assert.equal(plan.moves.length,20)
      assert.ok(plan.totalMs>0)
      assert.equal(plan.segmentsMs.reduce((a,b)=>a+b,0),plan.totalMs)
      assert.equal(plan.moveEndsMs.at(-1),plan.totalMs)
      assert.equal(animationTimestamp(plan,0),'start')
      assert.equal(animationTimestamp(plan,plan.totalMs),'end')
      assert.equal(moveIndexAt(plan,plan.totalMs),plan.moves.length)
      let previous=0
      for(let t=1;t<plan.totalMs;t+=Math.max(1,Math.round(plan.totalMs/37))){
        const stamp=animationTimestamp(plan,t)
        assert.equal(typeof stamp,'number')
        assert.ok(stamp>=previous)
        previous=stamp
      }
      results.push(plan.totalMs)
      cases++
    }
    const mean=results.reduce((a,b)=>a+b,0)/results.length
    const baseline=racing.aiExpectedMeanMs(tier,profile)
    assert.ok(mean>baseline*.75&&mean<baseline*1.25,`Mean for ${tier}/${profile}: ${mean} vs ${baseline}`)
  }
  const session={id:'session-1',settings:{difficulty:'15',personality:'balanced',raceLength:'single',inspection:true,showCube:true,breakdown:true,puzzle:'333'},records:[]}
  const examplePlan=createAiPlan('R U F2',solved,'15','balanced')
  const record=racing.createRecord(session,'R U F2',15000,'none',examplePlan.totalMs,{solution:examplePlan.solution,moveCount:examplePlan.moves.length,qtm:examplePlan.qtm,segmentsMs:examplePlan.segmentsMs})
  assert.ok(racing.isRaceRecord(record))
  assert.ok(record.aiSolution)
  assert.ok(racing.isRaceRecord({...record,aiSolution:undefined,aiSegmentsMs:undefined}))
  assert.equal(record.aiSegmentsMs.reduce((a,b)=>a+b,0),record.aiMs)
  console.log(`Passed: 120 scrambles, ${cases} opponent plans across 18 difficulty/personality combos, timestamp monotonicity, recorded metadata, legacy compatibility.`)
}
