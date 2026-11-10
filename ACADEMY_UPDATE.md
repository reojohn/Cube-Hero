# Cube Hero Academy — Interactive Learn Page

The original text-only Learn screen has been replaced with **Cube Hero Academy**.
The existing AI / Ghost Race, timer, inspection, and statistics modules are unchanged.

## Included features

1. **Academy overview:** Premium hero, six-lesson course map, progress tracking, and shortcuts.
2. **Notation lab:** A physical 3D Rubik's Cube that responds to R/L/U/D/F/B and normal/prime/double moves; undo/reset; move history.
3. **Guided CFOP lessons:** Cross, F2L, OLL, and PLL explanations, step-by-step checklists, and animated practice cases.
4. **Algorithm library:** Search and category filters, saved favorites, copy notation, physical 3D playback, speed selection (0.5×–2×), scrubbing, restart, play/pause, and next/previous move.
5. **Finger tricks:** Short practice drills with technique cues, adjustable animated demonstrations, and lookahead tips.
6. **Progress:** Mark a lesson complete, save favorite algorithms, and track notation turns. Information is stored locally under `cube-hero-academy-progress-v1` and remains separate from race history.

## Important about training examples

The demonstration cube starts in a legal state formed by reversing the chosen algorithm. It then carries out the exact moves. This proves that the animation reflects the algorithm's real physical effect. It is **not** a claim that the algorithm applies to every CFOP case or that a single short pattern solves any random scramble. Recognizing the right case is part of the lessons.

## Changed or added source files

- `src/App.tsx` — swaps the old LearnPage for the new Academy component.
- `src/components/Academy.tsx` — interactive Academy UI and controls.
- `src/components/Academy.css` — premium and responsive styling, scoped to Learn.
- `src/lib/academy.ts` — lesson content, algorithms, drills, demo plans, local progress validation.
- `scripts/test-academy.mjs` — content and cube-state regression test.
- `ACADEMY_UPDATE.md` — this document.

## Run and test

Double-click `start system.bat`, or use `npm run dev` after installing dependencies.

For pure-code tests:

```
node scripts/test-academy.mjs
npm run typecheck
npm run test:cfop
npm run test:multi
npm run test:ghost
```

No new npm dependencies are required.
