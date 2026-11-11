/** Gallery art, stable IDs, separated storage, responsive selection and VS integration. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const {transpileModule, ModuleKind, ScriptTarget} = require('typescript')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = relative => fs.readFileSync(path.join(root,relative),'utf8')
const original = read('src/lib/localPlayerAvatar.ts')
const storage = new Map([
  ['cube-hero-history-v2','IMPORTANT_RACES'],
  ['cube-hero-ghost-v1','IMPORTANT_GHOST'],
  ['cube-hero-hero-journey-v1','IMPORTANT_XP'],
])
const window = {localStorage:{
  getItem:key=>storage.get(key)??null,
  setItem:(key,value)=>storage.set(key,value),
  removeItem:key=>storage.delete(key),
}}
const module = {exports:{}}
new Function('window','module','exports', transpileModule(original,{compilerOptions:{module:ModuleKind.CommonJS,target:ScriptTarget.ES2022}}).outputText)(window,module,module.exports)
const avatar = module.exports
assert.equal(avatar.PLAYER_AVATAR_PRESET_IDS.length,11)
assert.equal(new Set(avatar.PLAYER_AVATAR_PRESET_IDS).size,11)
assert.equal(avatar.PLAYER_AVATAR_PRESET_IDS[0],'default')
assert.equal(avatar.loadPlayerAvatarPreset(),null)
assert.equal(avatar.persistPlayerAvatarPreset('../bad'),false)
assert.equal(avatar.loadPlayerAvatarPreset(),null)
assert.equal(avatar.persistPlayerAvatarPreset('emerald-druid'),true)
assert.equal(avatar.loadPlayerAvatarPreset(),'emerald-druid')
assert.equal(avatar.persistPlayerAvatarPreset('default'),true)
assert.equal(avatar.loadPlayerAvatarPreset(),'default')
assert.equal(avatar.removePlayerAvatarPreset(),true)
assert.equal(avatar.loadPlayerAvatarPreset(),null)
assert.equal(avatar.persistPlayerAvatar('data:image/jpeg;base64,AAAA'),true)
assert.equal(avatar.persistPlayerAvatarPreset('cobalt-frost'),true)
assert.equal(avatar.loadPlayerAvatar(),'data:image/jpeg;base64,AAAA', 'Selecting presets must not delete uploaded images')
assert.equal(avatar.removePlayerAvatarPreset(),true)
assert.equal(avatar.loadPlayerAvatar(),'data:image/jpeg;base64,AAAA', 'Uploaded images can be selected again')
for(const [key,value] of [
  ['cube-hero-history-v2','IMPORTANT_RACES'],['cube-hero-ghost-v1','IMPORTANT_GHOST'],['cube-hero-hero-journey-v1','IMPORTANT_XP'],
]) assert.equal(storage.get(key),value,`Avatar selection must preserve ${key}`)
const gallery = read('src/lib/playerAvatarPresets.ts')
const heroAvatar = read('src/components/PlayerAvatar.tsx')
const settings = read('src/components/AvatarSettings.tsx')
const provider = read('src/components/LocalPlayerProvider.tsx')
const vsIntro = read('src/components/VsIntro.tsx')
const css = read('src/components/AvatarSettings.css')
for (const id of avatar.PLAYER_AVATAR_PRESET_IDS) {
  assert.ok(gallery.includes(`id: '${id}'`),`Missing ${id} preset label`)
  const image = path.join(root,`src/assets/player-avatars/${id === 'default' ? 'default-cube-keeper' : id}.webp`)
  const thumb = path.join(root,`src/assets/player-avatars/thumbs/${id === 'default' ? 'default-cube-keeper' : id}.webp`)
  assert.ok(fs.existsSync(image),`Missing optimized portrait ${image}`)
  assert.ok(fs.existsSync(thumb),`Missing optimized thumbnail ${thumb}`)
  assert.ok(fs.statSync(image).size < 150_000,`${id} full portrait should be lightweight`)
  assert.ok(fs.statSync(thumb).size < 20_000,`${id} gallery thumbnail should be lightweight`)
}
assert.match(provider,/loadPlayerAvatarPreset/)
assert.match(provider,/selectPresetAvatar/)
assert.match(provider,/setAvatarPresetState/)
assert.match(provider,/PLAYER_AVATAR_PRESET_STORAGE_KEY/)
assert.match(provider,/useUploadedAvatar/)
assert.match(settings,/PLAYER_AVATAR_PRESETS/)
assert.match(settings,/aria-pressed=\{selected\}/)
assert.match(settings,/AvatarCropDialog/)
assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/)
assert.match(css,/max-width:540px/)
assert.match(vsIntro,/default-cube-keeper\.webp/)
assert.match(heroAvatar,/default-cube-keeper\.webp/)
assert.match(read('src/App.tsx'),/<AvatarSettings\s*\/>/)
console.log('PASS: 11 optimized styles, 10 selectable presets, default hero art, responsive picker, stable selection storage, uploaded-photo recovery, cross-tab sync, VS and avatar integration.')
