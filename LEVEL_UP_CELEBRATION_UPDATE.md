# Cube Hero — Premium Level-Up Celebration

Built on the uploaded `CubeHero_Phase1(20261109-035557).zip` source.

## New feature

An earned Hero Journey level now opens a full-screen, premium celebration inspired by the approved stadium/winged-badge reference:

- Gold **LEVEL UP!** heading and congratulations message
- Animated silver-purple wings, gold-framed violet level crest, and **real current level number**
- Stage/podium lighting, spotlights, fireworks, falling confetti, glowing particles
- Current Hero Journey title, previous level -> new level progress
- **CONTINUE** button returns to the existing screen without altering data
- Compact responsive layout for phones and large desktops
- Reduced-motion accessibility support (app setting or OS setting)
- Escape key / focus management / scroll lock

## Accurate progression trigger

The celebration is driven by the actual `levelInfo(journeyMetrics(journey).xp)` computation in `src/lib/heroJourney.ts`, covering completed AI races, Ghost Race, lessons, mastered cases and tournament/mission rewards. It does **not** award XP or alter the level calculation. It does **not** play just because the player visits Hero Journey or opens the app. Existing activity is included in the startup baseline so old level-ups are not replayed after reloading or importing existing saved data. A large XP gain crossing several levels results in one celebration showing the highest earned level.

## Files changed

- `src/App.tsx` — observes XP-derived level changes, shows overlay
- `src/components/LevelUpCelebration.tsx` — new standalone celebration view
- `src/components/LevelUpCelebration.css` — original SVG, stadium and animation styling
- `src/lib/levelUp.ts` — pure earned-level detector
- `scripts/test-level-up.mjs` — level threshold and static render tests
- `package.json` — adds `npm run test:levelup`

## Usage

1. Replace files in the existing project, preserving the root folder structure.
2. Run `npm run typecheck` and `npm run test:levelup`.
3. Run `npm run dev`, earn enough XP through genuine activity to cross a Hero Journey level threshold, and confirm the celebration appears.
4. Press Continue; the current screen remains available.

## Scope

No adjustments were made to the existing 55 rival identities, 20 imported portrait assets, Race AI and multi-AI timing, 5-second VS introduction, CFOP engine, ghost timing, or saved event formats.
