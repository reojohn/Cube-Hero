CubeHero v1.0.0 — CLEAN Official Android APK for Landing Page
=============================================================

VERIFIED APK
Original upload: CubeHero-v1.0.0-android(2).apk
Public download filename: CubeHero-v1.0.0-android.apk
Size: 30,894,063 bytes (29.46 MiB)
SHA-256: 587d4eed9a454098ff6cde54ceed2cf902cbd38f0faa419b38777f115fbd63a0
No other APK files are embedded in this Android package.
Achievement notification UI is present inside the app's bundled JS.

INSTALL IN CubeHero_Phase1
1. BACK UP your CubeHero_Phase1 project folder.
2. Extract the contents of this ZIP into the ROOT CubeHero_Phase1 directory.
3. Run .\APPLY_CUBEHERO_WEBSITE_UPDATE.bat in PowerShell (or double-click
   the batch file) to MOVE any old public/downloads APK to a backup folder.
4. Run: npm run build:web
5. Publish updated project including release-downloads/ to Vercel.
6. Test both Android buttons on the LIVE website and check file size.

IMPORTANT
* Keep the APK in release-downloads/, NEVER in public/downloads/.
* npm run build is for the Android app (dist/ output, no APK installer).
* npm run build:web is for Vercel (dist-web/ output, with APK download).
* Vercel is configured to run build:web and publish dist-web automatically.
* npm run dev serves the APK through a Vite middleware from release-downloads.
* prebuild / prebuild:web stops a future build if public contains an .apk file.
* This ZIP doesn't deploy automatically. Vercel must receive the new source
  and release-downloads/ file (e.g. via GitHub push or your Vercel deploy flow).
* Do not replace your existing signed APK with a different signature when
  installing updates over the same package on your phone.
* Full Android device testing is still required before public release.
