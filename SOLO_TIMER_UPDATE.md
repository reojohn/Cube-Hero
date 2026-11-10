# Cube Hero — Premium Solo Timer

A self-contained training page with **no AI opponents**. It reuses the current Vite/React game shell and works with the local, username-only player profile.

## What's new
- Navigation item **Solo Timer** in the desktop sidebar, mobile quick-navigation dock and Home hero
- Route `#/solo` under the existing `/app` page
- Large premium responsive stopwatch with a 1.5-second hold/release start (mouse, touch or Space) and tap/Space stop
- New random valid-notation 3×3 practice scramble per solve, with optional copy and regenerate
- Optional 15-second inspection (+2 after 15 seconds, DNF after 17 seconds)
- Session personal best, valid-only mean, trimmed Ao5/Ao12, recent solves, editable +2/DNF penalties
- Browser-local records via `cube-hero-solo-timer-v1` (capped at 500 solves), Undo last and clear-history confirmation
- Reduced-motion compatibility, phone/desktop styling and leave-while-solving guard
- No opponent, solver invocation, online service, or XP generation on this page

## How to use
1. Open **Solo Timer** from the desktop sidebar or mobile dock.
2. Scramble your physical 3×3 cube using the displayed scramble.
3. On desktop hold **Space** for 1.5 seconds until green, then release to start; press Space to stop.
4. On mobile press and hold the big timer for 1.5 seconds, release to start, and tap it to stop.
5. The time saves automatically. Correct an accidental penalty with OK/+2/DNF, if needed.
6. Optionally turn on inspection and press **Start inspection** before starting the timer.

## Technical notes
- Only local storage is used. A browser data clear/uninstall may erase solo history; there is no cross-device sync.
- Solo history and stats are independent of `cube-hero-history-v2`, Ghost Race and Hero Journey XP.
- Ao5/Ao12 drop one fastest and one slowest result; two or more DNFs lead to DNF.
- This does not change existing multiplayer races, rival artwork, profile onboarding or the VS/level-up animations.
- The 1.5-second hold is a Cube Hero interaction choice, not an official competition requirement.

## Files changed
- `src/App.tsx` — new route and navigation
- `src/mobile-bottom-nav.css` — six navigation slots on phones
- `src/components/SoloTimer.tsx` — standalone timer UI
- `src/components/SoloTimer.css` — premium timer design
- `src/lib/soloTimer.ts` — solo save model and Ao5/Ao12 math
- `scripts/test-solo-timer.mjs` — timer tests
- `package.json` — `npm run test:solo`

## Validation
- `npm run typecheck`: passed
- `npm run test:solo`: passed
- `npm run test:profile`, `npm run test:phase2`, `npm run test:levelup`, `npm run test:multi`, `npm run test:ghost`, `npm run test:journey`, `npm run test:landing`, `npm run test:cfop`: passed
- Production build: not verifiable in this Linux environment with the Windows-only dependency bundle; run `npm install && npm run build` on your development machine.
