# Cube Hero — Rival Select Arena · Phase 2.5

## Design direction

The existing original Cube Hero hooded-rival art has been expanded into **55 code-drawn, layered, fully scalable SVG characters**, and the Roster / Featured Challenger presentation has been updated. No PNG assets, AI-generated portraits, image download service, remote dependencies, or sprite sheets are required.

## Character design features

- 11 hand-shaped curved helmet / hood silhouettes, five distinct eye-expression families, seven chest/shoulder armor constructions, eleven ornaments/headsets/fins/crowns/hair styles, five faceplate treatments and five energy variations. Every Sub-6 through Sub-60 rival has its own unique silhouette-and-eye pairing.
- Signature overrides give Zenith an apex crown, Astra celestial trim, Nyx phantom ears, Orion an orbit sensor, Kairo lightning fins, Veyra an oracle circlet, Vanta a technician headset, Kaela falcon wings, Ryuu a dragon plume, Ember a flame and other recognizable details.
- Multiple gradient fills, mask sculpting, contrasting outer hood trim, eyes with highlights and brows, cloth folds, insignia, neck clasp, subtle rune shapes, and atmospheric rings.
- Legend stays warm gold; Master violet; Expert cyan/blue; Challenger teal; Rising pink/coral. All are coordinated with their selection controls.
- Compact roster cards use legible bust silhouettes; selected character receives extra detail, floating light, orbit effects, illuminated stage and a signature motif label.
- Hover scale, card shimmer, selected-card border and transition effects respect system `prefers-reduced-motion` and Cube Hero's `.reduce-motion` setting.
- Responsive desktop and phone layouts retained; tested at 1440px, 390px and 320px.

## Source changes

- `src/components/RivalAvatar.tsx`: NEW reusable, fully hardcoded SVG renderer and deterministic visual DNA; shared by roster and preview.
- `src/components/RivalSelect.tsx`: replaced PNG-aware artwork fallback with the new renderer and enhanced featured character treatment. Search, category filters, Quick Picks, previous/next, and selected tier still work as before.
- `src/components/RivalSelect.css`: Phase 2.5 lighting, animation, proportion and mobile refinements.
- `src/lib/rivals.ts`: clarified ownership of character identity and refreshed Rising secondary accent color. Timing and other identities untouched.
- `scripts/test-rival-art.mjs` / `package.json`: introduced `npm run test:art` for identity uniqueness, variant ranges, signature overrides, markup output and zero raster dependencies.
- `RIVAL_SELECT_PHASE2.md`: now redirects to this phase.

## What was preserved

Difficulty Sub-6 through Sub-60, 55 names/mottos/titles, selector UI, AI personality, one to ten independent AI rivals, shared scramble, CFOP engine, inspection, timer, Ghost Race, Academy, Hero Journey, stats, and local data. This is a **presentation-only** redesign.

## Verification

Run `npm install`, `npm run typecheck`, `npm run test:art`, `npm run test:multi`, `npm run test:ghost`, `npm run test:journey`, and `npm run build` on your local development machine.

During preparation here, TypeScript, artwork checks, CFOP, difficulty levels, multi-AI, Ghost Race, Hero Journey, and landing checks passed. The separate legacy `test:ai-preload` assertion **also fails in the unchanged Phase 1 baseline** (cache-reuse assertion); this patch does not modify the AI prefetch engine. A full Vite production build could not run from the uploaded `node_modules` because it contains Windows-native Rollup/esbuild optional dependencies and this environment runs Linux, without external network package access. A fresh local `npm install` installs the appropriate binaries for the target platform.

> The old `scripts/install-rival-art.py` and `src/assets/rivals/*.png` are no longer needed or referenced. The former importer and empty asset folder were omitted from the full-project export. If updating an existing folder using changed files only, old artwork files remain on disk but are not used or deleted.
