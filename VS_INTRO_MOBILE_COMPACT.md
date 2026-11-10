# Cube Hero — Mobile VS intro compact/responsive polish

Changes are isolated to the presentation layer of the pre-race VS introduction:

- 1v1 VS fighter panels have bounded, compact height on phones; portraits no longer sit inside excessively tall empty columns.
- Tournament lineups use 2–3 columns depending on opponent count, with portrait height calculated from the mobile viewport and number of rows.
- 2–10 independent AI competitors still appear individually with VS separators, not as one team.
- Removed a duplicate, very long VS chain from *mobile visual display* (the full matchup remains available as an accessible label); the cards retain each VS separator.
- Compact header, captions, footer and touch-friendly Skip/Back controls; safe-area padding, no sideways overflow.
- Very short mobile screens can scroll vertically rather than hiding controls.
- No changes to timer/inspection start, five-second intro duration, selected difficulty, AI solve times, or racing logic.

## Updated files
- `src/components/VsIntro.tsx`
- `src/components/VsIntro.css`

## Suggested checks
- Mobile phone 320 × 568, 375 × 667, 390 × 844, and desktop.
- Both modes: one rival; 2, 3, 5, and 10 AIs.
- Reduced-motion option, Enter Arena Now, Back to setup, five-second auto transition.
