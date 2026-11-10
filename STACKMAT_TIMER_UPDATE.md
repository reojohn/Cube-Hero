# Cube Hero — Stackmat-style Hold-to-Start Update

This update preserves the existing Phase 3 CFOP solver, 3D cube, inspection modal, local statistics, and `start system.bat`.

## How to play

1. Apply the scramble to a physical 3×3 cube.
2. Click **I’m Scrambled — Inspect** to open the normal 15-second inspection modal, or **I’m Scrambled — Ready** when inspection is disabled.
3. **Hold Space or press and hold the inspection modal's Start button / touch surface.** The purple progress fills while arming.
4. At **1.5 seconds**, the indicator turns green: **RELEASE TO START**. Only when you release do the player and AI timers start.
5. Releasing early cancels the attempt to start, without restarting inspection. The inspection penalty is determined at actual release: 15–17s is +2, 17s and later is DNF.
6. **Press Space or tap the player timer / Stop button** to finish your solve.
7. Once racing starts, the page still scrolls to center the race arena.

**Note:** The 1.5-second arming time is Cube Hero's configurable-in-code training convention, not a WCA rule requiring exactly 1.5 seconds. This simulates hand-release timing without physical pressure sensors.

## Controls and safety

- Spacebar: press and hold to arm, release to start; later press to stop.
- Touch/mouse: hold the modal card or Start Race button, release to start. With inspection disabled, you may hold the player timer panel itself.
- If focus is lost or a touch is canceled, the arming attempt is canceled.
- The inspection clock continues during arming.
- No database, score, solver, or AI personality logic is changed.

## Updating an existing installation

Extract the changed-files ZIP into the *parent* of the `CubeHero_Phase1` directory and allow file replacements. Restart the server with the existing `start system.bat` and refresh the browser.
