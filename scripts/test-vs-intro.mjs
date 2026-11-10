/* Phase 2 polish: VS splash must be data-driven and gate RaceRoom startup. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { loadTestModules } from './ts-test-loader.mjs'
const require = createRequire(import.meta.url)
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { transpileModule, ModuleKind, JsxEmit, ScriptTarget } = require('typescript')
const dir = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(dir, '../src/components/VsIntro.tsx'), 'utf8')
const app = fs.readFileSync(path.join(dir, '../src/App.tsx'), 'utf8')
const { AI_RIVALS, getRival } = await loadTestModules()('rivals')
const js = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX, target: ScriptTarget.ES2022 } }).outputText
const mod = { exports: {} }
const customRequire = name => {
  if (name === '../lib/racing') return { getAiCount: n => Math.max(1, Math.min(10, n || 1)) }
  if (name === '../lib/rivals') return { getRival, AI_RIVALS }
  if (name === '../lib/rivalPortraits') return { prewarmRivalPortraits: () => {}, getRivalPortraitTheme: (_difficulty, accent, glow) => ({ '--rival-accent': accent, '--rival-glow': glow }) }
  if (name === './RivalPortrait') return { __esModule: true, default: ({ rival }) => React.createElement('img', { src: `/rivals/Sub-${rival.difficulty}.webp`, alt: '' }) }
  if (name === '../assets/player-avatar.png') return { __esModule: true, default: '/player-avatar.png' }
  if (name === './VsIntro.css') return {}
  return require(name)
}
new Function('require', 'module', 'exports', js)(customRequire, mod, mod.exports)
const { default: VsIntro, VS_INTRO_DURATION_MS, VS_INTRO_REDUCED_DURATION_MS } = mod.exports
assert.equal(VS_INTRO_DURATION_MS, 5000, "Standard VS intro should last exactly 5 seconds")
assert.equal(VS_INTRO_REDUCED_DURATION_MS, 1100, "Reduced-motion duration should stay short")
const vsCss = fs.readFileSync(path.join(dir, '../src/components/VsIntro.css'), 'utf8')
assert.match(vsCss, /animation:vs-timeline 5s linear both/, "Progress bar should match the intro duration")
assert.equal(AI_RIVALS.length, 55)
for (const rival of AI_RIVALS) {
  const settings = { difficulty: rival.difficulty, personality: 'balanced', aiCount: 1 }
  const html = renderToStaticMarkup(React.createElement(VsIntro, { settings, sound: false, reducedMotion: true, onEnterArena() {}, onBack() {} }))
  assert.ok(html.includes(`${rival.name}</h2>`), `Rival display should use ${rival.name}`)
  assert.ok(html.includes(`SUB-${rival.difficulty}`), `Sub-level for ${rival.name}`)
  assert.ok(html.includes(`${rival.division.toUpperCase()} DIVISION`), `Division for ${rival.name}`)
  assert.ok(html.includes(rival.motto), `Motto for ${rival.name}`)
  assert.ok(html.includes('Enter arena now'))
  assert.ok(html.includes('Back to setup'))
  assert.match(html, /role="dialog"/)
  assert.match(html, /aria-modal="true"/)
}

// All opponents are separate competitors, not a single opposing "team".
// Verify the exact on-screen chain and individual cards for 2 through 10 AIs.
for (const count of [2,3,4,5,6,7,8,9,10]) {
  for (const difficulty of ['6','14','20','26','40','60']) {
    const settings = { difficulty, personality: 'balanced', aiCount: count }
    const html = renderToStaticMarkup(React.createElement(VsIntro, { settings, sound: false, reducedMotion: false, onEnterArena() {}, onBack() {} }))
    assert.ok(html.includes('FREE-FOR-ALL TOURNAMENT'), 'Multi-AI gets a distinct free-for-all presentation')
    assert.ok(html.includes('Every racer'), 'Free-for-all header is present')
    assert.ok(html.includes('Every</span>') && html.includes('racer</span>') && html.includes('themselves.</span>'), 'Each headline word has its own spacing box')
    assert.ok(html.includes('aria-label="Every racer for themselves."'), 'Headline has a natural spoken label')
    assert.ok(html.includes('NO ALLIES'), 'No allies wording is present')
    assert.ok(html.includes(`${count} independent AI opponents`), 'Correct total opponents')
    assert.equal((html.match(/class="cube-vs-contender cube-vs-contender--ai"/g) || []).length, count, 'A separate AI card per opponent')
    assert.equal((html.match(/class="cube-vs-contender cube-vs-contender--player"/g) || []).length, 1, 'Exactly one player card')
    assert.equal((html.match(/class="cube-vs-contender-separator"/g) || []).length, count, 'Desktop retains VS inside every AI card')
    const visibleLandscapeBadges = count - (count + 1 > 6 ? 1 : 0)
    assert.equal((html.match(/class="cube-vs-lineup-label"/g) || []).length, visibleLandscapeBadges, 'Landscape foreground overlays exclude only the first card in a new row')
    assert.equal((html.match(/class="cube-vs-tournament-chain"/g) || []).length, 1, 'One matchup chain')
    for (let i = 1; i <= count; i++) {
      assert.ok(html.includes(`OPPONENT ${String(i).padStart(2, '0')}`), `AI ${i} identified as independent rival`)
      assert.ok(html.includes(`>AI ${i}</strong>`), `AI ${i} shown by name`)
    }
    assert.ok(!html.includes('FEATURED:'), 'No multi-AI featured-opponent/team representation')
    assert.ok(html.includes('Back to setup') && html.includes('Enter arena now'), 'Controls preserved')
    const landscapeRacers = count + 1
    const landscapeColumns = landscapeRacers <= 6 ? landscapeRacers : Math.ceil(landscapeRacers / 2)
    assert.ok(html.includes(`--vs-landscape-columns:${landscapeColumns}`), 'Landscape matchup uses count-aware columns')
    assert.ok(html.includes(`--vs-landscape-rows:${landscapeRacers <= 6 ? 1 : 2}`), 'Landscape lineup has at most two rows')
  }
}
assert.ok(app.includes('setVsPendingSession(prepared)'), 'Start Race should prepare a session but not mount RaceRoom')
assert.ok(app.includes('setSession(prepared)'), 'Only after intro does the prepared session become active')
assert.ok(app.includes("goTo('room')"), 'Completion navigates to RaceRoom')
assert.ok(app.includes('<VsIntro'), 'VS intro is mounted in App')
assert.match(vsCss, /@media \(orientation: landscape\) and \(max-height: 620px\)/, 'Compact landscape intro has a dedicated viewport media query')
assert.match(vsCss, /grid-template-columns: repeat\(var\(--vs-landscape-columns/, 'Landscape grid uses per-race dynamic column count')
assert.match(vsCss, /grid-template-rows: repeat\(var\(--vs-landscape-rows/, 'Landscape grid uses per-race dynamic row count')
assert.match(vsCss, /\.cube-vs-lineup-labels \{[\s\S]*?z-index: 100;/, 'Landscape VS badges form their own foreground layer')
assert.match(vsCss, /\.cube-vs-lineup-label \{[\s\S]*?transform: translateX\(-50%\) rotate\(-8deg\);/, 'VS badges remain centered even when animations are disabled')
assert.match(vsCss, /\.cube-vs-contender-separator \{ display: none; \}/, 'Landscape hides the old clipped card-contained labels')
assert.match(vsCss, /\.cube-vs-tournament-summary,\s*\.cube-vs-intro--dense \.cube-vs-tournament-summary \{ display: none !important; \}/, 'Landscape removes the duplicate top chain, preserving desktop hierarchy')
assert.ok(vsCss.includes('height: 100dvh') && vsCss.includes('overflow: hidden'), 'Landscape VS stage remains viewport-bounded and non-scrolling')
assert.ok(source.includes('prefers-reduced-motion: reduce'), 'Respect OS motion setting')
assert.ok(source.includes('skipButtonRef.current?.focus()'), 'Focus the enter control')
console.log('PASS: 1v1 VS intros for 55 rivals and individual YOU vs AI1 vs AI2... vs AI10 free-for-all intros; controls, reduced-motion and delayed race entry.')
