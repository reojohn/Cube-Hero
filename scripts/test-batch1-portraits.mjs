import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadTestModules } from './ts-test-loader.mjs'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const portraits=fs.readFileSync(path.join(root,'src/lib/rivalPortraits.ts'),'utf8')
const select=fs.readFileSync(path.join(root,'src/components/RivalSelect.tsx'),'utf8')
const component=fs.readFileSync(path.join(root,'src/components/RivalPortrait.tsx'),'utf8')
const {AI_RIVALS,rivalDivision}=await loadTestModules()('rivals')
const names=AI_RIVALS.slice(0,20)
assert.equal(names.length,20)
for (const rival of names){
 const relative=portraits.match(new RegExp(`'${rival.difficulty}': '(Sub-${rival.difficulty}_[^']+\\.webp)'`))?.[1]
 assert.ok(relative,`Missing historic mapping for Sub-${rival.difficulty}`)
 const full=path.join(root,'public/rivals',relative)
 assert.ok(fs.existsSync(full),`missing portrait: ${relative}`)
 const bytes=fs.readFileSync(full)
 assert.equal(bytes.subarray(0,4).toString(),'RIFF',relative+' WebP RIFF signature')
 assert.equal(bytes.subarray(8,12).toString(),'WEBP',relative+' WebP signature')
 assert.ok(bytes.length < 100_000,relative+' should be optimized for fast loading')
 assert.ok(fs.existsSync(full.replace('.webp','.png')),'original PNG preserved')
 assert.ok(portraits.includes(`'${rival.difficulty}': '${relative}'`),'missing mapping: '+relative)
}
assert.ok(portraits.includes("'60': 'Sub-60_Cody.webp'"),'final batch must now be installed')
assert.equal(rivalDivision('20'),'Expert')
assert.equal(rivalDivision('21'),'Challenger')
assert.equal(rivalDivision('25'),'Challenger')
assert.ok(component.includes('<RivalAvatar rival={rival} large={large} />'),'SVG fallback must remain')
assert.ok(component.includes('getRivalPortraitThumbnailUrl'),'Roster uses optimized thumbnails')
assert.ok(component.includes("error === 'thumb'") && component.includes("error === 'webp'"),'Thumbnail errors should fall back to WebP and then PNG')
assert.ok(component.includes('loading="eager"'),'roster portraits must not lazy-load')
assert.ok(select.includes('prewarmRivalPortraits(value)'),'visible rivals should prewarm in background')
assert.ok(component.includes('rival-png-decor'),'image aura overlay must render behind portrait')
assert.ok(select.includes('<RivalEmblem rival={rival}/>'),'roster must use portrait component')
assert.ok(select.includes('<RivalEmblem rival={selected} large/>'),'selected preview must use portrait component')
console.log('PASS: 20 historic compact WebP portraits retained, eager prewarm, decorated image backdrops, PNG then SVG fallback, division colors and source PNGs preserved.')
