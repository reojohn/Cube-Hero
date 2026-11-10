# Cube Hero — Hero Journey (Local Gamification Update)

## New page and navigation
- **Hero Journey** appears in the desktop sidebar and in the phone drawer through **More**. The five-button mobile bottom dock remains unchanged.
- The Home dashboard links to Hero Journey. Tabs: Overview, Achievements, Challenges, Ranked & Tournaments.
- Premium purple/glass styling, hover and pressed states, focus-visible controls, reduced-motion support, and compact mobile layouts.

## How local rewards work
- AI Race: 22 XP for a valid finish, 35 XP for a winning finish; DNF receives 0 XP.
- Ghost Race: 20 XP for each valid qualifying solve, 24 XP for a valid duel, 40 XP for a duel won; DNF receives 0 XP.
- Academy: 65 XP once per completed lesson, 10 XP once per uniquely learned case.
- Tournament finish: 130 XP, or 250 XP for tournament champions.
- Daily and weekly missions automatically grant their displayed XP one time per calendar period.
- All awarded XP uses a stable source ID; reloading, reviewing lessons, and clicking repeatedly do not duplicate XP. Previously earned awards remain in Hero Journey if a training record is later removed.
- Old saved AI, Ghost and Academy achievements are imported on first use; previously completed Academy work receives its first-observed date for challenge and streak purposes.

## Rank progression (local, unofficial)
- Bronze is the entry rank. Silver, Gold, Platinum and Cube Master require **12 valid recorded solves** with a rolling average below **45, 30, 20 and 12 seconds**, respectively.
- Solves may come from either Race AI or Ghost Race. XP level and performance rank are intentionally separate.
- No external result verification exists for an ordinary physical cube. These are training rankings, not WCA rankings.

## Five-round AI tournaments
1. Open Hero Journey → Ranked & Tournaments.
2. Select any Sub level (6–60), AI personality, and 1 through 10 opponents.
3. Click **Start 5-round tournament**. The existing CFOP Race AI engine runs with five consecutive scrambles.
4. Each round uses exactly one scramble shared by the player and all selected AI opponents. A new scramble is used for the next round.
5. Points are assigned in finishing order (1st gets number of total racers, 2nd one point less, etc.). Player DNF gets 0. Point ties use cumulative recorded time. Rankings are saved locally after every round.
6. You can leave between rounds, open Hero Journey and **Continue Tournament**. Starting a new one marks the old unfinished tournament abandoned.

## Browser storage
- `cube-hero-hero-journey-v1` — earned rewards, missions and tournament sessions.
- Existing `cube-hero-history-v2`, `cube-hero-ghost-races-v1` and `cube-hero-academy-progress-v1` remain the authoritative training records.
- Data is not uploaded. Your progress is specific to this browser/device and can be lost when its storage is cleared.

## Files added/changed
- New: `src/lib/heroJourney.ts`, `src/components/HeroJourney.tsx`, `src/components/HeroJourney.css`, `scripts/test-hero-journey.mjs`.
- Updated: `src/App.tsx`, `src/components/GhostRace.tsx`, `src/components/Academy.tsx`, `package.json`.
- No CFOP solving, 3D cube rendering or timer state-machine files were changed.

## Verification
- `npm run typecheck`
- `npm run test:journey`
- `npm run test:cfop`, `npm run test:ghost`, `npm run test:multi` and `node scripts/test-academy.mjs`
- Existing development dependencies in the uploaded ZIP are Windows-only: install platform-specific dependencies before building on Linux.

## Rotating Challenge Expansion — November 8, 2026
- **10 daily + 10 weekly missions** replace the old fixed 3 daily and 4 weekly missions.
- Each group draws from 40 curated objectives spanning timed solves, AI races, Ghost races, victories, speed targets, Academy progress, practice variety/consistency, and five-round tournaments.
- The lineup is deterministic for the local calendar period, so reloading or earning progress does not reroll the goals. Consecutive daily lineups contain no identical mission IDs, and consecutive weekly lineups contain no identical mission IDs.
- Daily missions change at **local midnight**; weekly missions change **Monday at local midnight**. The Hero Journey page checks the date while open and when the tab/window regains focus.
- Completed missions automatically grant their displayed XP one time through a period-specific event ID. Previously earned XP—including completed missions from the old release—remains saved and cannot be claimed a second time by refreshing.
- The Challenge page includes a mission-board summary, progress meters, category tags, reset-date hints, and All / To do / Completed filters. The Overview tab previews the next three daily goals instead of showing all ten.
- Challenges are optional. Certain Academy goals require **new** cases or lesson completions and can be unavailable if the entire Academy is already finished. Ghost challenges may require unlocking the Ghost first.
- Race engines, CFOP move animation, timers, Academy lesson content, and tournament scoring are unchanged.

## 30-achievement collection expansion — November 8, 2026
- **30 achievements total**, expanded from 13; the 13 original badge IDs and their historic completion paths remain available.
- New milestones cover 10/50/100 recorded solves, under-60/30/12-second performances, five under-20-second solves, five/25 AI victories, a first Ghost duel and five duel wins, ten learned F2L/OLL/PLL cases each, 75 total algorithm cases, a seven-day practice streak, and three completed championships.
- Every achievement is computed from existing deduplicated local activity events; decorative clicks do not unlock achievements or mint XP. Previously recorded activity can immediately count toward the new badges.
- The seven-day dedication badge uses the **longest historical streak**, not only the active streak, so it stays unlocked even if a later day is missed.
- The Achievements tab now includes independently selectable All / Unlocked / Locked filters and a scrollable category row: Solves, Speed, AI Race, Ghost Race, Academy, Consistency, Tournaments. Locked badge cards show compact progress bars; empty combinations provide a reset-filter action.
- Compact mobile badge cards stay responsive (one column at 320px and two columns at 390px). The existing Race AI, Ghost Race, Academy, mobile bottom dock, inspection and CFOP logic are unchanged.
- The same `cube-hero-hero-journey-v1` storage format is used; no migration or reset is required.
