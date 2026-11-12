CubeHero — Achievement Unlock Toast Patch
=========================================

Included files:
  src/App.tsx
  src/lib/achievementNotifications.ts
  src/lib/gameAudio.ts
  src/components/AchievementToast.tsx
  src/components/AchievementToast.css

Installation:
1. Back up your current CubeHero_Phase1 folder.
2. Extract this ZIP into the CubeHero_Phase1 folder (merge src and overwrite the matching files).
3. Run npm run dev (or restart your running Vite server), then Ctrl+Shift+R in the browser.
4. To test: earn an achievement you have NOT already earned. New achievements
   show at the top-right for 5 seconds; multiple unlocks queue one-by-one.
5. For a public website or updated Android APK, rebuild the corresponding app.

Behavior:
- Minecraft-inspired notification style, original CubeHero graphics and original chime.
- No new XP system or changes to how achievements are awarded.
- Existing unlocked achievements do not replay on first startup or page reload.
- Respects sound on/off, audio volume, and reduced motion preferences.
- Notifications shown only inside CubeHero's game (/app and native app), not the landing page.
- New toast sound uses synthesized Web Audio and requires no external asset/internet.

QA completed:
- TypeScript syntax checks of changed TS/TSX files.
- CSS parsing check.
- Achievement transition tests: first solve, speed milestones, AI wins,
  no duplicate on sync or reload.

NOT fully verified: Complete Vite production build and physical Android visual test.
