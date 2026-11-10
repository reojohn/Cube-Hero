import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const helper = readFileSync('src/lib/orientation.ts', 'utf8')
const css = readFileSync('src/mobile-landscape.css', 'utf8')
const source = readFileSync('src/App.tsx', 'utf8')
const entry = readFileSync('src/GameEntry.tsx', 'utf8')
assert.match(source, /orientation:'auto'/)
assert.match(source, /orientationPreference\(preferences\.orientation\)/)
assert.match(source, /chooseOrientation\(id\)/)
assert.match(source, /requestOrientationPreference\(choice\)/)
assert.match(source, /Mobile Orientation/)
assert.match(entry, /mobile-landscape\.css/)
assert.match(css, /@media \(orientation:landscape\) and \(max-height:620px\) and \(max-width:1180px\)/)
assert.doesNotMatch(css, /@media[^\{]*\(pointer:coarse\)/, 'Landscape must not rely on pointer type detection')
assert.match(css, /--ch-landscape-rail/)
assert.match(css, /\.cube-mobile-dock \{ display:none!important; \}/)
for (const selector of ['.cube-mobile-dock','.sidebar.open','.ch-ai-hero-core','.ghost-arena','.solo-timer-pad','.solo-section-toggle','.racer-grid','.academy-lesson-layout','.journey-stats-grid','.personality-option']) {
  assert.ok(css.includes(selector), `Missing landscape override: ${selector}`)
}
assert.doesNotMatch(css, /rotate\(90deg\)|rotate\(-90deg\)/)

// Landscape-specific regression guards for the roster, navigation, and 4-card rows.
// These must override the normal max-width:720px portrait selectors.
assert.match(css, /\.ch-home-feature-grid,\.app-shell \.feature-grid \{grid-template-columns:repeat\(4,/)
assert.match(css, /\.academy-case-counts \{display:grid;grid-template-columns:repeat\(4,/)
assert.match(css, /\.rival-preview-details \{display:contents;\}/)
assert.match(css, /\.rival-preview-bottom \{grid-column:1 \/ -1;/)
assert.match(css, /\.rival-roster-scroll \{height:166px;/)
assert.match(css, /\.rival-quick-picks \{margin-top:5px;/)
assert.match(css, /order:0; \/\* Portrait CSS places preview first/)
assert.match(css, /overflow:hidden; overscroll-behavior:none; scrollbar-width:none;/)

// Landscape rail must be toggleable without changing the portrait drawer.
assert.match(source, /landscapeRailOpen,setLandscapeRailOpen/)
assert.match(source, /aria-expanded=\{!landscapeRailCollapsed\}/)
assert.match(source, /inert=\{landscapeRailCollapsed\}/)
assert.match(source, /landscape-nav-collapsed/)
assert.match(css, /\.app-shell\.landscape-nav-collapsed \.sidebar/)
assert.match(css, /\.app-shell\.landscape-nav-collapsed \.main-wrap/)
assert.match(css, /\.app-shell\.landscape-nav-collapsed \.main-content/)
assert.match(css, /\.app-shell \.landscape-nav-toggle/)
assert.match(css, /min-height:37px/)

// Run the TS helper directly after a dependency-free transpilation to test
// capability fallbacks, native lock and unlock, and invalid persisted values.
const directory = mkdtempSync(join(tmpdir(), 'cube-orient-'))
try {
  const output = ts.transpileModule(helper, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}})
  const filename = join(directory, 'orientation.mjs')
  writeFileSync(filename, output.outputText)
  const mod = await import(pathToFileURL(filename).href)
  for (const input of [undefined,null,23,'other','horizontal']) assert.equal(mod.orientationPreference(input),'auto')
  for (const input of ['portrait','landscape','auto']) assert.equal(mod.orientationPreference(input),input)
  assert.equal(mod.canRequestOrientationLock(),false)
  assert.equal(await mod.requestOrientationPreference('landscape'),'manual')
  let lastLock = '', unlocked = false
  globalThis.screen = {orientation:{lock: async key => {lastLock=key},unlock:()=>{unlocked=true}}}
  assert.equal(mod.canRequestOrientationLock(),true)
  assert.equal(await mod.requestOrientationPreference('landscape'),'locked')
  assert.equal(lastLock,'landscape-primary')
  assert.equal(await mod.requestOrientationPreference('portrait'),'locked')
  assert.equal(lastLock,'portrait-primary')
  assert.equal(await mod.requestOrientationPreference('auto'),'auto')
  assert.equal(unlocked,true)
  globalThis.screen = {orientation:{lock: async()=>{throw Error('not permitted')}}}
  assert.equal(await mod.requestOrientationPreference('landscape'),'manual')
  console.log('PASS: persistent Auto/Portrait/Landscape UI, compact desktop-style landscape layout, native lock/unlock and browser fallback')
} finally {
  delete globalThis.screen
  rmSync(directory,{recursive:true,force:true})
}
