# CubeHero — Mobile Racing Performance V5 (solid V4 turns preserved)

This is a **rendering-only** optimization for mobile AI and Ghost races. The
solid 3D cubelet geometry, CSS slice-turn animation, move durations, cube
colors, desktop display, stopwatches, race results, and player data are not
changed.

## Improvements

- Prepare the exact cube sticker snapshots for every AI/ghost move in one pass
  after the solution plan loads. The previous mobile renderer recomputed the
  scramble and the full prefix of moves on each live turn.
- Cache the 26 solid cubies for each snapshot; reuse object references for
  cubelets whose visible stickers are unchanged. This lets the existing
  `React.memo` cubelet component avoid unnecessary face DOM updates.
- Use binary search to locate the current move boundary without allocating an
  array on every lookup.
- Preserve the existing CSS-composited physical layer rotations, pre-existing
  mobile racing timer throttling, background catch-up behavior, and reduced-
  motion support.

## Verification

Run:

```bash
npm run typecheck
npm run test:mobile-cube
node scripts/test-mobile-race-performance.mjs
npm run build
```

The expanded mobile cube regression test compares **every cached move pose**
against the previous exact sticker model and verifies the same 26-cubie solid
geometry. The timing lookup is checked against the previous implementation.

A local Node benchmark of 84 move-boundary states on the development machine
showed about 19 ms for rebuilding all prefixes, versus about 0.6 ms for the
cached one-pass sticker sequence (about 1 ms including all solid cubies).
This is **not** a mobile FPS measurement: browser GPU costs and phone hardware
vary. Test a 1v1 AI race and Ghost duel on the target device after redeployment.
