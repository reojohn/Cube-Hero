/** Prevent regression: all 55 rivals must have working portrait assets.
 * Keep display names separate from filenames because users can rename rivals.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const manifest = fs.readFileSync(path.join(root,'src/lib/rivalPortraits.ts'),'utf8')
const portraits = [...manifest.matchAll(/'(\d+)':\s*'(Sub-\d+_[A-Za-z]+\.webp)'/g)]
assert.equal(portraits.length,55,'Exactly 55 portraits should be registered')
let originalBytes=0,optimizedBytes=0
for(let n=6;n<=60;n++) {
  const pair=portraits.find(item => Number(item[1])===n)
  assert.ok(pair,`Missing manifest record for Sub-${n}`)
  assert.ok(pair[2].startsWith(`Sub-${n}_`),`Mismatched filename for Sub-${n}`)
  const webp=path.join(root,'public','rivals',pair[2])
  const png=webp.replace(/\.webp$/,'.png')
  for(const file of [webp,png])assert.ok(fs.existsSync(file),`Missing file: ${file}`)
  const w=fs.readFileSync(webp),p=fs.readFileSync(png)
  assert.equal(w.toString('ascii',0,4),'RIFF','WebP RIFF signature')
  assert.equal(w.toString('ascii',8,12),'WEBP','WebP signature')
  assert.equal(p.toString('hex',0,8),'89504e470d0a1a0a','PNG file signature')
  assert.equal(p.readUInt32BE(16),512,`${pair[2]} PNG width`)
  assert.equal(p.readUInt32BE(20),512,`${pair[2]} PNG height`)
  assert.equal(p.readUInt8(25),6,`${pair[2]} must contain an RGBA alpha channel`)
  assert.ok(w.length<135_000,`${pair[2]} WebP should be optimized for quick loading`)
  optimizedBytes+=w.length
  originalBytes+=p.length
}
const selector=fs.readFileSync(path.join(root,'src/components/RivalSelect.tsx'),'utf8')
const renderer=fs.readFileSync(path.join(root,'src/components/RivalPortrait.tsx'),'utf8')
const intro=fs.readFileSync(path.join(root,'src/components/VsIntro.tsx'),'utf8')
assert.match(selector,/getRivalPortraitTheme/, 'roster and preview colors should follow the source illustration')
assert.match(renderer,/rival-png-decor/, 'shared atmospheric effects must remain')
assert.match(renderer,/getRivalPortraitPngUrl/, 'WebP should retain a PNG fallback')
assert.match(renderer,/return <RivalAvatar rival=\{rival\}/, 'SVG fallback must remain')
assert.match(intro,/<RivalPortrait rival=\{portrait\} large\/>/,'multi-AI uses portraits')
assert.match(intro,/<RivalPortrait rival=\{rival\} large\/>/,'1v1 uses portraits')
console.log(`PASS: all 55 real transparent PNGs and optimized WebPs (${(originalBytes/1e6).toFixed(2)}MB → ${(optimizedBytes/1e6).toFixed(2)}MB), palettes, glow effects, PNG→SVG fallback, and VS portraits.`)
