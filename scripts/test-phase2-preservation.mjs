/**
 * Phase 2 visual/racing wiring regression guard.
 * Prevents a Phase 1 source file from silently replacing the working
 * portrait system or bypassing the VS intro after applying update archives.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const get = rel => fs.readFileSync(path.join(root,rel),'utf8')
const app = get('src/App.tsx')
const selector = get('src/components/RivalSelect.tsx')
const css = get('src/components/RivalSelect.css')
const intro = get('src/components/VsIntro.tsx')
const introCss = get('src/components/VsIntro.css')
const portrait = get('src/components/RivalPortrait.tsx')
const manifest = get('src/lib/rivalPortraits.ts')

assert.match(app, /import VsIntro from ['"]\.\/components\/VsIntro['"]/, 'App must import the VS transition')
assert.match(app, /import PlayerAvatar from ['"]\.\/components\/PlayerAvatar['"]/, 'Player identity must use shared avatar')
assert.match(app, /setVsPendingSession\(prepared\)/, 'Start Race must prepare VS, not open RaceRoom immediately')
assert.match(app, /\bsetSession\(prepared\)/, 'Race session activates only after VS ends')
assert.match(app, /<VsIntro\b/, 'App must mount VS transition')
const startRace = app.slice(app.indexOf('const startRace='), app.indexOf('const completeRound='))
assert.ok(startRace.includes('setVsPendingSession(prepared)'), 'Start Race must queue VS')
assert.ok(!/setSession\(/.test(startRace.slice(0,startRace.indexOf('const enterVsRace='))), 'Start Race must not immediately mount RaceRoom')

assert.match(selector, /import RivalPortrait from ['"]\.\/RivalPortrait['"]/, 'Selector must import raster+SVG renderer')
assert.match(selector, /<RivalPortrait rival=\{rival\}/, 'Roster must render portrait component')
assert.match(selector, /prewarmRivalPortraits\(value\)/, 'Roster should preload portraits')
assert.match(selector, /rival-preview-art--png/, 'Large preview must use PNG styling')
assert.match(css, /\.rival-png-decor/, 'Portrait halo styling must be preserved')
assert.match(css, /\.rival-png-avatar/, 'Raster art styling must be preserved')
assert.match(portrait, /getRivalPortraitUrl/, 'Portraits must resolve image manifest')
assert.match(portrait, /return <RivalAvatar rival=\{rival\}/, 'Missing image must fall back to SVG')
assert.match(portrait, /loading="eager"/, 'Portraits should use eager loading')

assert.match(intro, /VS_INTRO_DURATION_MS\s*=\s*5000/, 'Standard VS intro must last five seconds')
assert.match(intro, /cube-vs-tournament-lineup/, 'VS intro must render free-for-all competitors')
assert.match(intro, /opponentCount\s*>\s*1/, 'Multi-AI must have a distinct free-for-all layout')
assert.match(introCss, /@media\s*\(max-width:\s*600px\)/, 'Mobile VS styling is required')
assert.match(introCss, /@media\s*\(max-width:\s*360px\)/, 'Small-phone VS styling is required')

const matches = [...manifest.matchAll(/'\d+':\s*'Sub-\d+_[^']+\.webp'/g)]
assert.equal(matches.length,55,'All 55 rivals must have registered portraits')
for (const filename of matches.map(m=>m[0].match(/'(Sub-\d+_[^']+\.webp)'/)[1])) {
  const webp = path.join(root,'public/rivals',filename)
  const png = webp.replace(/\.webp$/,'.png')
  assert.ok(fs.existsSync(webp), `Missing optimized portrait: ${filename}`)
  assert.ok(fs.existsSync(png), `Missing original PNG: ${path.basename(png)}`)
  assert.equal(fs.readFileSync(webp).toString('ascii',0,4),'RIFF',`Bad WebP: ${filename}`)
  assert.equal(fs.readFileSync(png).toString('hex',0,8),'89504e470d0a1a0a',`Bad PNG: ${path.basename(png)}`)
}
console.log('PASS: portrait roster, all 55 optimized images, reusable effects, player avatar, 5-second 1v1/free-for-all VS, deferred race entry, and responsive mobile styles.')
