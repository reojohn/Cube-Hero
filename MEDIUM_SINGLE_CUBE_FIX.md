# CubeHero — Medium Graphics: Single Physical Cube Fix

## What changed

- Removed the permanent six-face backing cube and the separate recessed center core from Medium graphics. They were visible while the active slice rotated and gave the appearance of two merged cubes.
- Medium now renders **one** 26-position physical cube. For each move, the moving cubies are excluded from the stationary set and animated as one smooth CSS-composited layer.
- Only the **54 real exterior colored sticker faces** are drawn across those pieces. No dark filler faces are generated. This remains substantially lighter than High's complete 156-face cubie rendering plus sticker elements.
- Preserved the high-resolution race clock and the existing no-per-frame-React-update approach. Low and High renderers are unchanged.
- Renamed the lower Race AI button to **Change Graphics Settings**, and made it open the actual Settings page. Navigating away during a live round still uses the existing confirmation prompt, and an unfinished round is not recorded.

## Verification

`npm run typecheck`, `npm run test:graphics`, `npm run test:mobile-cube`, `npm run test:cfop`, `npm run test:ghost`, `npm run test:multi`, and `npm run test:capacitor` passed in the available test environment. The graphics test checks for a unique 26-cubie partition with all 54 sticker faces and the absence of duplicate backing.

The full Vite build could not run in this Linux environment because the uploaded `node_modules` dependency tree lacks Rollup's Linux native optional package. Build and test the Android APK in the usual Windows project environment.

## Installation

Merge the changed files under `CubeHero_Phase1/` into the matching source folder in your existing project (preserve relative paths), or use the full source ZIP. Do not overwrite your personal local storage or app data.
