# Cube Hero — Inspection Countdown Modal

## What changed
- Clicking **I'm Scrambled — Inspect** starts the existing inspection timer and shows a premium countdown dialog.
- Start the race with **Space** or the dialog's **START RACE** button. The dialog immediately closes as the player and AI timers begin.
- The original in-page inspection bar remains in place, including +2 and DNF handling.
- During inspection, the dialog warns at 15 seconds (+2) and 17 seconds (DNF).
- Responsive mobile layout and reduced-motion support are included.

## Installation
Extract the changed-files ZIP into the **parent folder containing CubeHero_Phase1**, replacing existing files. Restart `start system.bat` or refresh the browser.

## Scope
Modified: `src/components/RaceRoom.tsx`, `src/styles.css`.
Added: `src/components/InspectionModal.tsx`.
No changes to the CFOP solver, AI timing, cube animation or race history.
