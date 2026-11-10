/** The 55 roster cards should never decode full 512px art at thumbnail size.
 *  This test ensures assets and wiring remain optimized when new rivals arrive.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8')
const manifest=read('src/lib/rivalPortraits.ts')
const portrait=read('src/components/RivalPortrait.tsx')
const select=read('src/components/RivalSelect.tsx')
const css=read('src/components/RivalSelect.css')
const mappings=[...manifest.matchAll(/'\d+':\s*'(Sub-\d+_[A-Za-z]+\.webp)'/g)]
assert.equal(mappings.length,55)
let originalBytes=0,thumbBytes=0
for(const [,filename] of mappings){
  const full=path.join(root,'public/rivals',filename)
  const thumb=path.join(root,'public/rivals/thumbs',filename)
  assert.ok(fs.existsSync(thumb),`Missing 160px portrait thumbnail: ${filename}`)
  const b=fs.readFileSync(thumb)
  assert.equal(b.toString('ascii',0,4),'RIFF')
  assert.equal(b.toString('ascii',8,12),'WEBP')
  assert.ok(b.length<35_000,`Thumbnail too large: ${filename}`)
  thumbBytes+=b.length
  originalBytes+=fs.statSync(full).size
}
assert.ok(thumbBytes < originalBytes/3,'Thumbnail total must be at least 3x smaller than full-resolution WebPs')
assert.match(manifest,/getRivalPortraitThumbnailUrl/)
assert.match(manifest,/getRivalPortraitUrl\(preferred\)/,'Prewarm only the selected full-res preview')
assert.doesNotMatch(manifest,/img\.decode\(\).*55/,'Avoid decoding all full-size images together')
assert.match(portrait,/getRivalPortraitThumbnailUrl/)
assert.match(portrait,/thumb \|\| webp/)
assert.match(portrait,/getRivalPortraitPngUrl/)
assert.match(portrait,/return <RivalAvatar/)
assert.match(select,/RivalRosterCard = memo/,'Selection should update just affected card components')
assert.match(css,/contain: layout paint style/,'Isolate roster card paints')
assert.match(css,/content-visibility: auto/,'Skip offscreen raster paints')
console.log(`PASS: 55 160px thumbnail WebPs (${(thumbBytes/1e6).toFixed(2)} MB vs ${(originalBytes/1e6).toFixed(2)} MB full-resolution); memoized cards, staged full-res prewarm, SVG fallback, and paint containment.`)
