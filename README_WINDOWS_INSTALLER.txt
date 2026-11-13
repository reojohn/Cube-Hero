CUBEHERO WINDOWS v1.0.0 -- DESKTOP EXE BUILDER

Purpose
-------
Creates CubeHero-v1.0.0-Windows-Setup.exe for Windows 10/11 (x64).
Players click a direct link on the landing page to DOWNLOAD the installer,
then RUN it once to install CubeHero. It opens as its own desktop app and runs offline.
No browser menu, PWA prompt, or browser account is required for players.

Setup (on your Windows development computer)
-------------------------------------------
1) Back up CubeHero_Phase1.
2) Extract this ZIP into CubeHero_Phase1. No existing project files need to be replaced.
   Keep the new windows-installer/, scripts/ and BUILD_CUBEHERO_WINDOWS.bat.
3) Open PowerShell inside CubeHero_Phase1 and run:
      .\BUILD_CUBEHERO_WINDOWS.bat
   It will build the latest game, install Windows packaging dependencies (first run),
   and create the Windows installer.
4) The finished EXE should be at:
      release-downloads\CubeHero-v1.0.0-Windows-Setup.exe
5) Test first launch, AI race, Ghost Race, achievement popups, local record saving,
   and full OFFLINE startup with Wi-Fi disconnected after installation.
6) Upload the EXE here. We will attach the landing page's PC/Laptop button
   DIRECTLY to the installer download, while preserving your Android APK.

Important
---------
* Electron installs from the network only on your development PC during the build.
  The final installer contains a full offline game.
* The desktop app uses its own local storage. Website/Android records don't
  automatically migrate to Windows.
* It is not digitally signed. Windows SmartScreen or browsers may warn that the
  publisher is unknown. Do not claim the file has been verified or certified.
* Do not put the EXE or APK in public/. Keep releases in release-downloads/.
* The installer is Windows x64. Mac/iOS installers are not included.
* Nothing in this patch changes the Android Capacitor build or PWA website.
* If the first build fails because the Windows packaging tools cannot download,
  re-run when online or share the error screen.
