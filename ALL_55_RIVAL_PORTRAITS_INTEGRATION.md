# Cube Hero — All 55 Rival Portraits Integrated

**Source of truth:** `CubeHero_Phase1(20261109-105753).zip` provided by the user.

## Changes
- Installed Batch 2 (Sub-26–45) and Batch 3 (Sub-46–60): 35 individual 512×512 RGBA PNGs.
- Created a matching lightweight WebP for each; first 20 PNG/WebPs are preserved unmodified.
- Registered all 55 Sub-levels in `src/lib/rivalPortraits.ts`.
- Reused the existing portrait glows, orbit effects, selected-card animations, WebP → PNG → SVG fallback and preloading.
- Kept the existing 1v1 and free-for-all VS intro logic and 5-second duration, and used illustration-matched glow palettes for later character groups.
- Updated character crest labels to match the new artwork (cosmetic only).
- Preserved local username, original character-name edits, Solo Timer, race records, Ghost Race, Hero Journey and level-up animations.
- Added a test for every portrait, alpha-channel PNG, WebP, asset dimensions, visual fallback, and 55-rival roster mappings.

### Color groups used for the new illustrations
- Sub-26–30: teal/cyan
- Sub-31–35: purple/violet
- Sub-36–39: blue
- Sub-40–60: warm orange/peach/coral

These reflect the supplied illustrations. `Legend / Master / Expert / Challenger / Rising` classifications and the AI time/difficulty rules **are not changed**.

### Rename safety
User-edited display names (such as `Reo` and `Jake`) remain in `src/lib/rivals.ts`. Portrait files remain keyed to the Sub level; changing a name does not break art mapping.

## Changed-file installation
Extract the changed-files ZIP into your live Cube Hero project folder, the directory containing `package.json`, `src`, `public`, and `scripts`. Allow overwriting the matching files and preserve directory structure.

### Run locally
```powershell
npm run typecheck
npm run test:phase2
npm run test:solo
npm run dev
```
Check Sub-26, Sub-35, Sub-39, Sub-40, Sub-45, Sub-46 and Sub-60 in Race AI, then open both 1v1 and 5-AI VS intros. Hard-refresh once after replacing assets.

### Verification
- Passed: TypeScript, `test:art` (55 PNG and WebP records), `test:phase2`, `test:vs`, `test:cfop`, `test:multi`, `test:solo`, `test:profile`, `test:ghost`, `test:journey`, `test:levelup`, `test:landing`.
- The existing AI prefetch test checks for a source string absent from the **uploaded original ZIP** and fails unchanged by this art-only work.
- Full production build was unavailable here because this environment lacks `@rollup/rollup-linux-x64-gnu`; run `npm run build` on your development machine.

The PNGs are transparent crops from the approved generated character sheets, not separate high-resolution individual renders.
