CubeHero: GitHub Releases for Windows / Vercel for Android + website

PREPARE: First publish GitHub Release v1.0.0 at:
  https://github.com/reojohn/Cube-Hero/releases/new
  Tag: v1.0.0  | Release name: CubeHero v1.0.0 - Windows
  Upload from your local PC:
    release-downloads/CubeHero-v1.0.0-Windows-Setup.exe
  Publish Release (not just Save Draft).
  Confirm the asset is downloadable without logging into GitHub.

Then apply this ZIP to CubeHero_Phase1, overwriting matching files.
Run in PowerShell or CMD from the project folder:
  node scripts/protect-windows-installer.mjs
  npm run build:web

IMPORTANT: This patch expects you already have the current CubeHero project files and
release-downloads/CubeHero-v1.0.0-android.apk, as in the prior clean APK update.

The updated Windows download button uses:
https://github.com/reojohn/Cube-Hero/releases/download/v1.0.0/CubeHero-v1.0.0-Windows-Setup.exe

The EXE MUST NOT be uploaded as a normal repository file (GitHub rejects >100 MiB).
The update keeps your local EXE for rebuilding if needed, but website build stages ONLY Android APK.
The PWA offline script, if already part of your project, remains unchanged.

Do NOT deploy the button before publishing the GitHub release, or Windows download will lead to 404.
Test the released link and Vercel website download on a PC before announcing public launch.

Note: Windows Setup is unsigned, which may trigger Windows SmartScreen / Unknown Publisher.
