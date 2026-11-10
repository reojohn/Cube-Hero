# Cube Hero — Phase 2 recovery and mobile VS repair

## What went wrong
The uploaded `CubeHero_Phase1(20261109-033657).zip` contains the newer WebP/PNG assets and newer VS files, but three critical files had been overwritten by Phase 1 versions:

- `src/App.tsx` no longer mounted `<VsIntro>` and opened RaceRoom immediately.
- `src/components/RivalSelect.tsx` had reverted to its original SVG-only `RivalEmblem` function.
- `src/components/RivalSelect.css` had lost all Phase 2 image glows, effects, and layout refinements.

The VS component and CSS also predated the compact-mobile VS pass. The latest `rivals.ts` also reverted two character-name edits and the color division boundaries.

## Restored from the most recent working source
- `src/App.tsx`: pending VS state, 5-second intro, deferred RaceRoom/inspection start, shared player avatar.
- `src/components/RivalSelect.tsx`: Batch 1 WebP/PNG portraits with SVG fallback, preloading, selected-rival effects.
- `src/components/RivalSelect.css`: premium glow/orbit/selection styling.
- `src/components/VsIntro.tsx` and `.css`: 1v1 and free-for-all with individual AI opponent cards, compact mobile layout 320px and up.
- `src/lib/rivals.ts`: restores the previous user edits `Reo` at Sub-12 and `Jake` at Sub-20, Challenger teal beginning at Sub-21, Rising coral/peach.
- `scripts/test-phase2-preservation.mjs`: a new safeguard that fails when a Phase 1 file is mistakenly installed over Phase 2.
- `package.json`: new `npm run test:phase2` script.

All original 20 optimized WebP files and PNG backups are included in the full project but unchanged by this patch. Opponent timing, CFOP, scramble, Ghost Race, and Hero Journey source files are unchanged.

## IMPORTANT: How to install the changed-files ZIP

1. Make a backup copy of your existing Cube Hero folder.
2. **Open the actual project root** containing `package.json`, `src`, `public`, and `scripts` (often named `CubeHero_Phase1`).
3. Extract the **Changed Files Only** ZIP **inside that exact folder**; merge directories and choose **Replace** for existing files.
4. Do not extract into the folder *above* CubeHero_Phase1, and do not create an extra `CubeHero_Phase1` nested directory.
5. Run `npm run test:phase2` from this folder; if it passes, run `npm run dev`.
6. Refresh the app (`Ctrl + Shift + R`). Confirm the first 20 portrait PNG/WebPs, the halo effects, and Start Race -> VS screen.

To install the full-project ZIP instead, extract in the parent folder; it contains a single `CubeHero_Phase1/` root and excludes node_modules. Run `npm install` in `CubeHero_Phase1` when needed.

## Verification in this environment
- TypeScript: PASS
- `test:phase2` (portrait image and VS regression guard): PASS
- 55 rival identities and art fallback: PASS
- 1v1 and 2–10-AI VS markup and controls: PASS
- Multi-AI, CFOP/difficulty, Ghost Race, Hero Journey, landing page: PASS
- 20 optimized WebPs + 20 original PNGs verified present: PASS
- Production Vite bundle: not completed in Linux test environment because supplied node_modules lacks Rollup's Linux optional binary. Run `npm install` and `npm run build` on your Windows computer for final production-build verification.
