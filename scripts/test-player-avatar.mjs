/* Sanity checks for the shared player profile portrait. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
const png = fs.readFileSync(path.join(root, 'src/assets/player-avatar.png'))
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
assert.equal(png.readUInt32BE(16), 512)
assert.equal(png.readUInt32BE(20), 512)
const component = read('src/components/PlayerAvatar.tsx')
assert.match(component, /player-avatar\.png/)
assert.match(component, /decoding="async"/)
const locations = [
  ['src/App.tsx', 2],
  ['src/components/RaceRoom.tsx', 1],
  ['src/components/GhostRace.tsx', 1],
  ['src/components/RaceResults.tsx', 2],
  ['src/components/HeroJourney.tsx', 1],
]
for (const [file, minimum] of locations) {
  const count = (read(file).match(/<PlayerAvatar\b/g) || []).length
  assert.ok(count >= minimum, `${file} should have >=${minimum} player portrait instances`)
}
assert.ok(fs.existsSync(path.join(root, 'public/ghost-assassin-emblem.png')))
console.log('PASS: 512×512 player PNG, shared avatar in app shell, race, ghost, results and tournament standings; mascot logo preserved.')
