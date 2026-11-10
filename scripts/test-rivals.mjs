/* Character-select roster: static identities must match the verified 55 Sub levels. */
import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const load=loadTestModules()
const racing=await load('racing')
const {AI_RIVALS, RIVAL_COUNT, RIVAL_DIVISIONS, getRival, searchRivals, hasRival, rivalDivision}=await load('rivals')
assert.equal(RIVAL_COUNT,55)
assert.equal(AI_RIVALS.length,55)
assert.deepEqual(AI_RIVALS.map(r=>r.difficulty),racing.ALL_DIFFICULTIES)
assert.equal(new Set(AI_RIVALS.map(r=>r.name.toLowerCase())).size,55)
assert.equal(new Set(AI_RIVALS.map(r=>r.difficulty)).size,55)
assert.deepEqual(RIVAL_DIVISIONS,['Legend','Master','Expert','Challenger','Rising'])
for(const rival of AI_RIVALS){
  assert.ok(rival.name&&rival.title&&rival.motto&&rival.blurb)
  assert.equal(hasRival(rival.difficulty),true)
  assert.equal(getRival(rival.difficulty),rival)
  assert.equal(rival.division,rivalDivision(rival.difficulty))
  assert.equal(rival.expectedMs,racing.aiExpectedMeanMs(rival.difficulty))
  assert.match(rival.accent,/^#[0-9a-f]{6}$/i)
  assert.ok(rival.variant>=0&&rival.variant<5)
  assert.equal(searchRivals('sub-'+rival.difficulty).some(x=>x.difficulty===rival.difficulty),true)
  assert.equal(searchRivals(rival.name.toUpperCase()).some(x=>x.difficulty===rival.difficulty),true)
  for(const personality of racing.AI_PERSONALITIES){
    const expected=racing.aiExpectedMeanMs(rival.difficulty,personality)
    assert.ok(expected>0)
  }
}
assert.equal(getRival('15').name,'Ryuu')
assert.equal(getRival('6').name,'Zenith')
assert.equal(getRival('60').name,'Cody')
assert.equal(searchRivals('').length,55)
assert.equal(searchRivals('nonsense').length,0)
for(const division of RIVAL_DIVISIONS){
  const filtered=searchRivals('',division)
  assert.ok(filtered.length>0)
  assert.ok(filtered.every(r=>r.division===division))
}
for(const old of ['20','15','12','10','8','6'])assert.equal(hasRival(old),true)
for(const invalid of ['61','5','0',null,'six'])assert.equal(hasRival(invalid),false)
console.log('PASS: 55 unique rivals from Sub-6 to Sub-60; selection, search, divisions, timing, and existing favorites remain valid.')
