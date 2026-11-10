# Cube Hero — Freeze Inspection When Holding

New Stackmat-style inspection behavior:

1. Click **I'm Scrambled — Inspect** to begin inspection.
2. The inspection modal and the existing lower counter count down together.
3. **Press and hold Space or hold the Start area**. Both inspection counters immediately freeze and the timer begins its separate 1.5-second arming period.
4. When the timer turns green, **release to begin the race**. The inspection penalty (none, +2, or DNF) is based on the time when the hold began.
5. If released before 1.5 seconds, or if the hold is canceled, inspection resumes from exactly the frozen point. This prevents repeated short holds from adding extra inspection time.
6. At the end of a successful release, the inspection modal closes and the existing arena-centering behavior runs. The old lower inspection/race-status panel is preserved.

This is a Cube Hero training interaction; the 1.5-second holding period is **not** an exact WCA-mandated arming duration.

Changed runtime files:
- `src/components/RaceRoom.tsx`
- `src/components/InspectionModal.tsx`
- `src/lib/inspectionClock.ts` (new)

Tests: `npm run typecheck`, `npm run test:cfop`, and `node --experimental-strip-types scripts/test-inspection-clock.mjs` (Node.js 22).
