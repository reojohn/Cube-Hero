/** Shared audio engine/entrypoint regression without a browser or external sound assets. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { transpileModule, ModuleKind, ScriptTarget } = require('typescript')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const source = read('src/lib/gameAudio.ts')
const js = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 } }).outputText
let instances = 0
let starts = 0
let resumes = 0
let scheduled = 0
let compressors = 0
const gains = []
class Param {
  value = 0
  setTargetAtTime(v) {this.value = v}
  setValueAtTime(v) {this.value = v}
  exponentialRampToValueAtTime(v) {this.value = v}
}
class FakeOsc {
  frequency = new Param()
  type = 'sine'
  connect(node) {return node}
  disconnect() {}
  start(at) {assert.ok(at >= 0);starts++}
  stop(at) {assert.ok(at > 0);scheduled++}
}
class FakeGain {
  gain = new Param()
  constructor() {gains.push(this)}
  connect(node) {return node}
  disconnect() {}
}
class FakeCompressor {
  threshold = new Param()
  knee = new Param()
  ratio = new Param()
  attack = new Param()
  release = new Param()
  constructor() {compressors++}
  connect(node) {return node}
}
class AudioContext {
  constructor() { instances++ }
  state = 'suspended'
  currentTime = 0
  destination = {}
  createOscillator() {return new FakeOsc()}
  createGain() {return new FakeGain()}
  createDynamicsCompressor() {return new FakeCompressor()}
  resume() {this.state='running';resumes++;return Promise.resolve()}
}
const module = {exports:{}}
new Function('window','module','exports',js)({AudioContext},module,module.exports)
const {configureGameAudio,unlockGameAudio,playGameSound} = module.exports
playGameSound('start')
assert.equal(instances,0,'Muted must not create an AudioContext')
configureGameAudio({enabled:true,volume:55,cinematic:true,timer:true})
unlockGameAudio()
assert.equal(instances,1,'First user gesture unlocks exactly one audio engine')
assert.equal(resumes,1)
assert.equal(compressors,1,'Create a single peak compressor to protect louder mobile cues')
assert.ok(Math.abs(gains[0].gain.value-.55*1.4)<0.001,'Initial 55% setting must use the boosted mix')
for(const cue of ['preview','vs','inspect','arm','ready','start','stop','countdown','opponentFinish','victory','loss','personalBest','ghostFinish']) playGameSound(cue)
assert.equal(instances,1,'Every cue reuses the same audio engine')
assert.ok(starts >= 22 && scheduled===starts,'All cues schedule short audio nodes')
configureGameAudio({enabled:true,cinematic:false,timer:false})
const before=starts
for(const cue of ['vs','inspect','arm','ready','start','stop','countdown']) playGameSound(cue)
assert.equal(starts,before,'Cinematic and timer category toggles mute their cues')
playGameSound('victory')
assert.ok(starts>before,'Outcome sounds still play with timer and VS toggles off')
configureGameAudio({enabled:true,volume:0})
const after=starts
playGameSound('victory')
assert.equal(starts,after,'Volume zero is silent')
configureGameAudio({enabled:false,volume:100})
playGameSound('preview')
assert.equal(starts,after,'Master mute silences every cue')

const app=read('src/App.tsx')
const room=read('src/components/RaceRoom.tsx')
const ghost=read('src/components/GhostRace.tsx')
const solo=read('src/components/SoloTimer.tsx')
const vs=read('src/components/VsIntro.tsx')
assert.match(app,/useSavedState\('cube-hero-preferences-v1',initialPreferences\)/,'Keep existing settings/localStorage key')
for(const part of ['soundVolume','cinematicSounds','timerSounds','Test sound','unlockGameAudio','configureGameAudio']) assert.ok(app.includes(part),`Missing settings control: ${part}`)
for(const [name, component] of [['Race AI',room],['Ghost',ghost],['Solo',solo]]){
  for (const cue of ['inspect','arm','ready','start','stop','countdown']) assert.ok(component.includes(`playGameSound('${cue}')`),`${name} missing ${cue} cue`)
  assert.doesNotMatch(component,/new AudioContext\(/,`${name} must not create a new AudioContext per beep`)
}
assert.match(room,/playGameSound\('opponentFinish'\)/)
assert.match(ghost,/playGameSound\('opponentFinish'\)/)
assert.match(solo,/playGameSound\('personalBest',\.18\)/)
assert.doesNotMatch(vs,/playGameSound\('vs'\)/, 'VS intro must remain silent')
assert.doesNotMatch(vs,/new Context\(/, 'VS should reuse the global sound engine')
assert.match(source, /const MASTER_GAIN = 1\.4/, 'Boosted game cues should be louder than the previous 0.65 mix')
assert.match(source, /createDynamicsCompressor/, 'Use Web Audio peak protection to avoid digital clipping with louder cues')
assert.doesNotMatch(source,/setInterval\(/, 'Sound manager must never poll continuously')
assert.doesNotMatch(source,/fetch\(/, 'Sound manager must not download audio')
const gameEntry=read('src/GameEntry.tsx')
const volumeCss=read('src/settings-audio.css')
assert.ok(gameEntry.includes("import './settings-audio.css'"), 'new audio layout must be included in the game')
assert.ok(gameEntry.indexOf("import './settings-audio.css'")>gameEntry.indexOf("import './mobile-performance.css'"), 'audio layout must be imported after mobile theme overrides')
for (const fragment of ['.ch-audio-volume-row output','.ch-audio-volume-slider::-webkit-slider-thumb','.ch-audio-volume-ends','width: 100%'])
  assert.ok(volumeCss.includes(fragment),`audio layout must preserve ${fragment}`)

console.log('PASS: shared WebAudio, mute, volume, categories, no per-cue contexts, mobile unlock, all key race events, local settings and no recurring audio polling')
