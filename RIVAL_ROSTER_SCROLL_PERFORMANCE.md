# Cube Hero — Rival Roster Smooth-Scroll Optimization

The Race AI rival selector still contains all 55 original, colorful opponents. This update changes image delivery and component rendering only; AI times, VS screens, Solo Timer, Hero Journey and saved progress remain unchanged.

## Changes
- Added 55 dedicated 160 × 160 WebP thumbnails in `public/rivals/thumbs/` for the small roster cards (0.72 MB total).
- Preserved all original 512 × 512 full-quality WebPs and transparent PNGs for the featured character and VS screens.
- Thumbnail loading fallback: 160px WebP → full 512px WebP → original PNG → code-drawn SVG.
- `RivalRosterCard` is memoized, with stable selection callbacks. Selecting a rival no longer asks React to re-render all unchanged roster cards.
- Stopped pre-decoding all 55 full-resolution portraits at once; only the currently selected large portrait is prewarmed.
- Isolated card painting using CSS containment and removed costly `drop-shadow()` / blur filters from the tiny thumbnails. Featured artwork retains its full effects.
- Kept the eager loading behavior for the lightweight thumbnails and existing mobile roster height/layout.

## Testing
Passed: `npm run typecheck`, `npm run test:roster-perf`, `npm run test:phase2`, `npm run test:multi`, `npm run test:ghost`, `npm run test:cfop`, `npm run test:solo`, `npm run test:profile`, `npm run test:journey`, `npm run test:levelup`, `npm run test:landing`.

The current container's Windows-only optional Rollup dependency prevents a full production build and browser screenshot check here. Confirm scrolling on your own device after replacing the files.

## Install
Extract `CubeHero_Rival_Roster_Smooth_Scroll_Changed_Files.zip` directly into the root folder containing `package.json`; keep the `src/`, `public/`, and `scripts/` folder structure. Run `npm run test:roster-perf` and `npm run dev` on your machine.
