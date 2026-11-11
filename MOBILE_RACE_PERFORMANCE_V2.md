# CubeHero — Low-End Phone Race Performance (v2)

## Why this update exists
Solo Timer and Ghost qualifying solves use almost no animated opponent visuals. AI races and real Ghost duels previously used a physically turning cube built from 26 cubelets (six faces per cubelet), plus a React arena update about every 90 ms on mobile. Some phones could not sustain both workloads smoothly.

## Isolated changes
- **Mobile featured cube:** During live Race AI and Ghost duels, the visible featured cube switches to a lightweight *three-face sticker cube* using 27 sticker tiles. The visible stickers are calculated with `cubeFacesAt` from the **same verified scramble and CFOP move list**, based on `performance.now()` elapsed time. Its movement is discrete (the stickers advance by move) rather than the original smoothly rotating physical layers, trading visual detail for much lower draw cost. The full physical 3D turning cube remains on desktop, Academy, and replay.
- **Independent animation:** The mobile cube updates at most every 160 ms in a memoized component; parent race re-renders do not rebuild it. When the race isn't started it shows the verified scrambled state.
- **Race-page updates:** Mobile AI/Ghost running and waiting UI re-renders every ~240 ms instead of 90 ms. Inspection and Stackmat hold feedback keep the existing ~90 ms rate. Official result timing and tap/keyboard stopping still use `performance.now()`; the main visible timer still updates independently about every 45 ms.
- **Static scramble instructions:** Beginner arrow guides are memoized; they don't rebuild their 25 moves every race tick.
- **Ghost solver priority:** Expensive prefetch work for the *next* ghost is deferred until the results screen during an actual Ghost duel, rather than initiating another CFOP solve while a duel is about to start. Qualifying still prewarms to enable first duel preparation.
- **Visual CSS:** The mobile race cube avoids continuous bobbing, sticker fades, shadows, and blur. Other previously optimized visual and scrolling rules remain.

## Not modified
- Solo Timer, personal records, Ghost qualifying rules, race timing accuracy, AI solve plans, CFOP solution validity, AI personalities and difficulty, multi-AI opponent results, VS cinematics, Hero Journey XP, player profiles, desktop cube rendering, or mobile orientation.

## Testing
```
npm run typecheck
node scripts/test-mobile-race-performance.mjs
npm run test:ghost
npm run test:multi
npm run test:cfop
npm run test:solo
npm run build
```
On an actual phone, compare the **AI 1v1** and **Ghost duel** before and after the deployment. If needed, in Race AI turn off *Show AI Cube* entirely to reduce rendering further.

## Tradeoffs and limits
This change reduces CPU/DOM work by design but is **not a measured FPS benchmark** on the user's phone. Mobile cubes show correct move-by-move sticker states, but not interpolated physical slice rotations. Vite's Linux production build is not locally validated when using the Windows dependencies shipped in the original ZIP; run `npm run build` locally on Windows and let Vercel rebuild after the Git push.
