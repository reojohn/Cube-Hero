/** Guard the mobile racing fast path against future expensive re-renders. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { transpileModule, ModuleKind, ScriptTarget } = require('typescript')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const moduleSource = read('src/lib/mobilePerformance.ts')
const compiled = transpileModule(moduleSource, { compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 } }).outputText
const compiledModule = { exports: {} }
new Function('window', 'module', 'exports', 'require', compiled)({ matchMedia: () => ({ matches: false }) }, compiledModule, compiledModule.exports, require)
const { MOBILE_PERFORMANCE_QUERY, DESKTOP_COMPETITION_TICK_MS, MOBILE_COMPETITION_TICK_MS, MOBILE_RACING_TICK_MS, competitionRenderIntervalMs } = compiledModule.exports
assert.equal(DESKTOP_COMPETITION_TICK_MS, 30)
assert.equal(MOBILE_COMPETITION_TICK_MS, 90)
assert.ok(MOBILE_COMPETITION_TICK_MS > DESKTOP_COMPETITION_TICK_MS)
assert.equal(MOBILE_RACING_TICK_MS, 240)
assert.ok(MOBILE_RACING_TICK_MS > MOBILE_COMPETITION_TICK_MS)
assert.equal(competitionRenderIntervalMs(), DESKTOP_COMPETITION_TICK_MS)
assert.equal(competitionRenderIntervalMs(true), DESKTOP_COMPETITION_TICK_MS)
assert.match(MOBILE_PERFORMANCE_QUERY, /orientation: landscape/)
assert.match(MOBILE_PERFORMANCE_QUERY, /pointer: coarse/)
assert.match(MOBILE_PERFORMANCE_QUERY, /max-width: 740px/)

const room = read('src/components/RaceRoom.tsx')
const ghost = read('src/components/GhostRace.tsx')
const live = read('src/components/LiveTimerText.tsx')
const css = read('src/mobile-performance.css')
const entry = read('src/GameEntry.tsx')
for (const [source, label] of [[room, 'AI'], [ghost, 'Ghost']]) {
  assert.match(source, /setInterval\(\(\)=>setTick\(msNow\(\)\),competitionRenderIntervalMs\(stage===.running.\|\|stage===.waiting.\)\)/, `${label}: only slow the parent React tree while racing`)
  assert.match(source, /<LiveTimerText/, `${label}: independent live stopwatch`)
  assert.match(source, /performance\.now\(\)/, `${label}: high-resolution stopwatch source`)
  assert.match(source, /memo\(function ScrambleBeginnerGuide/, `${label}: static scramble guide must not re-render on every tick`)
  assert.match(source, /<MobileRaceCube/, `${label}: mobile fast-path uses a lightweight verified cube`)
}
assert.match(room, /session\.settings\.showCube&&!compactRendering/, 'extra rival cubes are simplified only for compact screens')
assert.match(room, /<AiCube3D scramble=\{scramble\} plan=\{plan\}/, 'featured AI 3D cube is still present')
assert.match(ghost, /<AiCube3D scramble=\{scramble\} plan=\{ghostPlan\}/, 'Ghost detailed desktop cube is still present')
assert.doesNotMatch(ghost, /ghostStatus==='ready'\)ghostPrefetch\.prewarm/, 'do not start background CFOP prefetch while preparing a live duel')
assert.match(live, /requestAnimationFrame\(update\)/)
assert.match(live, /firstChild/)
assert.match(live, /\.nodeValue = value/, 'do not detach the React-managed text node')
assert.match(live, /performance\.now\(\) - startAt/, 'live display uses monotonic elapsed time')
assert.match(css, /\.ai-physical-cube-camera\s*\{\s*animation: none/)
assert.match(css, /\.rival-preview-halo/)
assert.match(css, /\.ai-mobile-solid-stage/)
const mobileCube = read('src/components/MobileRaceCube.tsx')
assert.match(mobileCube, /cubeFacesAt\(scramble, plan\.moves, completed\)/, 'mobile cube states are derived from verified moves')
assert.match(mobileCube, /moveIndexAt\(plan, elapsed\)/, 'mobile cube follows actual race clock')
assert.match(mobileCube, /const SIDES: readonly Face\[\] = \['U', 'R', 'F', 'D', 'L', 'B'\]/, 'solid cubie faces prevent missing plastic during physical turns')
assert.match(mobileCube, /memo\(function MobileRaceCube/, 'parent ticks must not redraw mobile cube')
assert.match(mobileCube, /plan\.moveEndsMs\[completed\] - elapsed/, 'mobile cube schedules verified move boundaries rather than polling every frame')
assert.match(mobileCube, /className="ai-physical-layer ai-mobile-turn-layer"/, 'mobile cube renders a real physical slice')
assert.match(mobileCube, /movingPieces\.map/, 'mobile cube must render only the selected moving cubies')
assert.match(mobileCube, /stationaryPieces\.map/, 'stationary cubelets stay solid during slice turns')
assert.doesNotMatch(mobileCube, /setInterval\(/, 'mobile cube must not run a constant interval')
assert.match(entry, /import '\.\/mobile-performance\.css'/)
assert.doesNotMatch(read('src/components/SoloTimer.tsx'), /competitionRenderIntervalMs/, 'standalone Solo Timer is unchanged')
console.log('PASS: mobile race tree 240ms, 90ms arming, move-boundary-scheduled full-solid cube, desktop 3D preserved, 45ms stopwatch, background ghost prefetch deferred.')
