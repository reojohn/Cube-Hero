# Cube Hero — Expanded AI Difficulty Update

This update adds a premium dropdown for selecting any **whole-number Sub level from Sub-6 to Sub-60**.

## Preserved
- The original six quick-select cards remain unchanged: Sub-20, Sub-15, Sub-12, Sub-10, Sub-8, Sub-6.
- Their original Balanced AI target averages are unchanged.
- Casual, Balanced, and Competitive still use the existing timing and pause distributions.
- CFOP solver, moving 3D cube, inspection/hold-to-start, arena centering, replay, statistics, and the Windows `start system.bat` remain unchanged.

## New
- A dark-purple **More AI difficulties** dropdown directly below the six original cards.
- All 55 integer levels, 6–60 inclusive, with a quick numeric search and typical target times.
- Selection updates the opponent summary, race room, results, and local race history.
- Smaller/faster tiers between existing presets are smoothly interpolated, while Sub-21 through Sub-60 target approximately `level - 2` seconds (e.g., Sub-30 ≈28s; Sub-60 ≈58s).
- Additional levels still have natural, personality-dependent variation; no race time is fixed.

## Installing the patch
Extract the changed-files ZIP into the **parent folder** containing `CubeHero_Phase1`, allow matching files to be replaced, and refresh the website. `start system.bat` still works normally.

## Testing
`npm run typecheck` and `npm run test:cfop` (including the new `test:levels`) check the implementation. The test suite includes all 55 level labels and three personalities. Browser-side visual verification is still recommended after installing.
