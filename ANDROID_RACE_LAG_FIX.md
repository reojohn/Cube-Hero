# CubeHero — Android Race AI / Ghost performance patch (Nov 11, 2026)

This patch is based on `CubeHero_Phase1(20261111-093334).zip`. It contains **changed files only**. Merge the archive into your existing CubeHero project, preserving the `src/` and `scripts/` folder structure; do not replace your entire project.

## Changes

1. **No full-page React polling during Android races.** Previously the Race AI and Ghost pages re-rendered every 360 ms even though their live stopwatches and cube renderer were already independent. Android now updates those pages only at each AI/Ghost finish boundary, and when the player performs an action. Inspection still updates normally.
2. **Shared Android stopwatch cadence.** All live clock text nodes now share one 55 ms interval instead of each rival allocating its own interval. The time displayed is still computed from `performance.now()`; the timer tick count never determines solve time.
3. **Multi-AI clocks remain live.** Additional rivals use the independent lightweight stopwatch component on Android; their times no longer depend on full-page React updates. Finished clocks freeze at their own verified times.
4. **Background/resume catch-up.** When Android WebView resumes, the page refreshes immediately using the actual elapsed time so opponent status/results do not remain stuck.
5. **Preserved:** Solid 26-cubie geometry, CSS slice rotations and move timings, desktop renderer, all CFOP verification, Ghost storage, exact stop times and inspection penalty rules, 1.5s hold, AI personalities and rankings.

## Apply the patch

Extract the contents directly into the **root** of your CubeHero project. Allow Windows to overwrite the matching files under `src/` and `scripts/`.

## Rebuild and test the Android APK (Windows)

With Node.js and your Android SDK/Gradle setup already working:

```bat
npm run android:sync
cd android
gradlew.bat assembleDebug
```

The updated APK is at `android\app\build\outputs\apk\debug\app-debug.apk`.

Upload that newly generated APK to Google Drive, download/open it on your phone and install over your existing CubeHero app (the same debug signing identity is required for an in-place upgrade). You normally do **not** need to uninstall first; uninstalling would remove locally stored app data.

Test Ghost qualifying, Ghost duel, 1-AI race, multi-AI race and portrait/landscape. The stopwatch should continue updating and each rival should be marked finished at its actual target time. This patch passed TypeScript and source/timing regression checks but was **not measured on the physical Android phone**. More FPS investigation may be needed if the Android WebView's 3D CSS compositing itself remains the bottleneck.

## Source checks

```bat
npm run typecheck
node scripts/test-android-race-optimization.mjs
node scripts/test-android-finish-boundaries.mjs
node scripts/test-mobile-race-performance.mjs
node scripts/test-multi-ai.mjs
node scripts/test-ghost.mjs
node scripts/test-mobile-turning-cube.mjs
```
