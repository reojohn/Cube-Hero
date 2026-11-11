/** Guard real cubie layer turns (including inner plastic faces) and low-cost
 * timing. No frame-by-frame React updates or gaps in the cube body. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { loadTestModules } from './ts-test-loader.mjs'
const load = loadTestModules()
const { cubeFacesAt } = await load('cubeState')
const { cubiesFromFaces, inTurningLayer, turnAt } = await load('cubeTurning')
const { mobileSliceTurn, visibleStickerInLayer } = await load('mobileCubeTurn')

const scramble = "F2 D L U2 R B' D2 L' F U R2"
const faces = cubeFacesAt(scramble)
const pieces = cubiesFromFaces(faces)
const VISIBLE = ['U', 'F', 'R']
const sides = ['U', 'F', 'R', 'D', 'L', 'B']
function stickerIndex(face, p) {
  const { x, y, z } = p
  if (face === 'U') return (z + 1) * 3 + x + 1
  if (face === 'D') return (1 - z) * 3 + x + 1
  if (face === 'F') return (1 - y) * 3 + x + 1
  if (face === 'B') return (1 - y) * 3 + 1 - x
  if (face === 'R') return (1 - y) * 3 + 1 - z
  return (1 - y) * 3 + z + 1
}

let cases = 0
for (const base of ['U', 'R', 'F', 'D', 'L', 'B', 'u', 'r', 'f', 'M', 'S', 'E', 'x', 'y', 'z']) {
  for (const suffix of ['', "'", '2']) {
    const move = base + suffix
    const mobile = mobileSliceTurn(move)
    const pose = turnAt({ moves: [move], moveEndsMs: [1000] }, 500)
    assert.equal(mobile.axis, pose.axis, `${move}: rotation axis`)
    assert.deepEqual(mobile.layers, pose.layers, `${move}: physical layers`)
    assert.equal(mobile.degrees, pose.degrees * 2, `${move}: full slice rotation sign`)
    const selected = pieces.filter(piece => inTurningLayer(piece, mobile.axis, mobile.layers))
    assert.ok(selected.length >= 8 && selected.length <= 26, `${move}: bounded moving slice count`)
    for (const face of VISIBLE) for (let index = 0; index < 9; index++) {
      const piece = pieces.find(piece => piece.stickers[face] && stickerIndex(face, piece) === index)
      assert.ok(piece, `missing ${face}[${index}]`)
      assert.equal(visibleStickerInLayer(face, index, mobile.axis, mobile.layers),
        inTurningLayer(piece, mobile.axis, mobile.layers), `${move}: moving ${face} sticker ${index}`)
    }
    assert.deepEqual(Object.values(cubeFacesAt(scramble, [move], 1)).flat().sort(),
      Object.values(faces).flat().sort(), `${move}: no sticker colors lost`)
    cases++
  }
}
const component = fs.readFileSync('src/components/MobileRaceCube.tsx', 'utf8')
const styles = fs.readFileSync('src/mobile-performance.css', 'utf8')
assert.match(component, /setTimeout\(sync/, 'move-boundary scheduled animation')
assert.doesNotMatch(component, /setInterval\(/, 'no constant interval/re-render loop')
assert.doesNotMatch(component, /requestAnimationFrame\(/, 'no per-frame cube redraw')
assert.match(component, /animationDuration:.*duration/, 'animation uses the original move duration')
assert.match(component, /animationDelay:.*offset/, 'move stays synchronized if a frame is late')
assert.match(component, /inTurningLayer\(/, 'rotates precisely the selected layer')
assert.match(component, /const SIDES: readonly Face\[\] = \[.*'U'.*'R'.*'F'.*'D'.*'L'.*'B'.*\]/, 'six real cubie faces, not an empty shell')
assert.match(component, /SIDES\.map\(face => <div/, 'every physical cubie has six solid plastic faces')
assert.match(component, /ai-physical-cube-body/, 'mobile orientation matches desktop physical cube')
assert.match(component, /stationaryPieces\.map/, 'all stationary cubies are retained')
assert.match(component, /movingPieces\.map/, 'only the selected physical layer is animated')
assert.match(component, /cubiesFromFaces\(cubeFaces\)/, '26 physical cubelets are generated from verified sticker state')
assert.doesNotMatch(component, /VISIBLE_FACES|ai-mobile-hidden-turn-sticker/, 'never leave empty holes in flat sticker planes')
assert.match(styles, /@keyframes ch-mobile-physical-slice/, 'compositor-driven real rotation exists')
assert.match(styles, /\.ai-mobile-solid-face\s*\{[^}]*background:/s, 'the turning cube has opaque plastic even behind uncolored faces')
assert.match(styles, /reduce-motion[^}]+ai-mobile-turn-layer/s, 'reduced motion retains the physical turning layer')
assert.match(component, /cubeFacesAt\(scramble, plan\.moves, completed\)/, 'verified move state')
for (const move of ['R', 'F', 'U', 'M', 'x']) {
  const turn = mobileSliceTurn(move)
  const rotating = pieces.filter(piece => inTurningLayer(piece, turn.axis, turn.layers))
  const stationary = pieces.filter(piece => !inTurningLayer(piece, turn.axis, turn.layers))
  assert.equal(rotating.length + stationary.length, 26, `${move}: whole cube remains solid`)
  assert.equal(new Set([...stationary, ...rotating].map(piece => piece.id)).size, 26, `${move}: no duplicate or missing cubies`)
}
console.log(`PASS: ${cases} real move geometries, 26 solid cubies, six plastic faces, timing, and no per-frame React animation.`)
