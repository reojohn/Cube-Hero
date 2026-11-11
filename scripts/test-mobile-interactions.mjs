import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const app = readFileSync('src/App.tsx', 'utf8')
const room = readFileSync('src/components/RaceRoom.tsx', 'utf8')
const css = readFileSync('src/mobile-performance.css', 'utf8')

assert.match(room, /className="btn btn-outline btn-sm scramble-new-button"/, 'New Scramble must have a dedicated mobile layout hook')
assert.match(room, /<InspectReadyButton[\s\S]*?onClick=\{session\.settings\.inspection\?startInspection:markReady\}/, 'Inspect behavior must remain unchanged')
assert.match(css, /@media \(orientation:portrait\) and \(max-width:740px\)/, 'Portrait-only CTA layout expected')
assert.match(css, /\.scramble-actions\s*\{\s*display:grid;/, 'CTA controls must be independently sized on portrait')
assert.match(css, /\.scramble-actions\s*>\s*\.scramble-new-button/, 'New Scramble button must be full width on portrait')
assert.match(css, /\.scramble-actions\s*>\s*\.inspect-cta-wrap/, 'Inspect wrapper must fit on portrait')
assert.match(css, /html\s*\{\s*scroll-behavior:auto\s*!important/, 'Avoid smooth route scrolling on mobile')
assert.match(css, /touch-action:manipulation/, 'Mobile buttons must respond to direct taps')
assert.match(app, /window\.scrollTo\(\{top:0,behavior:'instant'\}\)/, 'Route changes should scroll instantly')
assert.match(app, /window\.addEventListener\(JOURNEY_UPDATED_EVENT,sync\)/, 'Journey source events must remain connected')
assert.match(app, /\},\[history\]\)/, 'Navigation should not resynchronize saved Hero Journey history on each page visit')
assert.doesNotMatch(app, /\},\[history,page\]\)/, 'Removed redundant sync dependency must stay removed')
console.log('PASS: mobile New Scramble layout, responsive touch feedback, immediate navigation scroll, and event-driven Hero Journey synchronization.')
