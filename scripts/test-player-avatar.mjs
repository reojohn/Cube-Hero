/** Cropping math, local persistence and avatar integration regression checks. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require=createRequire(import.meta.url)
const {transpileModule, ModuleKind, ScriptTarget}=require('typescript')
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const code=fs.readFileSync(path.join(root,'src/lib/localPlayerAvatar.ts'),'utf8')
const module={exports:{}}
new Function('window','module','exports',transpileModule(code,{compilerOptions:{module:ModuleKind.CommonJS,target:ScriptTarget.ES2022}}).outputText)(
  {localStorage:{getItem:()=>null}},module,module.exports,
)
const {isSavedPlayerAvatar,playerAvatarCropGeometry,PLAYER_AVATAR_MAX_FILE_BYTES,PLAYER_AVATAR_EXPORT_SIZE,PLAYER_AVATAR_STORAGE_KEY}=module.exports
assert.equal(PLAYER_AVATAR_MAX_FILE_BYTES,10*1024*1024)
assert.equal(PLAYER_AVATAR_EXPORT_SIZE,320)
const square=playerAvatarCropGeometry(1024,1024,300,1,0,0)
assert.equal(square.sourceSize,1024)
assert.equal(square.sourceX,0)
assert.equal(square.sourceY,0)
const landscape=playerAvatarCropGeometry(1200,600,300,1,0,0)
assert.equal(landscape.sourceSize,600)
assert.equal(landscape.sourceX,300)
assert.equal(landscape.sourceY,0)
const portrait=playerAvatarCropGeometry(600,1200,300,1,0,0)
assert.equal(portrait.sourceSize,600)
assert.equal(portrait.sourceY,300)
const moved=playerAvatarCropGeometry(1200,600,300,2,10_000,-10_000)
assert.equal(moved.x,moved.maxX)
assert.equal(moved.y,-moved.maxY)
assert.ok(moved.sourceX>=0 && moved.sourceX+moved.sourceSize <= 1200+1e-6)
assert.ok(moved.sourceY>=0 && moved.sourceY+moved.sourceSize <= 600+1e-6)
assert.equal(isSavedPlayerAvatar('data:image/jpeg;base64,AAAA'),true)
assert.equal(isSavedPlayerAvatar('data:image/svg+xml;base64,AAAA'),false)
assert.equal(isSavedPlayerAvatar('javascript:alert(1)'),false)
assert.equal(isSavedPlayerAvatar(null),false)
const actual=new Map([['cube-hero-history-v2','RACES'],['cube-hero-ghost-v1','GHOST'],['cube-hero-hero-journey-v1','XP']])
const fakeStore={getItem:key=>actual.get(key)??null,setItem:(key,value)=>actual.set(key,value),removeItem:key=>actual.delete(key)}
const persisted={exports:{}}
new Function('window','module','exports',transpileModule(code,{compilerOptions:{module:ModuleKind.CommonJS,target:ScriptTarget.ES2022}}).outputText)(
  {localStorage:fakeStore},persisted,persisted.exports,
)
const storage=persisted.exports
assert.equal(storage.loadPlayerAvatar(),null)
assert.equal(storage.persistPlayerAvatar('data:image/jpeg;base64,AAAA'),true)
assert.equal(storage.loadPlayerAvatar(),'data:image/jpeg;base64,AAAA')
assert.equal(storage.removePlayerAvatar(),true)
assert.equal(storage.loadPlayerAvatar(),null)
assert.equal(actual.has(PLAYER_AVATAR_STORAGE_KEY),false)
for(const [key,value] of [['cube-hero-history-v2','RACES'],['cube-hero-ghost-v1','GHOST'],['cube-hero-hero-journey-v1','XP']])assert.equal(actual.get(key),value)
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8')
assert.match(read('src/components/LocalPlayerProvider.tsx'),/avatarUrl, uploadedAvatarUrl, avatarPresetId, avatarKind/)
assert.match(read('src/components/PlayerAvatar.tsx'),/avatarUrl \|\| playerAvatarPng/)
assert.match(read('src/components/VsIntro.tsx'),/src=\{playerPortrait\}/)
assert.match(read('src/App.tsx'),/<AvatarSettings\s*\/>/)
assert.match(read('src/components/AvatarCropDialog.tsx'),/canvas\.toDataURL\('image\/jpeg'/)
assert.match(read('src/components/AvatarCropDialog.tsx'),/setPointerCapture/)
assert.match(read('src/components/AvatarCropDialog.tsx'),/playerAvatarCropGeometry/)
console.log('PASS: 1:1 crop geometry, drag boundaries, raster validation, device-local persistence, default fallbacks, VS/profile integration.')
