# Cube Hero · Phase 2 Final Polish — VS Matchup Introduction

## What was changed

- Added `src/components/VsIntro.tsx` and `src/components/VsIntro.css`.
- The **Start Race** button now displays a full-screen fighting-game-inspired matchup before navigating to the race room.
- Left side: the current Guest Cuber / player mascot (`src/assets/player-avatar.png`).
- Right side: the selected rival's already-installed WebP/PNG portrait, or the SVG fallback for Sub-26 through Sub-60.
- Character name, title, division, motto, difficulty and colors come from `src/lib/rivals.ts` and the current race settings. No opponent-specific animation markup is duplicated.
- Added subtle responsive motion: opposing entrance slides, central VS impact, glowing diagonal beam, atmospheric lights, and progress line.
- The introduction automatically enters the race after **5 seconds** (or **1.1 seconds** if reduced motion is enabled).
- **Enter arena now** skips the introduction; **Back to setup** cancels without creating a race session; Escape cancels.
- Optional self-contained synthesised sound cues honor the existing Sound Effects preference; no sound files, downloads or extra dependencies.
- The intro preloads the chosen rival illustration and locks page scrolling/focus while open.
- The existing Race AI page, 55 rival roster, CFOP system, player profile, race results, Ghost Race and Hero Journey are preserved.

## Important timing behavior

`App.tsx` now prepares the session in `vsPendingSession` when Start Race is clicked; the session isn't saved and `<RaceRoom />` isn't rendered until `onEnterArena` fires. As a result, inspection and race timers cannot begin while the VS screen is visible.

The standard app's session flow, race simulation and CFOP logic are untouched. Subsequent rounds within an existing session still open directly into `RaceRoom`. "Race Again" from the results screen uses the VS intro like the original Start Race button.

## Installation

1. Extract the changed-files ZIP over the root of the latest Cube Hero project, retaining its `src/` and `scripts/` paths.
2. From the project root run `npm install` if dependencies are missing, then `npm run typecheck` and `npm run test:vs`.
3. Run `npm run dev` and open Race AI; select a rival, click Start Race, test Skip, Back and mobile widths.
4. The main user settings page already contains the Sound Effects and Reduce Animations toggles.

## Validation in this environment

Passed: TypeScript, VS artwork/data contracts for all 55 rivals, rival art mappings, multi-AI configurations, CFOP, difficulty levels, Ghost Race, Hero Journey and landing-page regression tests.

The uploaded `node_modules` were installed for Windows. This Linux test container lacks the Rollup Linux binary, so `vite build` was not confirmed here. Run `npm install` / `npm run build` locally to verify your production bundle. The final animated UI should also be checked in the user's browser.
