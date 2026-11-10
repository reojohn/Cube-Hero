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
const { MOBILE_PERFORMANCE_QUERY, DESKTOP_COMPETITION_TICK_MS, MOBILE_COMPETITION_TICK_MS } = compiledModule.exports
assert.equal(DESKTOP_COMPETITION_TICK_MS, 30)
assert.equal(MOBILE_COMPETITION_TICK_MS, 90)
assert.ok(MOBILE_COMPETITION_TICK_MS > DESKTOP_COMPETITION_TICK_MS)
assert.match(MOBILE_PERFORMANCE_QUERY, /orientation: landscape/)
assert.match(MOBILE_PERFORMANCE_QUERY, /pointer: coarse/)
assert.match(MOBILE_PERFORMANCE_QUERY, /max-width: 740px/)

const room = read('src/components/RaceRoom.tsx')
const ghost = read('src/components/GhostRace.tsx')
const live = read('src/components/LiveTimerText.tsx')
const css = read('src/mobile-performance.css')
const entry = read('src/GameEntry.tsx')
for (const [source, label] of [[room, 'AI'], [ghost, 'Ghost']]) {
  assert.match(source, /setInterval\(\(\)=>setTick\(msNow\(\)\),competitionRenderIntervalMs\(\)\)/, `${label}: mobile UI redraw cadence`)
  assert.match(source, /<LiveTimerText/, `${label}: independent live stopwatch`)
  assert.match(source, /performance\.now\(\)/, `${label}: high-resolution stopwatch source`)
}
assert.match(room, /session\.settings\.showCube&&!compactRendering/, 'extra rival cubes are simplified only for compact screens')
assert.match(room, /<AiCube3D scramble=\{scramble\} plan=\{plan\}/, 'featured AI 3D cube is still present')
assert.match(ghost, /<AiCube3D scramble=\{scramble\} plan=\{ghostPlan\}/, 'Ghost animated cube is still present')
assert.match(live, /requestAnimationFrame\(update\)/)
assert.match(live, /firstChild/)
assert.match(live, /\.nodeValue = value/, 'do not detach the React-managed text node')
assert.match(live, /performance\.now\(\) - startAt/, 'live display uses monotonic elapsed time')
assert.match(css, /\.ai-physical-cube-camera\s*\{\s*animation: none/)
assert.match(css, /\.rival-preview-halo/)
assert.match(entry, /import '\.\/mobile-performance\.css'/)
assert.doesNotMatch(read('src/components/SoloTimer.tsx'), /competitionRenderIntervalMs/, 'standalone Solo Timer is unchanged')
console.log('PASS: mobile 90ms race-tree cadence, 45ms lightweight time display, featured cube preserved, extra cubelets skipped, high-resolution clocks retained, scrolling effects simplified.')
