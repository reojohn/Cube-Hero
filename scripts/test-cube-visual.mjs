/** Run with: node scripts/test-cube-visual.mjs */
import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const { cubeFacesAt, isVisuallySolved } = await loadTestModules()('cubeState')
const colors = ['U', 'D', 'R', 'L', 'F', 'B']
function inverse(input) {
  return input.split(/\s+/).filter(Boolean).reverse().map(move => move.endsWith('2') ? move : move.endsWith("'") ? move.slice(0, -1) : `${move}'`).join(' ')
}
function checkFacelets(faces) {
  const stickers = Object.values(faces).flat()
  assert.equal(stickers.length, 54)
  for (const color of colors) assert.equal(stickers.filter(face => face === color).length, 9)
}
const examples = [
  'R', 'U', 'F', 'B', 'L', 'D',
  'R U R\' U\'',
  "R U2 F' L2 D B' U R2 F2 D' L U' B2 R' F D2 L' U2",
  'U R F D L B R2 U2 L2 F2 D2 B2',
]
for (const scramble of examples) {
  const scrambled = cubeFacesAt(scramble)
  assert.equal(isVisuallySolved(scrambled), false)
  checkFacelets(scrambled)
  const solution = inverse(scramble).split(' ')
  for (let i = 0; i <= solution.length; i++) checkFacelets(cubeFacesAt(scramble, solution, i))
  assert.equal(isVisuallySolved(cubeFacesAt(scramble, solution, solution.length)), true)
}
const suffix = ['', "'", '2']
for (let index = 0; index < 100; index++) {
  let seed = (index * 9872341 + 134217) >>> 0
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed }
  const scramble = Array.from({ length: 25 }, () => `${colors[next() % 6]}${suffix[next() % 3]}`).join(' ')
  const solution = inverse(scramble).split(' ')
  checkFacelets(cubeFacesAt(scramble))
  assert.equal(isVisuallySolved(cubeFacesAt(scramble, solution, solution.length)), true)
}
console.log('PASS: 109 scrambles, 54-sticker color integrity, live move states, and inverse solution verification.')
