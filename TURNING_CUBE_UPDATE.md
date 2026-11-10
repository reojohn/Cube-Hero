# Cube Hero Phase 3 — Physical Cube Turning Update

## What's fixed
The earlier CSS 3D model replaced sticker colors instantaneously at each move. It did not turn any layers.

This update replaces that visual with **26 separate 3D cubies**. When a `U`, `D`, `R`, `L`, `F`, or `B` move is executing, all nine physical cubies on the selected layer and their attached sticker surfaces rotate in 3D. Double turns rotate 180°. Prime turns rotate the opposite way. The component works in both the live AI panel and results replay.

The cube still uses the real scrambled state and verified two-phase solution. The turn angle is calculated directly from the AI's current time and move schedule, so it works when paused or when scrubbing backwards/forwards in the replay. It does **not** require WebGL or additional npm packages.

## Installation
1. Stop the running server.
2. Extract the **Changed Files** ZIP into the folder containing `CubeHero_Phase1`, allowing replacement.
3. Double-click the existing `CubeHero_Phase1/start system.bat`.
4. Start a Sub-15 race with **Show AI Cube** enabled, or open a past Phase 3 result and press **Play Solution**. Watch the pieces physically rotate, not change colors in place.

## Notes
- Moves are based on a verified two-phase solution, not an independently reconstructed CFOP solve.
- AI turn pacing is simulated according to the chosen difficulty/personality.
- The 3D cubies retain fixed camera angle for clarity; this upgrade does not add a free-rotate cube camera.
