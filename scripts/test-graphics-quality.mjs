/** Verify three graphics modes preserve exactly the same scramble/timing data. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { loadTestModules } from './ts-test-loader.mjs'
const load = loadTestModules()
const { GRAPHICS_OPTIONS, graphicsQuality } = await load('graphicsQuality')
const { cubeFacesAt, cubeFacesTimeline } = await load('cubeState')
const { buildSolidCubeFrames } = await load('mobileCubeFrames')
const { moveIndexAt } = await load('aiPlan')

assert.deepEqual(GRAPHICS_OPTIONS.map(x => x.value), ['low', 'medium', 'high'])
assert.equal(graphicsQuality('low'), 'low')
assert.equal(graphicsQuality('medium'), 'medium')
assert.equal(graphicsQuality('high'), 'high')
for (const wrong of [undefined, null, '', 'ultra', {}, 2]) assert.equal(graphicsQuality(wrong), 'high')

const scramble = "R U2 F' D L2 B U' R2"
const moves = ['R', "U'", 'F2', 'L', 'D2', "B'", 'U', 'R2']
const simpleFrames = cubeFacesTimeline(scramble, moves)
const physicalFrames = buildSolidCubeFrames(scramble, moves)
assert.equal(simpleFrames.length, moves.length + 1)
assert.equal(physicalFrames.length, moves.length + 1)
for (let n = 0; n < simpleFrames.length; n++) {
  assert.deepEqual(simpleFrames[n], cubeFacesAt(scramble, moves, n), `Low move ${n}: exact sticker state`)
  for (const face of ['U', 'R', 'F']) {
    for (const piece of physicalFrames[n]) {
      if (piece.stickers[face] === undefined) continue
      const i = face === 'U' ? (piece.z + 1) * 3 + piece.x + 1 :
        face === 'R' ? (1 - piece.y) * 3 + 1 - piece.z :
          (1 - piece.y) * 3 + piece.x + 1
      assert.equal(piece.stickers[face], simpleFrames[n][face][i], `Medium/High and Low agree: ${n}:${face}[${i}]`)
    }
  }
}
const plan = { moves, moveEndsMs: [150, 440, 600, 850, 1230, 1510, 1760, 2000] }
for (const [elapsed, expected] of [[0, 0], [149, 0], [150, 1], [441, 2], [1230, 5], [2000, 8], [3500, 8]]) {
  assert.equal(moveIndexAt(plan, elapsed), expected, 'all tiers follow the original plan boundaries')
}
const read = p => fs.readFileSync(p, 'utf8')
const low = read('src/components/LowRaceCube.tsx')
const mid = read('src/components/MediumRaceCube.tsx')
const mobileHigh = read('src/components/MobileRaceCube.tsx')
const select = read('src/components/RaceCubeVisual.tsx')
const app = read('src/App.tsx')
const room = read('src/components/RaceRoom.tsx')
const ghost = read('src/components/GhostRace.tsx')
assert.match(low, /cubeFacesTimeline\(scramble, plan\.moves\)/, 'Low precomputes verified sticker states once')
assert.match(low, /moveIndexAt\(plan, elapsed\)/, 'Low follows the actual stopwatch')
assert.match(low, /plan\.moveEndsMs\[completed\] - elapsed/, 'Low updates at real move boundaries')
assert.doesNotMatch(low, /requestAnimationFrame|setInterval|cubiesFromFaces/, 'Low has no frame loop or physical cube geometry')
assert.match(low, /VISIBLE_FACES: readonly Face\[\] = \['U', 'R', 'F'\]/, 'Low renders only 27 visible squares')
assert.match(mid, /MEDIUM_STATIC_FACES\.map/, 'Medium uses 3 static sticker planes')
assert.match(mid, /mediumMovingFaces\(piece, axis\)/, 'Medium draws only sticker and cut surfaces for moving cubies')
assert.match(mid, /pieces\.filter\(piece => inTurningLayer/, 'Medium only renders the active slice as 3D geometry')
assert.match(mid, /ai-mobile-turn-layer/, 'Medium still physically rotates real pieces')
assert.doesNotMatch(mid, /stationaryPieces|SolidMobileCubie|AiCube3D/, 'Medium does not build a permanent 26-piece scene')
assert.match(mobileHigh, /const SolidMobileCubie/, 'High retains all six faces per piece')
assert.match(select, /graphics === 'low'/)
assert.match(select, /graphics === 'medium'/)
assert.match(select, /<MediumRaceCube/, 'Medium has distinct lightweight renderer')
assert.match(select, /return <AiCube3D/, 'High desktop remains the existing renderer')
assert.match(app, /graphics:'high'/, 'existing default stays High')
assert.match(app, /GRAPHICS_OPTIONS\.map/, 'three selectable graphics options')
assert.match(app, /onClick=\{\(\)=>change\('graphics',option.value\)\}/, 'selection is persisted through saved Preferences')
for (const [source, name] of [[room, 'Race AI'], [ghost, 'Ghost Race']]) {
  assert.match(source, /graphics:GraphicsQuality|graphics: GraphicsQuality/, `${name} has typed graphics prop`)
  assert.match(source, /<RaceCubeVisual/, `${name} uses shared renderer`)
  assert.match(source, /startRef\.current/, `${name} retains high-resolution timing`)
}
assert.doesNotMatch(read('src/lib/aiPlan.ts'), /graphicsQuality|GraphicsQuality/, 'AI pacing is unrelated to visual quality')
assert.doesNotMatch(read('src/lib/ghost.ts'), /graphicsQuality|GraphicsQuality/, 'Ghost progress is unrelated to visual quality')
// Verify the Medium geometry never needs a full 26x6 assembly and retains
// all correct colored sticker faces on moving pieces, including inner cut caps.
const { cubiesFromFaces, inTurningLayer } = await load('cubeTurning')
const { mediumMovingFaces, MEDIUM_STATIC_FACES } = await load('mediumCubeGeometry')
const { mobileSliceTurn } = await load('mobileCubeTurn')
const renderedFaces = []
for (const notation of ['R', "U'", 'F2', 'L', 'D', 'B', 'M', 'E', 'S', 'Rw', 'Uw']) {
  const turn = mobileSliceTurn(notation)
  const pieces = cubiesFromFaces(simpleFrames[0])
  const selected = pieces.filter(piece => inTurningLayer(piece, turn.axis, turn.layers))
  assert.ok(selected.length > 0, `${notation}: physical cubies turn`)
  let count = 0
  for (const piece of selected) {
    const faces = mediumMovingFaces(piece, turn.axis)
    count += faces.length
    for (const side of Object.keys(piece.stickers)) {
      assert.ok(faces.includes(side), `${notation}: preserves exterior sticker ${side}`)
    }
    const caps = turn.axis === 'X' ? ['L','R'] : turn.axis === 'Y' ? ['U','D'] : ['F','B']
    for (const cap of caps) assert.ok(faces.includes(cap), `${notation}: cut face ${cap} is sealed`)
  }
  renderedFaces.push(count)
  assert.ok(count < 156, `${notation}: significantly less than High's 156 live faces`)
}
assert.deepEqual(MEDIUM_STATIC_FACES, ['U','R','F'])
assert.match(read('src/graphics-quality.css'), /steps\(6, end\)/, 'Medium uses six physical poses per slice')
assert.match(read('src/components/LiveTimerText.tsx'), /graphics === 'low' \? 0 : 33/, 'Android medium timers use 30Hz display budget')
console.log('PASS: Low/Medium/High selection; Medium moving-face budget', renderedFaces, '; unchanged solve/timing.')
