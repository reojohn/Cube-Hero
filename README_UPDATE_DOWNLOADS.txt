CUBEHERO — OFFICIAL v1.0.0 INSTALLER REPLACEMENT — NOVEMBER 15 2026
========================================================================

This package updates the VERCEL ANDROID APK and the landing-page links.
It does NOT include the 142 MB Windows EXE, which must be replaced as a
GitHub Release asset using the newer EXE you built on your laptop.

INCLUDED FILES
  release-downloads/CubeHero-v1.0.0-android.apk
      New signed Android installer, 30,820,280 bytes
  src/components/LandingPage.tsx
      New Android and Windows download URL cache-busting tokens.
      Existing iOS modal + Windows + Apple guides are preserved.

NEW UPLOADED INSTALLERS: SHA-256 VERIFICATION
  ANDROID APK: 774531C41573922502B35B75FBC9C2E1A7CC244B444324C93B3118D88C4162BA
  WINDOWS EXE: 9C7E38F24524C87413C53F54A354B808D6C779F0E3A0C6D388FA058ABBA9173C

STEP A: APPLY ANDROID + LANDING PAGE
  1. BACK UP existing CubeHero_Phase1/release-downloads/ APK and
     src/components/LandingPage.tsx if desired.
  2. Extract this ZIP into CubeHero_Phase1; overwrite matching files.
     Do not move the APK into public/.
  3. In PowerShell, run from the project directory:
       Get-FileHash .\release-downloads\CubeHero-v1.0.0-android.apk -Algorithm SHA256
     Confirm the hash equals the ANDROID SHA-256 above.
  4. Run:
       npm run build:web
     The site build must stage /downloads/CubeHero-v1.0.0-android.apk.

STEP B: REPLACE THE EXE ON GITHUB RELEASES (DO NOT GIT-COMMIT EXE)
  1. Go to https://github.com/reojohn/Cube-Hero/releases/tag/v1.0.0
  2. Click Edit (pencil icon) for that release.
  3. Remove ONLY the old "CubeHero-v1.0.0-Windows-Setup.exe" asset.
  4. Upload the NEW release-downloads/CubeHero-v1.0.0-Windows-Setup.exe
     from your Windows laptop (your Nov 15 build), same filename.
  5. Wait until upload finishes, then click "Update release".
  6. Download the EXE from the Release and verify SHA-256 matches above.
     If you cannot edit the old release or immutability blocks changes,
     use a new release/tag and update the page URL to the new tag instead.

STEP C: PUBLISH WEBSITE UPDATE TO GITHUB / VERCEL
  After the GitHub Release asset is updated:
       git add src/components/LandingPage.tsx
       git add -f release-downloads/CubeHero-v1.0.0-android.apk
       git diff --cached --stat
       git commit -m "Update official Android and Windows downloads with Race AI tutorial"
       git push origin main

  Vercel should rebuild using npm run build:web and dist-web as output.
  Check Vercel project Ready and the LIVE Android and PC download buttons.
  Avoid git add . unless the Windows installer and generated folders are
  properly ignored; files above are the only required additions.

WARNINGS
  - Do not upload the EXE into Vercel, dist-web, or public/; upload to GitHub
    Release > Assets, NOT to ordinary Git repository files.
  - Keep existing Android signing keystore and correct versionCode.
  - ZIP extraction does not update installed copies; users install the new
    APK/EXE from their normal download links.
  - Both versions still display v1.0.0 as requested.
  - Website instructions and download styling are unchanged.
