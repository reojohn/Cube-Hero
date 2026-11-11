# CubeHero — Mobile Multi-AI Portrait Cards

## Scope

Only the live **Race AI → Other AI Racers** cards change on compact/mobile viewports, in both portrait and landscape. The featured AI keeps the optimized physical-turn cube. Desktop stays on its existing animated additional cubes (or existing placeholder if Show AI Cube is switched off).

## What changed

- Each extra mobile opponent now displays one local 160×160 WebP portrait from the approved 55-rival roster instead of a generic cube placeholder.
- Portraits follow the same division and sequential identity mapping as the multi-AI VS intro. AI 2 during the live race is the same visual character as AI 2 during VS.
- A small character name appears beneath the AI number. These identities do not change the shared scramble, Sub-level, independent AI timing, or personality.
- Portraits have no animation, 3D cube, blur, or continuous effects. Images load lazily with asynchronous decoding; a full WebP, PNG, and finally icon fallback are available.
- Desktop branch and Solo Timer / Ghost Race are unchanged.

## Files

- `src/components/RaceRoom.tsx`
- `src/components/MobileAiPortrait.tsx` (new)
- `src/styles.css`
- `scripts/test-mobile-race-performance.mjs`

## Verification

`npm run typecheck`, `node scripts/test-mobile-race-performance.mjs`, `npm run test:multi`, `npm run test:vs`, `npm run test:art`, and existing mobile orientation/ghost/cube/solo/profile/Journey tests.

Run `npm run build` locally before committing to GitHub and redeploying on Vercel. Check 1v1 and 5-AI races on a phone. Portraits only appear when there are additional AI opponents (multi-AI race).
