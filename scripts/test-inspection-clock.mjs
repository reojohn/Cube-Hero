import assert from 'node:assert/strict'
import { inspectionElapsedMs, includeEndedHold } from '../src/lib/inspectionClock.ts'

// Regular countdown continues until the initial press.
assert.equal(inspectionElapsedMs(1000, 14500, 0, null), 13500)
assert.equal(inspectionElapsedMs(1000, 15500, 0, 14500), 13500)
assert.equal(inspectionElapsedMs(1000, 17500, 0, 14500), 13500)

// Releasing after a full 1.5 second hold starts the solve with no extra inspection time.
assert.equal(inspectionElapsedMs(1000, 16000, 0, 14500), 13500)

// An early release resumes the inspection countdown from the frozen elapsed time.
const firstPause = includeEndedHold(0, 14500, 14900)
assert.equal(firstPause, 400)
assert.equal(inspectionElapsedMs(1000, 14900, firstPause, null), 13500)
assert.equal(inspectionElapsedMs(1000, 15300, firstPause, null), 13900)

// Repeated too-short holds do not grant free inspection time.
const secondPause = includeEndedHold(firstPause, 15300, 15900)
assert.equal(inspectionElapsedMs(1000, 15900, secondPause, null), 13900)
assert.equal(inspectionElapsedMs(1000, 17000, secondPause, null), 15000)

// Hold begins in the +2 window; its penalty remains +2 even across 17 seconds.
assert.equal(inspectionElapsedMs(0, 20000, 0, 16000), 16000)
// Hold begins after 17s; DNF is already fixed.
assert.equal(inspectionElapsedMs(0, 22000, 0, 17500), 17500)
// Missing inspection/hold are harmless.
assert.equal(inspectionElapsedMs(null, 4000, 0, null), 0)
assert.equal(includeEndedHold(250, null, 9000), 250)
console.log('PASS: inspection freezes on hold, resumes after early release/cancel, and preserves penalty boundaries.')
