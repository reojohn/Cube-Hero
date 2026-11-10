# Cube Hero — Phase 2 Implementation (November 7, 2026)

## Features added

1. **Live racing:** actual player and AI clocks driven by `performance.now()`, Spacebar to start/stop, and touch-friendly Start/Stop buttons.
2. **Fresh shared scramble:** offline-generated 25-move 3×3 sequences, copy button, new scramble before inspection, and new scramble for every round. Not WCA random-state scrambles.
3. **Variable AI opponents:** Sub-20, Sub-15, Sub-12, Sub-10, Sub-8, and Sub-6 all have their own average pace; every solve samples realistic timing variations rather than repeating one fixed time.
4. **Inspection:** optional 15-second inspection; +2 at 15 seconds or later; DNF at 17 seconds or later. Screen clearly shows this status.
5. **Single, 5, 12 rounds:** one continuous series, results after each round, next scramble action, win/loss tracking, and series-average calculation.
6. **Actual results:** winner based on measured player time (plus penalty, if any) against sampled AI time. Player time is locked when the player finishes; if the AI is still racing, result waits for its completion.
7. **Persistent local statistics:** saved rounds, PB, win rate, Ao5, Ao12, recent solve history, and an honest chart of valid actual solve times.
8. **Settings integration:** existing precision toggle now changes timers; sound toggle now controls short start/stop tones.
9. **UX:** premium palette maintained; responsive mobile racing screens; running-race exit confirmation; accessible buttons and real timer labels.
10. **Updated labels:** Phase 2 is active, previews removed from the race and results screens. Practice/Learn remain focused on training content.

## Scope boundary / honest limitations

- The AI time simulation is not calculated from the exact scramble. Real solver-driven AI and synchronized 3D animations are reserved for Phase 3.
- The cube illustration remains symbolic. Estimated CFOP bar percentages are labeled illustrative, not verified solutions.
- Practice scrambles are valid cube moves but not officially generated random-state WCA scrambles.
- Physical cubes cannot be automatically validated without a supported smart cube.
- No backend, account, multiplayer or cloud data yet; browser-local storage only.

## Installation / changed files

The changed-file ZIP includes files in the same `CubeHero_Phase1/` folder structure:

- `src/App.tsx` (updated)
- `src/styles.css` (updated)
- `src/components/RaceRoom.tsx` (new)
- `src/components/RaceResults.tsx` (new)
- `src/components/RaceStatistics.tsx` (new)
- `src/lib/racing.ts` (new)
- `README_START_HERE.md` (updated)
- `PHASE2_CHANGELOG.md` (new)

The full ZIP includes the above plus existing source, artwork, config, and unchanged `start system.bat`. Dependencies are deliberately omitted from the full ZIP; double-clicking the BAT installs them if needed.

## Tests performed

- TypeScript strict `--noEmit` check: PASSED.
- Stylesheet syntax parsed by PostCSS: PASSED.
- 200 generated 25-move scrambles checked for valid notation/adjacent-axis constraints: PASSED.
- AI variation checked across all six difficulty levels: PASSED.
- Inspection threshold tests for 14.999 / 15 / 16.999 / 17 seconds: PASSED.
- Trimmed 5-solve average with 0 / 1 / 2 DNFs: PASSED.
- React server-side rendering of all main routes, including active room/result/history data: PASSED.
- Full Vite production build and automated browser navigation: NOT VERIFIED in this Linux sandbox because the uploaded `node_modules` contain Windows-native Rollup binaries; package registry access is unavailable and sandbox browser network access blocks localhost. Please run `npm run build` on your local Windows machine if you want a production-build check.
