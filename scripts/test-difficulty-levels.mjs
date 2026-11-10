/* Regression test for expanded Sub-6 through Sub-60 opponents. */
import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const load=loadTestModules()
const racing = await load('racing')
const { createAiPlan } = await load('aiPlan')
const expectedPresets = {'6':5500, '8':7000, '10':9000, '12':10800, '15':14100, '20':18000}
assert.equal(racing.ALL_DIFFICULTIES.length,55)
assert.equal(racing.ALL_DIFFICULTIES[0], '6')
assert.equal(racing.ALL_DIFFICULTIES.at(-1), '60')
for(const invalid of ['0','5','61','100','07','-5','15.5','foo',null,20]) assert.equal(racing.isDifficulty(invalid),false,`Invalid ${invalid}`)
for(const [tier,value] of Object.entries(expectedPresets)) assert.equal(racing.aiBaseMeanMs(tier),value)
assert.equal(racing.aiBaseMeanMs('30'),28000)
assert.equal(racing.aiBaseMeanMs('60'),58000)
let previous=0
const sampleScramble="R U F2 D' L B2 R' U2 F L2 B R' D U' F2 R L' B2 U D2"
let plans=0
for(const tier of racing.ALL_DIFFICULTIES){
  assert.equal(racing.isDifficulty(tier),true)
  const base=racing.aiBaseMeanMs(tier)
  assert.ok(base>previous,`Non-increasing target at ${tier}`)
  previous=base
  for(const style of racing.AI_PERSONALITIES){
    const target=racing.aiExpectedMeanMs(tier,style)
    assert.ok(target>1000,`Invalid time target ${tier}/${style}`)
    const times=[]
    for(let n=0;n<120;n++){
      const time=racing.generateAiTimeMs(tier,style)
      assert.ok(Number.isFinite(time)&&time>=1000)
      times.push(time)
    }
    const average=times.reduce((a,b)=>a+b,0)/times.length
    assert.ok(Math.abs(average/target-1)<.12,`Unexpected mean ${tier}/${style}: ${average} vs ${target}`)
    const plan=createAiPlan(sampleScramble,"R U2 F' L2 B D2 R' U L'",tier,style)
    assert.ok(plan.totalMs>0)
    assert.equal(plan.moveEndsMs.at(-1),plan.totalMs)
    plans++
  }
}
const settings={difficulty:'45',personality:'casual',raceLength:'single',inspection:true,showCube:true,breakdown:true,puzzle:'333'}
const record=racing.createRecord({id:'test',settings,records:[]},sampleScramble,44500,'none',45200)
assert.equal(record.difficulty,'45')
assert.ok(racing.isRaceRecord(record))
console.log(`PASS: 55 sub levels × 3 personalities (${plans} timing plans), original 6 profiles unchanged, all averages monotonic, new-tier history compatible.`)
