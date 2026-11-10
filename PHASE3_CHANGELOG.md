# Cube Hero — Phase 3: Scramble-solving AI and 3D animation

## What's new

- **Real verified solutions:** A background Web Worker runs the Kociemba two-phase solver (`cubejs`) for the **exact 25-move scramble**. The output is verified by applying scramble + solution to a fresh cube and checking the solved state. The race cannot begin until a valid solution is ready.
- **3D opponent:** The `cubing.js` TwistyPlayer begins in the scrambled state and animates the computed solution, synchronized to the AI's race clock. Camera and styling match the dark/purple theme. "Show AI Cube" still turns this view on/off.
- **Human-like move timing:** Every one of the six Sub levels and three personalities retains its familiar target speed, with a modest extra adjustment for the verified solution's length. Movements have varied execution time and short recognition-like pauses. **This is a modeled schedule, not an observed human solve.**
- **Real move progress:** Live race page displays how many moves of the actual solution are complete.
- **Results and replay:** New records include verified solution, move count, quarter-turn count, and an execution timeline breakdown across opening/middle/late/finish. The user can inspect the scramble and solution afterward, and play/scrub a 3D replay.
- **Existing history:** Older Phase 2 races remain readable and are explicitly marked as legacy simulation. No local storage keys or settings changed.
- **Launcher:** `start system.bat` now detects if the two new packages are missing and installs them automatically with npm, rather than assuming an existing `node_modules` is complete.

## Important limitations

- The Kociemba two-phase solution is *not a CFOP solve*. The four execution timeline segments are **not** Cross, F2L, OLL, and PLL. Those would require a separate human-CFOP reconstruction/algorithm planner.
- The baseline duration is still simulated based on your selected Sub tier and personality, lightly modified by move-count complexity. A machine solving the scramble algorithmically is not a model of a human recognizing it.
- The existing 25-turn practice scramble generator is **not WCA random-state scrambling**.
- The user presses Space or the large button to stop their own physical-cube timer; no smart-cube verification is performed.
- An internet connection is needed the **first time** to install new packages. No cloud AI API or server is needed to race afterward.

## Installation on an existing Phase 2 project

1. Close the Cube Hero Server command window.
2. Extract **CubeHero_Phase3_ChangedFiles.zip** into the folder **containing** `CubeHero_Phase1`, replacing matching files.
3. Double-click `CubeHero_Phase1/start system.bat`. It installs `cubing` and `cubejs` if missing, then opens http://localhost:5188/.
4. Start a race and wait for the green **Verified two-phase solution ready** badge. First initialization may take several seconds on a typical PC.

## Verification conducted

- TypeScript checks were run against declarations that match the documented library interfaces.
- Timing/move progress, result metadata, and race history compatibility were tested independently.
- **A complete Vite production build and a live browser/3D solve could not be run in this environment because npm package downloads are unavailable here.** The first local run should be tested before treating the release as production ready.
