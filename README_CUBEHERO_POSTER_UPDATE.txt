CubeHero Landing Page — Poster Showcase + Official APK Note
==========================================================

INSTALL
1. Back up your CubeHero_Phase1 folder first.
2. Extract this ZIP into CubeHero_Phase1 (not into an extra subfolder).
3. Allow Windows to replace:
   src/components/LandingPage.tsx
   src/components/LandingPage.css
   and add public/landing/*.webp
4. Run npm run dev (or restart the already running dev server).
5. Open http://localhost:5188 and press Ctrl + Shift + R.

CHANGES
- Replaces BOTH animated/paused race demo components with the two supplied posters.
- Adds three mechanics steps under each poster, plus launch-mode buttons.
- Adds 'Official CubeHero APK · Direct download from this site' above the
  Get Cube Hero card. This is an official-source note, not a malware-scan claim.
- Keeps the existing Android, iOS, PC, hero mascot, and app navigation intact.
- Uses WebP poster images: lazy loaded, mobile-size variants; no cube rendering.

NOTES
- The old src/components/LandingDuelCube.tsx (if it remains) is no longer
  imported by LandingPage.tsx. You can leave it in the folder; it won't run.
- This update does not change the Android APK or app features.
- If the Android APK download was previously working, it remains unchanged.
