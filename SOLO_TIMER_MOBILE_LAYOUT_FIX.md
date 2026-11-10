# Cube Hero — Solo Timer layout refinement (Nov 9, 2026)

## Fixes
- Use non-slashed, readable tabular numerals for the Solo Timer (no diagonal slash in zero).
- Keep timer digits centered and fully visible, including longer minute-formatted results.
- Prevent the Solo Timer's implicit grid and child controls from pushing the mobile page wider than the viewport.
- Condense mobile instructions, scramble spacing, timer pad, and the 2-column statistics area.
- Keep desktop presentation, Stackmat-style 1.5-second hold/release, inspection, penalties, and local solve history behavior intact.

## Files changed
- `src/components/SoloTimer.tsx`
- `src/components/SoloTimer.css`

## Installation
Copy changed files over your existing Cube Hero project root (where `package.json` lives). Preserve the `src/components` folder structure. No other files need replacement.

## Verification
- TypeScript passed.
- `npm run test:solo`, `npm run test:phase2`, `npm run test:multi`, `npm run test:ghost`, `npm run test:journey`, `npm run test:levelup`, `npm run test:profile`, and `npm run test:landing` passed.
- Static CSS visual tests in Chromium at 320, 375, 390, 430 and 1440 px; no horizontal overflow detected. Test spans included 0.00, 0.000, 59.99, 1:00.00, 1:00.000, and 10:00.000.
- The full React/Vite production build was not completed in this container because the supplied Windows dependencies omit the Linux Rollup binary. Verify `npm run build` locally.
