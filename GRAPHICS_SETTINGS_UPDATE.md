# CubeHero — Low / Medium / High Graphics (12 November 2026)

## What changed

Open **Cube Hero → Settings → Graphics Settings** and choose:

- **Low** — Three sticker faces (27 visible tiles). No physical turn animation: cube colors update at each real, scramble-specific move boundary. No continuous animation loop.
- **Medium** — All 26 physical cube pieces still rotate in their real slice. Each cubie keeps six solid sides, but the sticker colors are painted directly on the faces; no extra gloss/sticker elements, decorative glow or idle hover.
- **High** — Original high-quality turning cube, including all original sticker elements. Existing Android/mobile and desktop visuals stay as before.

Default: **High**. Choice persists under the existing `cube-hero-preferences-v1` local-storage key and is shared between **Race AI** (single and multiple rivals) and **Ghost Race**. This includes phone portrait/landscape and desktop.

**Only cube graphics are changed.** No change to scrambles, CFOP plans, AI difficulty, ghost personal bests, saved results, inspection, Stackmat hold, or timing. The lightweight cubes use `performance.now()` and the verified move-end timestamps; if a mobile browser delays a paint they catch up to the current real move. The independent Android stopwatch still draws using the shared animation-frame scheduler.

## Apply the changed-files ZIP to your existing Windows project (recommended)

1. Make a backup of the original CubeHero project folder.
2. Extract the changed-files ZIP and copy its `CubeHero_Phase1` contents **on top of** your existing `CubeHero_Phase1` folder, allowing Windows to replace matching files. Do not delete your original `node_modules` or `android` folder.
3. Open PowerShell in the project folder.
4. Run `npm run typecheck` and `npm run test:graphics` (optional but recommended).
5. Run `npm run android:sync` to compile the new web code and copy it into the Capacitor Android project.
6. Build the new APK:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```
   The output is `android\app\build\outputs\apk\debug\app-debug.apk`.
7. Install that new APK on Android, launch Cube Hero and select **Settings → Graphics Settings → Low**. Compare with Medium and High using the same type of race.

`npm run android:sync` is required: building a Gradle APK without compiling/syncing first may simply package the old web UI.

## For a clean/full-source checkout

`npm install` (requires internet), then use `npm run dev` for the website or the Android commands above.
The source-only archive intentionally excludes `.git`, `node_modules`, `dist`, Android build intermediates and the APK to avoid bundling hundreds of megabytes of Windows-specific binaries and stale compiled web assets.

## Validation

- TypeScript: `npm run typecheck` — passed.
- Graphics verification: `npm run test:graphics` — passed.
- Mobile 3D integrity: `npm run test:mobile-cube` — passed.
- Android stopwatch, opponent finish and page-performance tests — passed.
- Existing game logic and CFOP tests — passed.
- A new APK still needs to be built and tested on actual Android hardware. The extracted ZIP's Windows-only node_modules cannot run Vite's Linux-native bundling tool in this environment.
