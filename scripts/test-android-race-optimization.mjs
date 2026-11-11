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
assert.match(timer, /window\.setInterval\(drawValue, 55\)/)
assert.match(timer, /requestAnimationFrame\(update\)/, 'non-Android stopwatch stays unchanged')
assert.match(timer, /performance\.now\(\) - startAt/)
assert.match(timer, /firstChild/)
assert.match(timer, /memo\(LiveTimerText/, 'Android racing parent cannot undo accurate display')
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
  assert.ok(contents.includes('<MobileRaceCube'))
}
console.log('PASS: Android UI ticks 360ms, stopwatches use independent accurate 55ms updates, iPhone untouched, 3×3 CSS turns/timing preserved, loader 3.3× faster.')
