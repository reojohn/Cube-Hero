# Cube Hero — Phase 3 CFOP-only AI upgrade

## What's new

New races use a CFOP search package (`@moishy/cfop` v0.4.0) rather than the old two-phase solver. The opponent computes a solution for the exact race scramble:

1. Cross (bottom edges)
2. F2L pair 1, pair 2, pair 3, pair 4
3. OLL
4. PLL

The cube state is validated after each stage, including after face/whole-cube rotations, and racing is disabled until verification succeeds. An invalid or timed-out solve shows **Retry** / **New Scramble**; it will **not** silently fall back to two-phase solving.

The CSS 3D cube now physically animates wide turns, middle slices, and whole-cube rotations, in addition to the original six outer faces. Results show the CFOP moves by stage with actual stage boundaries and replay. Existing saved two-phase results continue to replay as two-phase.

**Important:** The algorithm is genuinely CFOP. Human-like turn speeds, recognition pauses, and Sub-level opponent finishing times are still simulations, not measurements or a learned model.

## Install over your existing project

1. Stop the running Cube Hero Server window.
2. Extract the **Changed Files Only** ZIP alongside your current `CubeHero_Phase1` directory; allow folder merges and file replacements. Don't delete `node_modules` or your browser data.
3. Double-click the **updated** `start system.bat`. It detects that `@moishy/cfop` and `@moishy/cubing-core` are missing and runs `npm install` automatically; internet access is needed this first time. The existing `package-lock.json` is refreshed by npm.
4. In Race AI, select any Sub-level and personality. The scramble screen must show **Verified CFOP solution ready** before starting inspection/racing.
5. In Results, check seven named CFOP stages and watch the 3D replay.

### Troubleshooting

- **Dependency error:** Verify internet and Node.js 22 LTS, then double-click the launcher again.
- **CFOP search failed:** Press Retry or New Scramble; the race intentionally cannot start without a verified CFOP solution.
- **An earlier race says Two-phase:** That is correct for older locally saved records; start a new race for CFOP.
- **Browser shows old code:** Close/restart the server, then press Ctrl+Shift+R.

## Validation and limitations

Checks performed here: strict TypeScript compile, 120 scramble syntax tests, 2,880 opponent timing plans, 109 old 54-sticker tests, 378 outer-face turn tests, 210 extra wide/slice/rotation animation cases, and CFOP stage/inverse/invalid-stage checks.

**Not validated here:** complete npm package download, bundled production build, actual CFOP library solving random full scrambles, and interactive browser execution with that package. The npm registry is unreachable from this environment; `@moishy/cfop` is therefore an integration dependency installed on the user's Windows PC. The package has a pre-1.0 API and should be integration-tested locally before considering the update production-ready.
