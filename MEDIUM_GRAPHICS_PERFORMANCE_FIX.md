# CubeHero — Medium Graphics + Android Timer Fix (12 November 2026)

## Why Medium was almost as laggy as High

The previous Medium renderer still kept 26 fully 3D cubies, each with six separate faces, moving the same full 3D scene as High. Removing decorative stickers alone did not meaningfully reduce the 3D composition cost on a low-spec Android WebView.

## What is different in this update

- **Low**: untouched. Only 27 colored 2D sticker elements arranged on three CSS 3D planes, with no physical rotations. The verified solution state is still shown at every real move boundary.
- **Medium (rebuilt)**: three stationary 3×3 faces with 27 stickers; only the actively turning physical slice (typically nine cubies) is built in 3D. Every moving cubie keeps its colored exterior faces and its opaque cut-side surfaces so physical rotations still occur. Normal turns need ~30 animated 3D face elements instead of High's permanent 156 faces (plus 54 stickers). A real CSS rotation animates through six stepped poses per move instead of continuously re-rendering the larger scene. Actual angles, verified sticker positions, and timings come from the same scramble-specific solution.
- **High**: the existing complete 26-piece renderer is retained on desktop and mobile.
- **Android timer display**: on Medium and High, stopwatch **text painting** is budgeted to about 30 Hz (rather than requesting 60 updates per second while the GPU turns the cube). Low retains its previous full-refresh timer display. All three still calculate their official player, AI, and Ghost times from `performance.now()`; the recorded solve times and finish conditions are unchanged. Multiple stopwatch displays share one frame scheduler.
- Works in **Race AI** (including the featured rival in multi-AI races) and **Ghost Race**, portrait and landscape. Graphics preferences remain saved. Personal bests, XP, achievements and records are unaffected.

## Installation — CHANGED FILES ZIP (easiest)

1. **Back up** your working CubeHero folder.
2. Extract the `CubeHero_Phase1` folder from this ZIP and merge it over your existing `CubeHero_Phase1` folder. **Overwrite matching files**; do not remove original files, `node_modules`, or `android`.
3. Open PowerShell inside your CubeHero project root (the folder with `package.json`).
4. Rebuild web assets and synchronize Capacitor:
   ```powershell
   npm run android:sync
   ```
5. Build a fresh debug APK:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```
6. APK path: `android\app\build\outputs\apk\debug\app-debug.apk`. Install that newly generated APK and compare Low / Medium / High.

**Important:** Running Gradle without `npm run android:sync` first can embed the OLD web frontend in the APK.

## Full-source archive

Includes the whole project source, Android project, and artwork, but intentionally excludes platform-specific `node_modules`, generated `dist`, previous APKs, and build caches. Run `npm install` when using this as a new checkout.

## Verification and limits

TypeScript typecheck passed. Passed graphics geometry/timing tests, Android stopwatch scheduling tests, Android/mobile rendering checks, Ghost and multi-AI tests, CFOP/AI timing tests, and Capacitor configuration tests. Actual smoothness must be judged on a low-spec Android handset: this environment cannot execute Android GPU/WebView measurements, and the copied Windows dependencies lack Linux-native Rollup, so a full Vite/Gradle build has not been run here. On Windows, `npm run android:sync` compiles with your own installed dependencies.
