import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'src/lib/siteRouting.ts'), 'utf8')
const cjs = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS}}).outputText
const sandbox = { exports: {} }
vm.runInNewContext(cjs, sandbox)
const { isGameLocation, GAME_START_URL } = sandbox.exports

assert.equal(GAME_START_URL, '/app#/home')
assert.equal(isGameLocation('/', ''), false, 'root must show landing page')
assert.equal(isGameLocation('/', '#features'), false, 'marketing anchors must show landing')
assert.equal(isGameLocation('/', '#faq'), false, 'FAQ anchors must show landing')
assert.equal(isGameLocation('/app', ''), true, 'app root must show game')
assert.equal(isGameLocation('/app/', '#/learn'), true, 'app trailing slash must show game')
assert.equal(isGameLocation('/app', '#/journey'), true, 'app deep links must show game')
assert.equal(isGameLocation('/', '#/home'), true, 'legacy home bookmarks must work')
assert.equal(isGameLocation('/', '#/race'), true, 'legacy race bookmarks must work')
assert.equal(isGameLocation('/', '#/practice'), true, 'legacy Ghost bookmarks must work')
assert.equal(isGameLocation('/', '#/journey'), true, 'legacy Journey bookmarks must work')
assert.equal(isGameLocation('/', '#/not-real'), false, 'unknown hashes must not start the game')
assert.equal(isGameLocation('/api', '#/race'), false, 'unrelated paths must not enter the game')

const landing = fs.readFileSync(path.join(root, 'src/components/LandingPage.tsx'), 'utf8')
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
const main = fs.readFileSync(path.join(root, 'src/main.tsx'), 'utf8')
assert.match(main, /lazy\(\(\) => import\('\.\/GameEntry'\)\)/, 'the game must be lazy-loaded')
assert.match(main, /lazy\(\(\) => import\('\.\/components\/LandingPage'\)\)/, 'landing must be lazy-loaded')
// First-time visitors must see the landing page before providing a player name.
assert.match(main, /showGame\s*\?\s*\(\s*<LocalPlayerProvider>\s*<GameEntry\s*\/>\s*<\/LocalPlayerProvider>\s*\)\s*:\s*<LandingPage\s*\/>/, 'the name gate must wrap only the game, never the landing page')
assert.equal((landing.match(/label: '(RACE AI|GHOST RACE|CUBE HERO ACADEMY|HERO JOURNEY)'/g) ?? []).length, 4)
assert.equal((landing.match(/question: '/g) ?? []).length, 5, 'FAQ needs 5 functional details')
assert.match(landing, /Coming soon/, 'no fake Android link')
assert.doesNotMatch(landing, /href="[^"]*\.apk"/, 'do not advertise nonexistent APK')
assert.match(index, /og:title/, 'landing should provide social metadata')
for (const asset of ['cube-hero-mascot-384.png','cube-hero-mascot-768.png','ghost-assassin-emblem.png']) {
 assert.ok(fs.existsSync(path.join(root, 'public', asset)), `missing landing asset ${asset}`)
}
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'))
assert.ok(config.rewrites.some(row => row.source === '/app' && row.destination === '/index.html'))
// Exercise the actual React entrypoint with a mocked renderer so the route-specific
// player-name gate cannot accidentally block the public homepage again.
const require = createRequire(import.meta.url)
const React = require('react')
const jsxRuntime = require('react/jsx-runtime')
const mainCjs = ts.transpileModule(main, {compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
}}).outputText
function PlayerGate() {}
function startupRoute(pathname, hash = '') {
  let rendered
  const mocks = name => {
    if (name === 'react') return React
    if (name === 'react/jsx-runtime') return jsxRuntime
    if (name === 'react-dom/client') return {createRoot: () => ({render(tree) {rendered = tree}})}
    if (name === './lib/siteRouting') return {isGameLocation}
    if (name === './components/LocalPlayerProvider') return {__esModule: true, default: PlayerGate}
    if (name === './localPlayer.css') return {}
    throw new Error(`Unexpected startup import: ${name}`)
  }
  const module = {exports: {}}
  new Function('require', 'module', 'exports', 'window', 'document', mainCjs)(
    mocks, module, module.exports,
    {location: {pathname, hash}},
    {getElementById: () => ({})},
  )
  return rendered.props.children.props.children
}
const homepage = startupRoute('/')
assert.equal(homepage.type.$$typeof, Symbol.for('react.lazy'), 'the public root must display the landing page without name setup')
const landingAnchor = startupRoute('/', '#features')
assert.equal(landingAnchor.type.$$typeof, Symbol.for('react.lazy'), 'landing-page anchors must stay public')
for (const [pathName, routeHash] of [['/app', '#/home'], ['/app', '#/race'], ['/', '#/race']]) {
  const game = startupRoute(pathName, routeHash)
  assert.equal(game.type, PlayerGate, `the game at ${pathName}${routeHash} must request a name if missing`)
  assert.equal(game.props.children.type.$$typeof, Symbol.for('react.lazy'), 'the game must remain lazy-loaded inside the name gate')
}
console.log('Landing entrypoint: anonymous visitors see landing first; /app asks for name: PASSED')
console.log('Landing page: homepage, /app routing, legacy bookmarks, asset references, CTAs, FAQ, Vercel rewrites: PASSED')
