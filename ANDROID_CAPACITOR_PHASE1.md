# Cube Hero — Android Capacitor Phase 1 (from Phase1(9))

This patch **prepares the project for Android**. It does not contain an APK or generated Android Studio folder because installing Capacitor and native Android/Gradle dependencies requires the npm registry and Android SDK. Do the one-time setup on your Windows PC. Your website and the game remain in the same React + Vite source tree.

## What is implemented

- `capacitor.config.json`: **Cube Hero** app, `dist` offline asset directory, secure `https` local scheme, **provisional** Android ID `com.cubehero.speedcubing`.
- The Android WebView starts directly in the game at `/` (home page), bypassing the separate marketing landing page. Website URLs `/` and `/app` behave exactly as before.
- Native Android Back closes the menu, then VS/level-up overlays, and otherwise navigates to Race Setup or Home. If a physical solve is active, the **existing leave-race confirmation** still protects the session. Pressing Back on Home minimizes the app.
- The Settings Auto / Portrait / Landscape preferences use the native Capacitor Screen Orientation plugin on Android. Browser behavior is unchanged. The saved choice is reapplied on app launch.
- Existing bottom navigation already uses CSS safe-area insets. A minimal native-only style is included; no changes to the cube renderers, stopwatch timing, AI engine, or Ghost engine.
- All Vite-bundled scripts, CFOP worker, character images, and in-app data remain local to the APK. No remote `server.url` is configured. The native app's localStorage starts **separately** from the mobile website's data.

## Windows one-time preparation

1. Extract this patch into the **same CubeHero_Phase1 folder** as your current Phase1(9) project, replacing corresponding files and preserving your other project files.
2. Install **Node.js 22 LTS** and a current **Android Studio** with Android SDK (API 24+). Capacitor 8 recommends Android Studio 2025.2.1 or newer.
3. Open PowerShell or Command Prompt **inside** the CubeHero_Phase1 folder. Run (or double-click `setup android app.bat`):

   ```powershell
   npm run android:setup
   ```

   This installs compatible **Capacitor 8** packages (`core`, `android`, `cli`, `app`, `screen-orientation`), updates package.json/package-lock.json, builds the web app, creates `android/`, and syncs the native project. Internet is needed for the first run.

4. Open Android Studio:

   ```powershell
   npm run android:open
   ```

   Wait for Gradle sync (also needs internet the first time). Enable USB debugging on your Android phone, connect it, and click **Run** in Android Studio to test.

5. After any React/CSS/asset edit, run:

   ```powershell
   npm run android:sync
   ```

   `android:sync` always builds the website before updating the bundled files in Android.

6. A **debug APK** can be made in Android Studio via **Build > Build Bundle(s) / APK(s) > Build APK(s)**. Its usual path is `android/app/build/outputs/apk/debug/app-debug.apk`. This patch does **not** include a compiled APK.

## Before Google Play

- **Finalize the Android app ID** before distributing or submitting anything. `com.cubehero.speedcubing` is a provisional ID, not verified as available/owned. Changing it *after* distribution breaks in-place upgrades. On first generation, verify the final package ID and regenerate if necessary.
- Replace the default Capacitor launcher and native splash resources with Cube Hero branding (Android Studio Image Asset or official `@capacitor/assets`), check color contrast and scaling.
- Inspect Android 13–16 system bars, cutouts, navigation gestures, portrait/landscape and the keyboard. Locks on some new large-screen Android devices may be ignored by the OS.
- Test offline (Airplane Mode), cold launch, sleep/resume, 1.5s hold/release timer, inspection countdown, all AI tiers/multi-AI, Ghost, long practice sessions, avatar uploads, audio permissions, and low-memory devices.
- Native progress is local on the app's WebView origin and **does not automatically migrate** from the browser or cloud. Clearing app data/uninstalling can delete it; add backup/export before broad release if important.
- Run `npm run typecheck`, `npm run test:capacitor`, `npm run test:landing`, `npm run test:ghost`, `npm run test:multi`, and `npm run test:vercel` after npm packages are installed.

## Release separation

- Keep the web deployment workflow (`npm run build` / Vercel) as-is. **Do not** point Capacitor at your Vercel URL via `server.url`; that would break offline playback and create a fragile always-online wrapper.
- Capacitor's `android/` folder contains genuine native source files and should be committed in your own repository after generation. `.gitignore` ignores only generated Android build/cache files and local signing secrets.
- iOS can be added in a later phase on a Mac with Xcode by installing `@capacitor/ios@8` and using `npx cap add ios`.

Official documentation: https://capacitorjs.com/docs/android , https://capacitorjs.com/docs/apis/app , https://capacitorjs.com/docs/apis/screen-orientation
