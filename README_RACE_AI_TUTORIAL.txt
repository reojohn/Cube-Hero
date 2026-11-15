CubeHero — Interactive First-Use Race AI Tutorial (source-only patch)

CHANGED FILES
src/App.tsx
src/components/RaceRoom.tsx
src/components/RivalSelect.tsx
src/components/RaceOnboardingTour.tsx  [NEW]
src/components/RaceOnboardingTour.css  [NEW]

WHAT IT DOES
- Seven-step interactive tour: Home Set Up a Race -> Race AI Customize ->
  Choose challenger -> AI personality -> AI count -> Start Race -> Inspect.
- Four backdrop panels dim the rest of the screen while keeping the REAL control clickable.
- The explanatory bubble and highlight follow the actual controls with automatic scrolling.
- The tour hides during the VS transition and resumes in the arena.
- The final Inspect step waits for the AI/CFOP solution to be ready before a click.
- First-use-only status stored in localStorage under cube-hero-race-ai-tour-v1.
- Skip Tour and Escape mark the tour as done. Replay from Settings > Experience.
- Works on mobile with smaller tooltips and honors reduced motion.
- No gameplay timer, algorithms, achievements, XP, APK or website files changed.

HOW TO APPLY
1. Back up your CubeHero_Phase1 folder.
2. Extract this ZIP into CubeHero_Phase1, preserving the src/ folder layout.
3. Allow replacement of the three existing .tsx files; add both new tutorial files.
4. In PowerShell at CubeHero_Phase1 run:
   npm run typecheck
   npm run build
5. Test locally with npm run dev, then deploy your usual website build:
   npm run build:web
   git add src/App.tsx src/components/RaceRoom.tsx src/components/RivalSelect.tsx src/components/RaceOnboardingTour.tsx src/components/RaceOnboardingTour.css
   git commit -m "Add first-use Race AI interactive walkthrough"
   git push origin main
6. Test a NEW browser profile/private tab or choose Settings > Replay tutorial.

NOTE
The patch changes React source only; deployed website/PWA rebuild picks it up.
Android APK and Windows EXE remain as previously released until you rebuild their installers.
Your stored race data and preferences remain unchanged.

VALIDATION
The 4 TSX files passed TypeScript syntax-transpilation checks and all 7
spotlight target attributes were verified. A full npm build couldn't run in
this environment because npm dependencies weren't available for installation.
Run 'npm run typecheck' locally before deploying.
