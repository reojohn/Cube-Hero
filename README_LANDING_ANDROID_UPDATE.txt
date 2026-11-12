Cube Hero landing page update - Android APK download + compact mobile layout

Changed: src/components/LandingPage.tsx, src/components/LandingPage.css,
package.json, vercel.json, vite.config.ts.
Added: releases/CubeHero-v1.0.0-android.apk, releases/.gitignore, scripts/stage-apk.mjs.

HOW TO APPLY
1. Back up your full CubeHero_Phase1 project folder first.
2. Extract this ZIP into the existing CubeHero_Phase1 project folder, merging
   folders and replacing matching files. Do not delete your existing scripts,
   Android project, .env files, tsconfig, or BUILD_CUBEHERO_RELEASE.bat.
3. Build the WEB landing page using: npm run build:web
   This copies the APK to dist/downloads/CubeHero-v1.0.0-android.apk.
4. Deploy the project to Vercel. vercel.json now sets buildCommand
   to npm run build:web and outputDirectory to dist. Check your Vercel
   Build & Development Settings if a dashboard override is configured.
5. Open https://<your-site>/downloads/CubeHero-v1.0.0-android.apk
   The browser should download the APK. Also test the Download for Android
   button on a phone, and check compact layout in portrait and landscape.

WHY THE APK IS NOT UNDER public/
Keeping an APK under public/ would make a normal Vite build copy it into
dist, and a future Capacitor build would bundle that old APK inside the app.
The release file stays in releases/, and only build:web copies it to dist.

ANDROID RELEASE BUILD
Run your original BUILD_CUBEHERO_RELEASE.bat as usual (npm run build).
This build does not include the APK download payload and leaves the offline
launch setup unchanged. Do not replace your installed APK with this ZIP.

IMPORTANT
This package links to the exact APK you uploaded, not a newly rebuilt APK.
If you rebuild Android later, replace releases/CubeHero-v1.0.0-android.apk
with the new build and update its version/name in the relevant files.

LOCAL TESTING
In npm run dev, the APK link is served directly from releases/.
For a production-style preview run npm run build:web, then npm run preview.

IF DEPLOYING FROM GITHUB
Commit/push the release APK as well as the code. Verify it is tracked:
  git status --short releases/CubeHero-v1.0.0-android.apk
If your main .gitignore hides *.apk, include it explicitly:
  git add -f releases/CubeHero-v1.0.0-android.apk
It is about 28 MiB, under GitHub's standard 100 MB individual-file limit.
