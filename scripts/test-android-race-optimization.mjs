/** Android-specific UI optimizations must not change timed cube poses. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { transpileModule, ModuleKind, ScriptTarget } = require('typescript')
const read = path => fs.readFileSync(path, 'utf8')
const perf = transpileModule(read('src/lib/mobilePerformance.ts'), {
  compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 },
}).outputText
function load(userAgent, compact) {
  const module = { exports: {} }
  const window = { matchMedia: () => ({ matches: compact }) }
  const navigator = { userAgent }
  new Function('window', 'navigator', 'module', 'exports', perf)(window, navigator, module, module.exports)
  return module.exports
}
const android = load('Mozilla/5.0 (Linux; Android 14; Pixel 6) AppleWebKit/537.36 Chrome/126', true)
const iphone = load('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', true)
const androidDesktop = load('Mozilla/5.0 (Linux; Android 14) Chrome/126', false)
assert.equal(android.isAndroidBrowser(), true)
assert.equal(android.competitionRenderIntervalMs(), 90)
assert.equal(android.competitionRenderIntervalMs(true), 360)
assert.equal(iphone.isAndroidBrowser(), false)
assert.equal(iphone.competitionRenderIntervalMs(true), 240)
assert.equal(androidDesktop.competitionRenderIntervalMs(true), 30)

const loader = read('src/components/CubeVsLoader.tsx')
assert.match(loader, /const TURN_MS = 195/)
assert.match(loader, /const PAUSE_MS = 24/)
assert.match(loader, /const UNDO:/, 'scramble moves still reverse to solve')
assert.match(loader, /commitTurn\(cubies, sequence\[currentMoveIndex\]\)/)
assert.match(loader, /ctx\.createLinearGradient\(/, 'original white 3D cube shading remains')
assert.match(loader, /minimumFrameMs = android \? 1000 \/ 40 : 0/)

const timer = read('src/components/LiveTimerText.tsx')
const clocks = read('src/lib/mobileClockScheduler.ts')
assert.match(timer, /subscribeAndroidStopwatch\(drawValue, graphics === 'low' \? 0 : 33\)/, 'Android uses shared frame-synced clock')
assert.doesNotMatch(timer, /setInterval/, 'Android stopwatch does not use low-frequency timeout painting')
assert.match(clocks, /window\.requestAnimationFrame\(onFrame\)/, 'one shared Android animation-frame loop')
assert.match(clocks, /activeClocks\.size > 4 \? 32 : 0/, 'many opponents have an adaptive text budget')
assert.match(clocks, /visibilitychange/, 'Android background/resume catch-up')
assert.match(timer, /performance\.now\(\)/, 'desktop clock remains monotonic')
assert.match(timer, /firstChild/)
assert.match(timer, /memo\(LiveTimerText/, 'Android parent cannot undo accurate display')
assert.match(timer, /previous\.running && next\.running/)

const cube = read('src/components/MobileRaceCube.tsx')
const css = read('src/mobile-performance.css')
for (const required of ['buildSolidCubeFrames(scramble, plan.moves)',
  'mobileSliceTurn(move)', 'plan.moveEndsMs[completed] - elapsed',
  'stationaryPieces.map', 'movingPieces.map']) {
  assert.ok(cube.includes(required), `Real cube preserved: ${required}`)
}
assert.match(css, /@keyframes ch-mobile-physical-slice/)
assert.match(css, /\.ai-mobile-turn-layer \{/)
assert.match(css, /\.cube-android-browser \.app-shell \.ch-performance-live/)
assert.doesNotMatch(css, /cube-android-browser[^\n]*ai-mobile-turn-layer/, 'Never disable physical turn animations')
for (const file of ['src/components/RaceRoom.tsx','src/components/GhostRace.tsx']) {
  const contents = read(file)
  assert.ok(contents.includes('ch-performance-live'))
  assert.ok(contents.includes('competitionRenderIntervalMs('))
  assert.ok(contents.includes('scheduleOpponentFinishRefreshes'), 'Android race page updates only on opponent finishes')
  assert.ok(contents.includes('shouldRenderAndroidOnFinishOnly'), 'Android pages skip frequent full-page race ticks')
  assert.ok(contents.includes('<RaceCubeVisual'), 'both race pages use quality-aware cube selection')
}
console.log('PASS: Android full-page renders only at opponent finishes, shared frame-synchronized stopwatch drawing, iPhone and 3D cube turns preserved.')
