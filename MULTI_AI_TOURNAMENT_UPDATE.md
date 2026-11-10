# Cube Hero — Multi-AI Race Update

## What's new
- **Race Setup** now offers a premium **AI Opponents** selector (1–10); 1 is the default and preserves the original head-to-head layout.
- All opponents receive the **identical scramble** and selected difficulty/personality, but their **solve times are sampled independently**. Each also gets a distinct simulated turn cadence.
- The CFOP solver computes a verified solution **once per scramble**. The featured AI cube animates that solution. The other AIs have compact running timers without exposing solve moves or stages.
- For multi-AI races, the arena displays all opponents; the game waits for the player's finish and the last AI to finish before finalizing the round.
- Race Results includes a ranked leaderboard with all AIs and the player, including +2 and DNF handling. Winning a multi-AI race means finishing ahead of **all** opponents; `aiMs` stays the quickest AI time for older statistics and breakdowns.
- The fastest AI's actual time and animation variant are saved for consistent results replay. Past history and old sessions remain compatible.

## How to apply
1. Stop your local server.
2. Extract the `ChangedFiles` ZIP **into the directory containing `CubeHero_Phase1`**, replacing matching files.
3. Start your usual `start system.bat` (unchanged).
4. Hard refresh the browser (Ctrl+Shift+R), open **Race AI**, and pick 1–10 opponents.

## Verification
Run `npm run typecheck`, `npm run test:cfop`, `npm run test:multi`.
The uploaded archive includes Windows-specific optional build binaries; Linux-only production build testing in the current environment was not possible.

## Important distinctions
The AI opponents **share a valid, verified CFOP solution**, but their timing/turn cadence is simulated; they are not 10 independently trained human solvers. All are at the selected Sub level and personality. Opponents do not use real matchmaking or networking.
