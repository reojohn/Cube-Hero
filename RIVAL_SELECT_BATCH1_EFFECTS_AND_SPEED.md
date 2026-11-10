# Cube Hero — Batch 1 Effects & Loading Optimization (Nov 2026)

This update is made against the **Batch 1 20 Integrated** project, retaining all 55 rival profiles, racing settings, and logic.

## What changed
- Restored **subtle halo/orbit rings, glow, particles** behind the imported transparent portraits in both small roster cards and the selected-rival preview.
- Kept the same original image designs and division palettes (Legend orange, Master purple, Expert blue, Challenger teal).
- Converted the 20 source 512×512 RGBA PNG portraits into approximately **0.9 MB of optimized transparent WebP** assets (compared to about 4.4 MB total PNG source).
- Changed PNG lazy loading to **eager** for the 20 imported rivals, with **high priority** for the featured rival.
- Added one-time image warming/decoding when Race AI's rival picker is mounted, so switching already-loaded rivals avoids new download delays.
- Fallback order when an asset cannot load: optimized `.webp` → original `.png` → existing code-drawn SVG.
- Left Sub-26–60, legacy racing logic, Ghost Race, Hero Journey, and all other pages unchanged.

## Install
If updating the previously installed **CubeHero_Batch1_20_Integrated** project, extract the **Changed Files Only** ZIP over the project root and allow the same relative paths to overwrite. The changed package contains the 20 new `.webp` files; the original `.png` files from Batch 1 remain in your existing project for fallback.

For a new installation, use the full-project ZIP. Run `npm install` and `npm run build` on your development machine.

## Verified
- TypeScript `tsc --noEmit` passed.
- Portrait, image fallback, and 55 rival mapping checks passed.
- Multi-AI, Ghost Race, CFOP, difficulty, Hero Journey, and landing tests passed.
- 20 WebP files verified with transparent alpha; total size approximately 0.9 MB.

## Build environment limitation
The original bundled dependency set contains Windows-specific binaries; this Linux environment cannot complete the Vite production build without a clean dependency installation. This update introduces no new npm dependencies. Browser performance depends on initial network/device conditions; image changes after assets have been fetched/cached should be effectively immediate.
