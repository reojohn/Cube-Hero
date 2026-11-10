# Cube Hero — Phase 2 AI Personalities Update

This is a focused extension of the existing Phase 2 (AI balancing) source. It retains the approved UI, phase 2 race functionality, and `start system.bat`.

## Changes

- Race Setup now offers **Casual**, **Balanced** (default), and **Competitive** styles for **every** Sub-20, Sub-15, Sub-12, Sub-10, Sub-8, and Sub-6 opponent.
- **Casual:** a slightly slower long-run average, wider random variation, and more frequent slow rounds/lockups.
- **Balanced:** the existing calibrated Phase 2 balancing model (Sub-15 mean 14.10s) is preserved.
- **Competitive:** a slightly quicker average with narrower variation and fewer slow rounds. It still has occasional fast/slow solves.
- Your selected personality appears on the live race and results screens, and is saved in race history.
- Previous settings and stored race records remain readable; missing personality fields are interpreted as **Balanced**.
- Personalities use simulated human-like probabilities, *not* actual CFOP stage performance or scramble-aware solving. Phase 3 is unchanged.

## Installation

**Changed files ZIP:** extract into the parent folder containing `CubeHero_Phase1`, preserving folders and replacing matching files. Restart `start system.bat` if hot reload does not pick up changes.

**Complete ZIP:** unzip to a separate directory and double-click `CubeHero_Phase1/start system.bat`. Node.js is needed; first run may download dependencies.

## Files changed

- `src/lib/racing.ts` — typed personalities, timing profiles, record persistence.
- `src/App.tsx` — new selector, defaults, settings/session restore handling.
- `src/components/RaceRoom.tsx` — uses chosen profile and displays its label.
- `src/components/RaceResults.tsx` — displays opponent personality.
- `src/components/RaceStatistics.tsx` — shows personality for past solves.
- `src/styles.css` — responsive cards and style states.

No existing recorded times are recalculated. AI target time is sampled once per new round, and the player timer remains independent.
