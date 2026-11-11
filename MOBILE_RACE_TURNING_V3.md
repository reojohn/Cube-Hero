# CubeHero — Mobile Physical Cube Turns (Optimized V3)

This change restores visible physical face/slice turns in **Race AI** and **Ghost Race** on low-end smartphones without reverting to the original 26-cubie, continuously React-rendered model.

## What changes

- The featured AI / Ghost opponent cube continues to show only three static faces (27 sticker squares).
- Each **actual verified CFOP move** animates a *small moving 3D slice* of typically nine cubies, instead of animating all 26 cubies.
- One CSS transform animates the selected slice. React updates only at verified move boundaries, not every animation frame.
- The move direction and duration match the exact race plan. A late frame skips ahead to the accurate solution state rather than slowing the opponent timer.
- The desktop/full 3D renderer, AI pacing, competitive results, other mobile opponents' lightweight timer cards, and the Solo Timer are unchanged.
- If a user enables Reduce Animations or an OS reduced-motion setting, the cube uses static move-by-move sticker updates without a temporary blank slice.

## Local verification

```bash
npm run typecheck
npm run test:mobile-cube
node scripts/test-mobile-race-performance.mjs
npm run test:multi
npm run test:ghost
npm run build
```

The CSS transform has been inspected in Chromium and cube-turn/sticker invariants are tested, but FPS and smoothness require evaluation on the real low-spec phone. React rendering work will increase somewhat compared with the V2 color-switching cube, because physical slice nodes must be mounted once per move. It is still much lighter than the original full-cube renderer.

## Deployment

Apply changed files at the repository root (next to `package.json`), run the checks above on your computer, then commit/push to GitHub. Vercel will redeploy from `main`.
