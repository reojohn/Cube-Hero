# Cube Hero — Batch 1 Rival Portrait Integration

**Starting point:** Cube Hero Phase 2.6 full project, preserving its existing race interface and game logic.

## Included
- 20 individual 512×512 transparent PNG portraits in `public/rivals/` from `Sub-6_Zenith.png` through `Sub-25_Suki.png`.
- Updated Rival Select to show these PNGs in the roster and the larger preview.
- Existing code-drawn vector avatars remain for Sub-26–60, plus on-image-error fallback for the first 20.
- Reduced duplicate effects in the featured PNG preview because the new art has its own halos and sparkles.
- Corrected the **visual division boundary** so Sub-21–25 belong to teal Challenger, matching the approved reference, instead of Sub-21–24 erroneously appearing as Expert blue. This does **not** change AI timing or game logic.

## Changed source files
- `src/components/RivalSelect.tsx`
- `src/components/RivalSelect.css`
- `src/components/RivalPortrait.tsx` (new)
- `src/lib/rivalPortraits.ts` (new)
- `src/lib/rivals.ts` (division palette boundary only)
- `public/rivals/Sub-6_Zenith.png` through `Sub-25_Suki.png`

## Next batch
Place additional PNGs in `public/rivals/` and add their exact names to `RIVAL_PORTRAIT_FILES` inside `src/lib/rivalPortraits.ts`. The site will automatically swap those rivals from SVG to PNG.
