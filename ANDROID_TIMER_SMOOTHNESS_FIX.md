# CubeHero — Android stopwatch smoothness fix (Nov 11, 2026)

**Apply after** `CubeHero_Android_Race_Lag_Fix_Changed_Files.zip` (the previous Android performance patch), using the same CubeHero project folder. This archive includes **changed files only**; it is not a full replacement project.

## Why the cube looked smooth but clocks appeared delayed

The Android stopwatch text was updated by a **shared 55 ms interval** (only ~18 visual updates per second), while the physical AI/Ghost cube slices could animate at the screen refresh rate. The underlying race timing was already computed from `performance.now()` and was not counting interval ticks, but the *visible* digits appeared choppy or late.

## Change

- Replaced the Android 55 ms text interval with **one shared `requestAnimationFrame` scheduler** for every visible player, AI and Ghost timer. In one-vs-one and Ghost races, the digits can repaint every screen frame (typically up to ~60/s on a 60 Hz device), if Android's main thread has capacity.
- For large multi-AI races with **more than four clocks**, redraws are throttled near **30/s** to reduce text/layout costs, while keeping each displayed value tied to the actual elapsed clock.
- Clocks resume immediately with actual elapsed time after the Android WebView returns to the foreground; unused animation frames and listeners are cleaned up when the timers stop.
- **No changes to** authoritative race timing, starting/stopping, inspection rules, AI target times/CFOP timing, cube turns, Ghost qualifying data, visuals, desktop rendering or other pages.

## How to apply and build on Windows

1. Extract this ZIP into the **root** of your existing `CubeHero_Phase1` project. Preserve its `src/` and `scripts/` paths; approve overwriting `src/components/LiveTimerText.tsx` and test files. The new `src/lib/mobileClockScheduler.ts` should be added.
2. Open PowerShell in `CubeHero_Phase1`, then run:

   ```powershell
   npm run android:sync
   cd android
   $env:JAVA_HOME = 'C:\Program Files\Java\jdk-23'
   $env:Path = "$env:JAVA_HOME\bin;$env:Path"
   .\gradlew.bat assembleDebug
   explorer .\app\build\outputs\apk\debug
   ```

3. Transfer `app-debug.apk` to your Android phone and update the installed app using the same debug signing key.
4. Compare player/AI clocks during a **1-AI race**, **Ghost duel** and **5–10 AI race**, ideally with the cube visible. If the digits still freeze for large intervals, the next step is on-device WebView performance profiling, not changing solve targets.

## Local verification

- TypeScript `tsc --noEmit`: passed.
- Scheduler virtual-clock tests (single shared rAF, frame updates, 7-rival rendering budget, pause/resume, cleanup): passed.
- Existing AI/Ghost/Android race regressions: passed.
- Full Vite production build: **not verified in the Linux container** because the extracted `node_modules` came from Windows and lacks the Linux-specific Rollup optional dependency. `npm run android:sync` on Windows will execute the project's real production build and copy it into Capacitor.
- Actual phone FPS/latency: **not measured**, so improved perceived smoothness is expected but not guaranteed.
