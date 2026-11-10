# Cube Hero — Phase 2 AI Balancing Update

## Why the original Sub-15 opponent felt too fast
The original nominal mean was 13.50 seconds and the random distribution made 12-second finishes relatively common. The simulated AI did not solve the cube or derive its time from the scramble.

## Changes
- Raised Sub-15 long-run average target to **14.10 seconds**.
- Replaced the original broad normal + occasional extreme outlier model with a Balanced timing distribution: most races cluster around the target, 7% chance of a favorable fast-solve adjustment, and 17% chance of a slower-round adjustment.
- Normal variability is ~6% of the tier average, with mean-correction so unusual rounds do not systematically speed up the AI.
- Other difficulty targets remain at approximately 18 / 10.8 / 9 / 7 / 5.5 seconds; their variation follows the balanced model too.
- Updated race-setup labels and clarified that the AI clock is simulated independently of the scramble.
- No UI layout redesign, no new dependencies, no changes to `start system.bat` or browser storage format.

## How it works
An AI time is independently sampled once when a race room is created. When you press Start Race, the displayed AI clock progresses to that predetermined *sampled* finish time. The sampled time is not a fixed constant and is not selected in response to your time. This is not yet a cube-solving algorithm.

## Historical results
Previous races are preserved with their original AI times; only newly started races use the updated distribution. Restart the race room (e.g. Race Setup > Start Race) for a fresh sampled time.

## Test plan
- Run `npm run typecheck` or `npm run build` on Windows.
- Race a Sub-15 opponent 10–20 times to check that most solves feel close to 14 seconds, with occasional 12–13 second solves and slower 15–17 second solves.
- Verify that all six tiers still work, results are recorded, statistics are unchanged, and Spacebar controls still function.
