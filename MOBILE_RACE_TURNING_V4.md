# CubeHero — Mobile Solid Physical Cube Turns (V4)

## Why this update

V3 animated one slice of 3D stickers over flat 3x3 face planes. Mid-turn, the
rotating pieces exposed holes and black areas in the flat plane because the
plastic sides of the cubelets were missing. That did not match the solid cube
seen in the original desktop renderer.

## New mobile visual strategy

- Use the **same full 26-cubie physical geometry** as the desktop renderer,
  including all six opaque plastic faces on each piece. Sticker colors and
  piece positions come from the same verified CFOP `cubeFacesAt` model.
- Physically rotate only the cubies within the current move's layer. The
  stationary cubelets remain fully rendered so no sticker face is cut away.
- The turning layer is animated using **one browser-composited CSS transform**,
  with no per-frame React animation or 3D scene rebuild. React wakes only at
  real planned move boundaries. A delayed wake catches up to `performance.now()`
  without changing AI or Ghost solve times.
- On phones, omit the desktop's bobbing motion, blur filters and heavy shadows
  on each sticker to limit GPU work. Respect OS/user reduced motion.
- Desktop 3D, multi-AI extra timer cards, Solo Timer, AI results, and Ghost
  personal best data are unaffected.

This prioritizes solid desktop-quality movement over V3's 27-plane-sticker
shortcut. It renders more plastic surfaces than V3, but considerably less
frequently than the former 33-Hz desktop-style React animation loop.

## Validate on Windows before redeploying

```bash
npm run typecheck
npm run test:mobile-cube
node scripts/test-mobile-race-performance.mjs
npm run test:multi
npm run test:ghost
npm run build
```

Test 1v1 AI and a personal Ghost duel on the same phone. FPS cannot be
confirmed from code alone; check real-device responsiveness.
