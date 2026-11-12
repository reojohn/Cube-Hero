import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const read = name => fs.readFileSync(name, 'utf8')
const app = read('src/App.tsx')
const modal = read('src/components/ConfirmationModal.tsx')
const modalStyle = read('src/components/ConfirmationModal.css')
const preview = read('src/components/GraphicsCubePreview.tsx')
const style = read('src/graphics-quality.css')
const ghost = read('src/components/GhostResetModal.tsx')
const solo = read('src/components/SoloTimer.tsx')
const stats = read('src/components/RaceStatistics.tsx')

assert.match(preview, /svg className="ch-graphics-preview-cube"/, 'previews use small static SVGs')
assert.match(preview, /cubeColors\[face.name\]/, 'all visible cube faces have actual color tiles')
assert.doesNotMatch(preview, /requestAnimationFrame|setInterval|AiCube3D|MediumRaceCube/, 'preview does not run a race renderer')
assert.match(app, /<GraphicsCubePreview quality=\{option.value\}/, 'preview shown for each graphics setting')
assert.match(app, /Recommended for Android/, 'Medium is recommended for Android')
assert.match(app, /Recommended for Desktop/, 'High is recommended for Desktop')
assert.match(style, /@media\(hover:hover\) and \(pointer:fine\)/, 'hover animations are limited to fine-pointer devices')
assert.match(style, /prefers-reduced-motion/, 'reduced motion is respected')
assert.match(app, /defaultGraphicsPreference\(\)/, 'preserves mobile/desktop smart defaults')
assert.match(app, /const \[preferences,setPreferences\]=useSavedState\(/, 'saved user settings are respected')

for (const [label, text] of [['App', app], ['Ghost Race', ghost], ['Solo Timer', solo], ['Statistics', stats]]) {
  assert.match(text, /ConfirmationModal/, `${label} uses the shared premium confirmation`)
}
assert.match(modal, /createPortal\(/, 'modal overlays the dock through a portal')
assert.match(modal, /role="alertdialog"/, 'modal provides alertdialog semantics')
assert.match(modal, /aria-modal="true"/, 'modal is announced as modal')
assert.match(modal, /event.key === 'Escape'/, 'Escape closes without performing destructive action')
assert.match(modal, /event.key !== 'Tab'/, 'focus trap supports keyboard navigation')
assert.match(modal, /previousFocus\.focus/, 'focus returns to the action initiator')
assert.match(ghost, /qualifyingSolves/, 'Ghost Reset retains qualifying solve details')
assert.match(ghost, /duels/, 'Ghost Reset retains race history summary')
assert.match(solo, /confirmDeleteLastSolve/, 'undo last solve uses confirmation')
assert.match(solo, /confirmClear&&<ConfirmationModal/, 'clear solo history uses confirmation')
assert.match(stats, /confirmSoloClear&&<ConfirmationModal/, 'Statistics uses confirmation')
assert.match(app, /if \(confirmState\) \{ setConfirmState\(null\); return \}/, 'Android back dismisses the confirmation')
assert.match(modalStyle, /max-height: calc\(100dvh - 24px\)/, 'modal supports compact phone screens')

const srcRoot = 'src'
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(item =>
  item.isDirectory() ? walk(path.join(d,item.name)) : [path.join(d,item.name)])
for (const file of walk(srcRoot).filter(name => /\.(?:tsx|ts|jsx|js)$/.test(name))) {
  const text = read(file)
  assert.doesNotMatch(text, /(?:window\.)?confirm\s*\(/, `native confirm remains in ${file}`)
}
console.log('PASS: Static graphics previews, Android/Desktop labels, hover accessibility, and all premium confirmations.')
