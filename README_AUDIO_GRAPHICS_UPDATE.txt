CUBEHERO — AUDIO + GRAPHICS PREVIEW UPDATE — 2026-11-12
=======================================================

CHANGES
1. Game audio is enabled by default at 90% for new users.
2. Previously silent profiles that exactly match the old default
   (sound off at 55%, with normal sound categories enabled) are
   switched to the new louder default once. Personalized audio
   preferences are preserved. Users can still mute anytime.
3. Stronger local Web Audio mix with a peak compressor for louder
   phone-speaker cues. Device media volume remains the final limit.
4. VS matchup now has three cinematic sound beats (or two if motion
   is reduced). The setting can be disabled separately.
5. Graphics previews show the SAME Low/Medium/High cube renderers
   already used during live races, not three identical SVG drawings.
6. Each card has a separate 'Simulate turns' button. Demo uses a
   deterministic real cube scramble + inverse solution; replaying
   does not change selected graphics quality or save race records.
7. No network/audio files added. Native offline-first launch and
   the existing Capacitor configuration were intentionally unchanged.

INSTALLING THE PATCH-ONLY ZIP (RECOMMENDED)
1. Make a backup of your working CubeHero project folder.
2. Extract the ZIP into that project's ROOT folder (where src/ is).
   Choose REPLACE/OVERWRITE when prompted for the five src files.
3. Your original scripts/, Android project, build batch file,
   tsconfig, node_modules and other files remain untouched.
4. In PowerShell from the project root, run:
      npm run build
   If this succeeds, run your existing Android release build batch
   file (BUILD_CUBEHERO_RELEASE.bat) to rebuild the APK.
5. Install the updated APK, then test in airplane mode from the
   FIRST launch, as before. The original offline fix was preserved.
6. Test VS sound and each graphics mode's Simulate turns button.

ABOUT THE FULL SOURCE-ONLY ZIP
The uploaded source-only ZIP contained src/, public/, and selected
root files but not the complete original build setup (scripts/,
Android project, tsconfig etc.). It is an overlay to your full local
project, NOT a standalone Android or Vite project archive.

BROWSER SOUND RESTRICTION
Browser privacy rules generally block autoplay before a real tap
or key press. Sound is enabled in settings from first install, and
CubeHero unlocks audio at the user's first interaction. A website
cannot reliably play sounds on page load without user interaction.

VALIDATION PERFORMED
- Confirmed TypeScript/TSX syntax of modified source files.
- Confirmed exactly five original source files changed.
- Checked native offline routing and Capacitor config are unchanged.
- Could not run npm build in this environment because the supplied
  ZIP lacks full project configuration and dependency installation
  did not complete. Please run npm run build in your working folder.
