/** Android clock UI scheduler: virtual rAF / visibility / multiple-rival tests. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { transpileModule, ModuleKind, ScriptTarget } = require('typescript')
const source = fs.readFileSync('src/lib/mobileClockScheduler.ts', 'utf8')
const script = transpileModule(source, {
  compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 },
}).outputText

let now = 0
let nextId = 0
const pending = new Map()
const documentEvents = new Map()
const windowEvents = new Map()
const handlers = (map, event) => map.get(event) ?? new Set()
const add = (map, event, fn) => {
  if (!map.has(event)) map.set(event, new Set())
  map.get(event).add(fn)
}
const remove = (map, event, fn) => map.get(event)?.delete(fn)
const document = {
  hidden: false,
  addEventListener: (event, fn) => add(documentEvents, event, fn),
  removeEventListener: (event, fn) => remove(documentEvents, event, fn),
}
const window = {
  requestAnimationFrame: callback => {
    const id = ++nextId
    pending.set(id, callback)
    return id
  },
  cancelAnimationFrame: id => pending.delete(id),
  addEventListener: (event, fn) => add(windowEvents, event, fn),
  removeEventListener: (event, fn) => remove(windowEvents, event, fn),
}
const performance = { now: () => now }
const module = { exports: {} }
new Function('window', 'document', 'performance', 'module', 'exports', script)(
  window, document, performance, module, module.exports,
)
const { subscribeAndroidStopwatch } = module.exports
const step = time => {
  now = time
  const frames = [...pending.values()]
  pending.clear()
  for (const callback of frames) callback(time)
}

const clock1 = []
const clock2 = []
const off1 = subscribeAndroidStopwatch(t => clock1.push(t))
const off2 = subscribeAndroidStopwatch(t => clock2.push(t))
assert.equal(pending.size, 1, 'one animation frame shared by both clocks')
assert.deepEqual(clock1, [0], 'first paint is immediate')
assert.deepEqual(clock2, [0], 'second paint is immediate')
for (const t of [16, 32, 48, 64, 80]) {
  step(t)
  assert.equal(pending.size, 1, 'exactly one future frame scheduled')
}
assert.deepEqual(clock1, [0, 16, 32, 48, 64, 80])
assert.deepEqual(clock2, [0, 16, 32, 48, 64, 80])

document.hidden = true
for (const fn of handlers(documentEvents, 'visibilitychange')) fn()
assert.equal(pending.size, 0, 'hidden app stops scheduling screen updates')
now = 2000
document.hidden = false
for (const fn of handlers(documentEvents, 'visibilitychange')) fn()
assert.equal(clock1.at(-1), 2000, 'resume immediately shows the real elapsed time')
assert.equal(clock2.at(-1), 2000)
assert.equal(pending.size, 1)

off1()
assert.equal(pending.size, 1, 'remaining rival clock continues')
off2()
assert.equal(pending.size, 0, 'no animation loop after leaving race')
assert.equal(handlers(documentEvents, 'visibilitychange').size, 0, 'no leaked visibility listener')
assert.equal(handlers(windowEvents, 'pageshow').size, 0, 'no leaked page restore listener')

const draws = [[], [], [], [], [], [], []]
const stops = draws.map(times => subscribeAndroidStopwatch(t => times.push(t)))
assert.equal(pending.size, 1, 'seven clocks still use a single rAF')
const initial = draws.map(times => times.length)
for (const t of [2016, 2032, 2048, 2064, 2080, 2096, 2112]) step(t)
for (const [index, times] of draws.entries()) {
  assert.ok(times.length > initial[index], 'many-rival clock stays live')
  assert.ok(times.length <= initial[index] + 4, 'large race caps text work near 30 Hz')
  assert.equal(times.at(-1), draws[0].at(-1), 'all rivals receive same coherent elapsed clock')
}
for (const stop of stops) stop()
assert.equal(pending.size, 0)
// Medium and High have a real paint budget, rather than repainting at the
// same rate as the 3D compositor. The clock value itself is still monotonic.
const mediumTimes = []
const stopMedium = subscribeAndroidStopwatch(t => mediumTimes.push(t), 33)
const mediumStartingCount = mediumTimes.length
for (let i = 1; i <= 15; i++) step(2120 + i * 16)
assert.ok(mediumTimes.length > mediumStartingCount + 3, 'Medium stopwatch stays responsive')
assert.ok(mediumTimes.length < mediumStartingCount + 10, 'Medium uses fewer text paints than 60fps Low')
assert.ok(mediumTimes.every((time, index) => index === 0 || time > mediumTimes[index - 1]), 'time samples never move backwards')
stopMedium()
assert.equal(pending.size, 0, 'quality-aware stopwatch cleans up')
console.log('PASS: Android stopwatch frame sync, single rAF, multi-AI budget, resume catch-up, and cleanup.')
