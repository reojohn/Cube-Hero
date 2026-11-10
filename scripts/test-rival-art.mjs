/* Phase 2.5: static contract for the original, fully code-drawn rival art. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { loadTestModules } from './ts-test-loader.mjs'
const require = createRequire(import.meta.url)
const { transpileModule, ModuleKind, JsxEmit, ScriptTarget } = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const dirname=path.dirname(fileURLToPath(import.meta.url))
const tsx=fs.readFileSync(path.join(dirname,'../src/components/RivalAvatar.tsx'),'utf8')
const code=transpileModule(tsx,{compilerOptions:{module:ModuleKind.CommonJS,jsx:JsxEmit.ReactJSX,target:ScriptTarget.ES2022}}).outputText
const mod={exports:{}}
new Function('require','module','exports',code)(require,mod,mod.exports)
const {default: RivalAvatar, getRivalArtDNA, ART_MOTIFS}=mod.exports
const {AI_RIVALS}=await loadTestModules()('rivals')
assert.equal(AI_RIVALS.length,55)
assert.equal(ART_MOTIFS.length,11)
const genes=AI_RIVALS.map(getRivalArtDNA)
assert.equal(new Set(genes.map(g=>`${g.silhouette}:${g.eyes}`)).size,55,'Every rival gets a distinct base silhouette and eye-expression pairing')
for(const dna of genes){
  assert.ok(dna.silhouette>=0&&dna.silhouette<11)
  assert.ok(dna.eyes>=0&&dna.eyes<5)
  assert.ok(dna.armor>=0&&dna.armor<7)
  assert.ok(dna.accessory>=0&&dna.accessory<11)
  assert.ok(dna.mask>=0&&dna.mask<5)
}
for(const [tier,accessory] of [[6,5],[7,1],[8,9],[10,7],[12,8],[59,6]]){
  assert.equal(getRivalArtDNA({difficulty:String(tier)}).accessory,accessory)
}
for(const rival of AI_RIVALS){
  const small=renderToStaticMarkup(React.createElement(RivalAvatar,{rival}))
  assert.match(small,/<svg\s/)
  assert.match(small,/role="img"/)
  assert.match(small,new RegExp(`aria-label="${rival.name}`))
  assert.ok((small.match(/<path /g)||[]).length>=20,`${rival.name} should use multiple drawn layers`)
  assert.doesNotMatch(small,/<(?:img|image|foreignObject)\b/i,'PNG/images are never required')
}
const featured=renderToStaticMarkup(React.createElement(RivalAvatar,{rival:AI_RIVALS[4],large:true}))
assert.match(featured,/rival-code-avatar-large/)
assert.match(featured,/rival-vector-fine-detail/)
assert.doesNotMatch(tsx,/import\.meta\.glob|\.png|<img/,'Pure code artwork cannot require PNGs')
console.log('PASS: 55 original vector avatars, 11 curved silhouettes, 5 eye styles, 7 armors, 11 accessories, readable names, no image dependencies.')
