# Cube Hero — YOU vs YOU · Ghost Race

The static **Practice** page has been replaced by **Ghost Race**. The route remains `#/practice` to preserve old bookmarks.

## First launch

1. In the sidebar, open **Ghost Race**.
2. Apply the displayed 3×3 scramble to your physical cube.
3. Click **I'm Scrambled — Inspect**. The same premium 15s inspection modal opens.
4. Hold **Space** or the modal touch area for **1.5 seconds**, then **release** to start. Inspection freezes during the hold, resuming if released too early.
5. Solve the cube and press **Space** or tap the player timer to stop. Complete **three valid solves**, each on its own scramble. DNFs don't count toward the three.
6. The fastest official time (including any +2 inspection penalty) becomes your ghost.
7. Choose **Race Your Ghost**, scramble a fresh cube, and begin another race. The ghost's **3D cube turns using a stage-verified CFOP solution** for this new scramble, paced to your personal-best time. You can beat it, tie it, or lose to it.
8. Every new PB replaces the ghost for the following race. History is saved under `cube-hero-ghost-races-v1` in localStorage, separately from AI racing results.

## Important accuracy disclosure

For physical cubes that are not connected to the browser, Cube Hero cannot observe the player's actual turns. The ghost animation is **not a recording of the player's earlier solve**. It uses a verified CFOP solution of the **current** scramble, whose simulated turning duration is calibrated to the player's recorded best time.

## Preserved

All existing AI racing modes (1–10 AIs, Sub-6 through Sub-60, personalities), turning cube, inspection timer, 1.5s hold/release, penalties, results, history, and the Windows `start system.bat` launcher are unaffected.

## Verification

- `npm run typecheck`
- `npm run test:ghost`
- `npm run test:cfop`

If returning to a previous round or quitting an ongoing timer, a confirmation protects against accidental navigation.
