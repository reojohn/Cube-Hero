/* First-visit username profile contract: no accounts, no database, keep race IDs unchanged. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { transpileModule, ModuleKind, ScriptTarget, JsxEmit } = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const compile = (relative, jsx = false) => transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
  compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022, jsx: jsx ? JsxEmit.ReactJSX : undefined },
}).outputText

const store = new Map([
  ['cube-hero-history-v2', '{"saved":"race"}'],
  ['cube-hero-ghost-v1', '{"saved":"ghost"}'],
  ['cube-hero-hero-journey-v1', '{"saved":"xp"}'],
])
const fakeLocalStorage = {
  getItem: key => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
}
const storage = { exports: {} }
new Function('window', 'require', 'module', 'exports', compile('src/lib/localPlayer.ts'))(
  { localStorage: fakeLocalStorage }, require, storage, storage.exports,
)
const { PLAYER_NAME_STORAGE_KEY, PLAYER_NAME_MAX_LENGTH, normalizePlayerName, loadPlayerName, isValidPlayerName, persistPlayerName } = storage.exports
assert.equal(PLAYER_NAME_MAX_LENGTH, 24)
assert.equal(loadPlayerName(), '', 'First visitor has no name')
assert.equal(normalizePlayerName('   Reo   John  '), 'Reo John')
assert.equal(normalizePlayerName(' A\n \u0000B '), 'A B')
assert.equal(isValidPlayerName('R'), false)
assert.equal(isValidPlayerName('Reo'), true)
assert.equal(normalizePlayerName('x'.repeat(27)), 'x'.repeat(24))
assert.equal(persistPlayerName(' Reo '), true)
assert.equal(loadPlayerName(), 'Reo')
assert.equal(store.size, 4)
assert.equal(store.get('cube-hero-history-v2'), '{"saved":"race"}', 'Race history is untouched')
assert.equal(store.get('cube-hero-ghost-v1'), '{"saved":"ghost"}', 'Ghost results are untouched')
assert.equal(store.get('cube-hero-hero-journey-v1'), '{"saved":"xp"}', 'XP is untouched')
assert.equal(store.get(PLAYER_NAME_STORAGE_KEY), 'Reo')
store.set(PLAYER_NAME_STORAGE_KEY, '   ')
assert.equal(loadPlayerName(), '', 'Invalid stored username reopens onboarding')

const welcome = { exports: {} }
const mockRequire = name => {
  if (name === '../lib/localPlayer') return storage.exports
  if (name === './PlayerWelcome.css') return {}
  return require(name)
}
new Function('require', 'module', 'exports', compile('src/components/PlayerWelcome.tsx', true))(
  mockRequire, welcome, welcome.exports,
)
const html = renderToStaticMarkup(React.createElement(welcome.exports.default, { onCreate() { return true } }))
assert.match(html, /Every hero/)
assert.match(html, /What should we call you\?/)
assert.match(html, /maxLength="24"/)
assert.match(html, /Start My Journey/)
assert.match(html, /No login or password/)
assert.match(html, /Saved on this device/)

const main = fs.readFileSync(path.join(root, 'src/main.tsx'), 'utf8')
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8')
const vs = fs.readFileSync(path.join(root, 'src/components/VsIntro.tsx'), 'utf8')
assert.match(main, /showGame\s*\?\s*\(\s*<LocalPlayerProvider>\s*<GameEntry\s*\/>\s*<\/LocalPlayerProvider>\s*\)\s*:\s*<LandingPage\s*\/>/, 'only the game entry requests a name; visitors see the landing page first')
assert.match(app, /<SettingsPage[^\n]*playerName=\{playerName\}/, 'Rename in Settings')
assert.match(app, /<VsIntro[\s\S]*?playerName=\{playerName\}/, 'Matchup uses local player name')
assert.match(vs, /title=\{playerName\}/, 'VS art displays player identity')
assert.match(app, /setVsPendingSession\(prepared\)/, 'Existing VS transition is preserved')
assert.doesNotMatch(main + app + vs, /\b(?:signInWithPassword|createUser|auth\.signIn)\b/i)
console.log('PASS: one-time username onboarding, local-only persistence, editable identity, VS display, untouched XP/races, no login.')
