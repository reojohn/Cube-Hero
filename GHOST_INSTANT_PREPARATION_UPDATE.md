# Ghost Race — Fast Verified CFOP Preparation

Ghost Race prepares one upcoming scramble **ahead of time** using the existing
verified CFOP solver. This changes perceived waiting without compromising the
actual Cross → F2L → OLL → PLL solution.

- During the three qualifying solves, the app quietly solves the first future ghost challenge.
- After a ghost solution is ready, it starts preparing the **next** challenge in the background.
- New rounds and the New Scramble action select the prepared scramble first.
- Verified solutions are reused when already in memory and one upcoming challenge
  can be persisted locally across a browser refresh, re-verified before use.
- If an unsolved, brand-new scramble is requested before preparation has finished,
  the page still waits for verification rather than faking a ghost animation.
- Existing ghost records, race clock, inspection modal, 1.5-second hold and
  physical cube animation remain unchanged.

## Files changed
- `src/components/GhostRace.tsx`
- `src/lib/ghostPrefetch.ts` (new)
- `src/lib/ghostPrefetchCore.ts` (new)
- `scripts/test-ghost-prefetch.mjs` (new)
- `package.json` (test command)

Run `npm run test:ghost` to check the caching, timing and persistence logic.
