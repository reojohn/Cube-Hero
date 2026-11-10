# Cube Hero — Fast AI Race CFOP Preparation

AI Race now uses its own verified CFOP scramble prefetcher, independent of the
Ghost Race cache.

- Entering **Race Setup** begins preparing one future AI race scramble with the
  existing CFOP solver, before pressing Start Race.
- All **1–10 AI rivals** share one verified CFOP solution, while each continues
  to receive its own sampled time, move cadence, and personality variation.
- During a prepared race, the next scramble is computed in the background.
- **New Scramble** and the next round reuse an already-prepared challenge,
  including an in-flight worker result if still calculating.
- The next prepared scramble is saved locally; any cached solution restored
  after a refresh is rechecked with the existing CFOP verifier before reuse.
- The screen can still display *Computing a verified CFOP solve* when a
  newly selected scramble has not finished preparation. The system never
  declares the solver ready without a verified solution.
- The cache is separate from Ghost Race and does not affect previous race
  records, multi-AI tournament rankings, animations, inspection timing,
  1.5-second Stackmat-style start, AI personalities or saved history.

## Changed files
- `src/App.tsx` — begin preload while configuring the race
- `src/components/RaceRoom.tsx` — consume and regenerate prewarmed scrambles
- `src/lib/aiPrefetch.ts` — new verified AI-only preload/cache adapter
- `scripts/test-ai-prefetch.mjs` — dedicated cache and integration checks
- `package.json` — `npm run test:ai-preload`
- `AI_INSTANT_PREPARATION_UPDATE.md` — this guide

To test: `npm run typecheck && npm run test:ai-preload`.
