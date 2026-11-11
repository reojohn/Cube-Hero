# CubeHero: Mobile Scramble Buttons & Tap Responsiveness

This patch is based on the user's `CubeHero_Phase1.zip` project.

Changes:
- **Race AI / mobile portrait:** New Scramble and I'm Scrambled — Inspect appear as two full-width, independently tappable buttons. The Inspect echo ring remains unchanged.
- **Mobile navigation and controls:** Faster CSS feedback, manipulation-friendly touch actions, and no page-level smooth scrolling during navigation.
- **App navigation:** Instant scroll-to-top; Hero Journey data synchronization occurs when real records/progress change instead of after each page visit. Ghost Race and Academy progress event listeners remain active.
- **Desktop and compact landscape:** Existing side-by-side scramble-action layout preserved.

Verification:
- TypeScript (`tsc --noEmit`): passed.
- `test-mobile-interactions.mjs`: passed.
- Multi-AI, Ghost Race, Solo Timer, Hero Journey, VS intro, local player tests: passed.
- Focused Chromium CSS layout test at portrait 320 and 390 pixels and landscape 667 and 844 pixels: passed without page overflow.
- Full Vite build was not run in this environment because its available dependencies came from a Windows-based ZIP and did not include the Linux Rollup native package; run `npm run build` on your Windows PC or review the Vercel build logs.

Install: Extract changed-files ZIP into the folder containing package.json, keeping subfolders. Then run optional `npm run typecheck` / `node scripts/test-mobile-interactions.mjs`, commit and push.
