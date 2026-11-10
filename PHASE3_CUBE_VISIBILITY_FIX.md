# Cube Hero Phase 3 — AI Cube Visibility Hotfix

## Reported issue
The AI timer and computed move progress were visible during a race, but the area reserved for the WebGL-based cubing.js/TwistyPlayer 3D cube was empty. Loading the element did not guarantee its internal canvas had painted, so the original error overlay could disappear even when there was no rendered cube.

## Changes
- Replaced the unreliable 3D canvas dependency in the race/replay visual component with a **self-contained CSS 3D cube**. Its top, front, and right surfaces are always visible without WebGL or asynchronous rendering.
- Added a dependency-free 54-sticker cube-state engine. Sticker colors are computed from the displayed scramble and **each completed move of the verified AI solution**.
- Updated live race and results replay automatically because both screens already use the same `AiCube3D` component.
- Maintained the existing timer, AI personality profiles, scrambles, scoring, persistence, design, and Windows `start system.bat` launcher.
- Added `scripts/test-cube-visual.mjs` to validate 109 move sequences, inverse solutions, color counts, and solution progress.

## Scope / limitation
The CSS 3D cube now shows genuine intermediate cube **states** and transitions as moves are completed; its outer cube floats subtly for depth. It does not animate the internal slice rotation continuously as the previous TwistyPlayer was intended to do. Adding smooth, physically correct slice rotations can be a later optional improvement. The numerical solution still comes from the same Phase 3 verified two-phase solver.

## Install (changed files ZIP)
1. Close the current Cube Hero Server window.
2. Extract the changed-files ZIP into the folder **containing** `CubeHero_Phase1` and allow file replacement.
3. Double-click the existing `CubeHero_Phase1/start system.bat`.
4. In Race Setup, confirm **Show AI Cube** is enabled; start a new race. You should see a colored 3D cube in the AI opponent card during scrambling, racing, and the results replay.

No new packages or changes to npm dependencies are needed for this hotfix.
