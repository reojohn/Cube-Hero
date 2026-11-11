import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import vm from 'node:vm'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const read=file=>readFileSync(path.join(root,file),'utf8')
const config=JSON.parse(read('capacitor.config.json'))
assert.equal(config.webDir,'dist')
assert.equal(config.appName,'Cube Hero')
assert.match(config.appId,/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*){2,}$/)
assert.equal(config.server.androidScheme,'https')
assert.equal(config.server.url,undefined,'Do not ship an app that loads its UI from the internet')
assert.equal(config.server.cleartext,undefined,'Do not enable insecure HTTP')
const pkg=JSON.parse(read('package.json'))
const lock=JSON.parse(read('package-lock.json'))
assert.equal(pkg.scripts['android:setup'],'node scripts/setup-android.mjs')
assert.equal(pkg.scripts['android:sync'],'npm run build && npx --no-install cap sync android')
assert.equal(pkg.engines.node,lock.packages[''].engines.node)
assert.ok(existsSync(path.join(root,'src/workers/solver.worker.ts')))
const main=read('src/main.tsx')
assert.match(main,/isGameLocation\(window\.location\.pathname, window\.location\.hash\) \|\| isNativeApp\(\)/)
assert.match(main,/document\.documentElement\.classList\.add\('cube-native'\)/)
assert.match(read('src/App.tsx'),/listenForNativeBack/)
assert.match(read('src/lib/orientation.ts'),/nativeOrientationPlugin/)
assert.doesNotMatch(read('src/native-shell.css'),/cube-turn|cfop|\.cube-3d/)
const source=read('src/lib/nativePlatform.ts')
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText
const sandbox={exports:{},window:undefined}
vm.runInNewContext(js,sandbox)
assert.equal(sandbox.exports.isNativeApp(),false)
assert.equal(sandbox.exports.isNativeAndroid(),false)
sandbox.window={Capacitor:{getPlatform:()=> 'web',isNativePlatform:()=>false}}
assert.equal(sandbox.exports.isNativeApp(),false)
sandbox.window={Capacitor:{getPlatform:()=> 'android',isNativePlatform:()=>true}}
assert.equal(sandbox.exports.isNativeApp(),true)
assert.equal(sandbox.exports.isNativeAndroid(),true)
sandbox.window={Capacitor:{getPlatform:()=> 'ios',isNativePlatform:()=>true}}
assert.equal(sandbox.exports.isNativeApp(),true)
assert.equal(sandbox.exports.isNativeAndroid(),false)

// Regression: Capacitor listener handles are synchronous on some native bridges
// and Promise-based on others. The Android startup must support both.
const tick=()=>new Promise(resolve=>setImmediate(resolve))
const nativeApp=(appPlugin)=>({getPlatform:()=> 'android',isNativePlatform:()=>true,Plugins:{App:appPlugin}})

let syncBackCalls=0, syncRemovals=0
sandbox.window={Capacitor:nativeApp({
  addListener(event,handler){
    assert.equal(event,'backButton')
    handler()
    return {remove(){syncRemovals++}}
  },
  minimizeApp(){},
})}
const syncUnsubscribe=sandbox.exports.listenForNativeBack(()=>syncBackCalls++)
await tick()
assert.equal(syncBackCalls,1,'Synchronous addListener must not crash startup')
syncUnsubscribe()
await tick()
assert.equal(syncRemovals,1,'Synchronous handle must be removed on cleanup')
assert.doesNotThrow(()=>sandbox.exports.minimizeNativeApp(),'Synchronous minimize must be supported')

let asyncRemovals=0
sandbox.window={Capacitor:nativeApp({
  addListener(){return Promise.resolve({remove(){asyncRemovals++;return Promise.resolve()}})},
  minimizeApp(){return Promise.resolve()},
})}
const asyncUnsubscribe=sandbox.exports.listenForNativeBack(()=>{})
await tick()
asyncUnsubscribe()
await tick()
assert.equal(asyncRemovals,1,'Async listener must be removed on cleanup')

let lateResolve, lateRemovals=0
sandbox.window={Capacitor:nativeApp({
  addListener(){return new Promise(resolve=>{lateResolve=resolve})},
  minimizeApp(){return Promise.resolve()},
})}
const earlyUnsubscribe=sandbox.exports.listenForNativeBack(()=>{})
earlyUnsubscribe()
lateResolve({remove(){lateRemovals++;return Promise.resolve()}})
await tick()
assert.equal(lateRemovals,1,'Late registration must still be cleaned up')

sandbox.window={Capacitor:nativeApp({
  addListener(){throw new Error('No backButton bridge')},
  minimizeApp(){throw new Error('No native minimize bridge')},
})}
assert.doesNotThrow(()=>sandbox.exports.listenForNativeBack(()=>{}))
assert.doesNotThrow(()=>sandbox.exports.minimizeNativeApp())

sandbox.window={Capacitor:{getPlatform:()=> 'web',isNativePlatform:()=>false,Plugins:{App:{addListener(){throw new Error('Web must not register native back')}}}}}
assert.doesNotThrow(()=>sandbox.exports.listenForNativeBack(()=>{}) )
console.log('PASS: Capacitor Back listener synchronous / async / late cleanup and native errors do not crash startup.')

console.log('PASS: Native boots in arena, web landing remains isolated, offline bundle config, plugins + Android Back, orientation and safe area scaffolding.')
