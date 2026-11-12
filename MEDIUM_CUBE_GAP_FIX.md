# CubeHero — Medium 3D cube black-cavity fix

## Root cause

The lightweight Medium renderer previously hid sticker squares on the static
cube while their layer rotated. Only the active moving cubies were rendered in
3D, so hiding the backing exposed the dark face material and empty space inside
the cube. Removing the cubies' uncolored filler faces did not remove those holes.

## What changed

- Keep all 54 sticker squares on a simple six-sided cube backing, even during a turn.
- Recess the backing 1px so moving stickers don't conflict with the background stickers.
- Use a tiny six-face colored core, sized to the 3x3's otherwise-empty center cell,
  to prevent a view through the center without clipping middle-layer turns.
- Use the cube's current verified face state for both backing and core colors.
- Keep the real 3D moving-slice animation continuous and CSS-driven.
- Keep Low and High unchanged and do not change AI plans, race timing, or records.

The backing is intentionally lightweight, but it can briefly show the underlying
sticker pattern as the active layer turns. This is a performance tradeoff that
prevents the former dark openings without rebuilding High's 26-piece geometry.

## Files edited

- `src/components/MediumRaceCube.tsx`
- `src/lib/mediumCubeGeometry.ts`
- `src/graphics-quality.css`
- `scripts/test-graphics-quality.mjs`

## Checks

TypeScript, graphics, mobile cube, CFOP, Ghost Race, multi-AI, and Capacitor
logic tests passed. Android visual testing remains necessary. The uploaded
project's Windows-only native Rollup packages prevent production builds in
this Linux environment; build and sync on Windows as normal.

## Update Android

1. Extract the changed-files ZIP into the existing `CubeHero_Phase1` folder,
   preserving the folder tree and overwriting matching files.
2. From the project root on Windows, run `npm run android:sync`.
3. Run `cd android` then `.\gradlew.bat assembleDebug`.
4. Install the new `app-debug.apk` and test Medium through R, U, F, M, and wide turns.
