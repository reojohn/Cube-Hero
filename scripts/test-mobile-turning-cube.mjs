/** Check that the lightweight turning cube paints the same stickers as the
 * desktop physical model, without animating every cubelet on each frame. */
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
assert.match(component, /animationDuration:.*duration/, 'animation uses the original move duration')
assert.match(component, /animationDelay:.*offset/, 'move stays synchronized if a frame is late')
assert.match(component, /inTurningLayer\(/, 'only the rotating layer mounts cubelets')
assert.match(styles, /@keyframes ch-mobile-physical-slice/, 'GPU-side slice rotation exists')
assert.match(component, /cubeFacesAt\(scramble, plan\.moves, completed\)/, 'verified move state')
console.log(`PASS: ${cases} actual lightweight mobile slice turns, sticker masking, timing, and no per-frame React animations.`)
