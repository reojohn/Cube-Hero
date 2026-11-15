CUBEHERO — CORRECTED MAIN LAUNCHER ICON PATCH
=============================================

Correction: Silver Moonkeeper is a selectable PLAYER AVATAR. This patch RESTORES
its original images exactly from your uploaded CubeHero_RaceAI_Tutorial_Source.zip.
The new blue Moonkeeper close-up art is used ONLY as application launcher icons.

Included:
- Restore original src/assets/player-avatars/silver-moonkeeper.webp
- Restore original src/assets/player-avatars/thumbs/silver-moonkeeper.webp
- Update WINDOWS installer icon + taskbar/window icon:
  windows-installer/assets/cubehero.ico
  windows-installer/assets/cubehero.png
- Update ANDROID app launcher icons: mipmap-mdpi through mipmap-xxxhdpi,
  legacy, round, and adaptive, plus an adaptive background drawable.
- Update PWA/iOS Home Screen/app icons and browser favicons:
  public/cubehero-app-icon-512.png
  public/cubehero-desktop-192.png
  public/apple-touch-icon.png
  public/favicon.png, public/favicon.ico
- Include resources/icon.png as a reusable high-resolution icon source.

NOT changed:
- CubeHero marketing/landing-page hero mascot logo, texts, or gameplay.
- Avatar preset IDs/names, race tutorial, or live installer files.
- Android signing key, app ID, versionCode, or any build configuration.

APPLY:
1. BACK UP your project before overwriting files.
2. Extract the ZIP into CubeHero_Phase1 preserving directories and allow replacement.
3. You MUST NOT reapply the earlier Silver Moonkeeper Avatar Changed Files patch,
   which incorrectly put this new image in the player preset.
4. Verify the Silver Moonkeeper preset looks like before in Settings / avatars.
5. Windows: run .\BUILD_CUBEHERO_WINDOWS.bat after tutorial source changes.
6. Android: keep your ORIGINAL release signing keystore, update Android versionCode
   to a higher number, then run .\BUILD_CUBEHERO_RELEASE.bat.
7. Run npm run build:web for the updated browser/PWA icons, then deploy.
8. Test updated launchers on Windows and Android; existing installs may cache
   icons. An app restart or shortcut refresh can be needed.

IMPORTANT: We did not have your full android/ or current Windows builder folder
in the latest source-only ZIP. This patch follows standard Capacitor Android
resource paths and the Electron builder file paths you previously used.
If your custom build scripts REGENERATE these resources, reapply icon files
after generation or adjust the script to use resources/icon.png; compare the
output BEFORE publishing the APK / EXE. Do not change signing key.

For new Android installs, icon changes should appear directly. For existing
installs, cached launcher icons might take time to refresh.
