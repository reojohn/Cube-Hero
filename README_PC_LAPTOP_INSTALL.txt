CUBEHERO v1.0.0 — PC / LAPTOP INSTALL UPDATE
============================================

WHAT THIS DOES
- Activates the existing PC / Laptop button in both landing-page download sections.
- On compatible Edge/Chrome browsers: requests a standalone desktop PWA install.
- If native prompt is unavailable: shows install instructions for Edge and Chrome.
- Adds CubeHero app icon and PWA manifest, with a Start-menu/desktop shortcut.
- Adds desktop offline caching when the player enters /app for the first time.
- Preserves Android APK links and leaves iOS as "Coming soon".
- No .exe is created: this is the free desktop browser-installed app route.
- Does not change existing CubeHero game rules, XP, records, or Android signing.

INSTALL PATCH
1. Back up the current CubeHero_Phase1 folder.
2. Extract this ZIP into CubeHero_Phase1. Merge folders and overwrite files.
3. Do NOT delete release-downloads/CubeHero-v1.0.0-android.apk.
4. Open PowerShell or CMD in your CubeHero_Phase1 folder and run:

      npm run build:web

5. For a local production-style install test, run:

      npm run preview:web

   Then open http://localhost:4188 in Microsoft Edge or Chrome.
   Click PC / Laptop on the landing page. If the browser doesn't show an
   installation popup, use the simple instructions in the on-page guide.

6. To test offline: install the app, open the installed CubeHero game while
   online, and allow the desktop files to finish caching. Then disconnect
   and reopen the desktop app. This is a PWA, so initial installation and
   first full offline cache require an internet connection.

7. Commit/push the changed sources to your repo so Vercel builds with
   npm run build:web and serves dist-web. Keep release-downloads/ in the repo.
   No new Android APK is needed for this landing-page/desktop update.

SAFETY / BUILD SEPARATION
- npm run build (Android) does not stage an APK, and never runs the desktop
  service-worker generator.
- npm run build:web stages the separate Android download and then generates
  dist-web/cubehero-sw.js for desktop installs.
- The service worker skips /downloads and does not precache APK, EXE or ZIP.
- Desktop caching starts after entering the game, not during scrolling on
  the landing page, to preserve the smooth-scrolling optimizations.
- iOS download remains unchanged and disabled.

FILES IN THIS PATCH
- src/components/LandingPage.tsx
- src/components/LandingPage.css
- src/main.tsx
- src/lib/registerDesktopPwa.ts (new)
- public/cubehero.webmanifest (new)
- public/cubehero-desktop-192.png (new)
- scripts/generate-desktop-pwa.mjs (new)
- index.html
- package.json
- vercel.json

NOTES
- A PWA is installed using Edge or Chrome; it is not a native Windows
  executable. It runs separately from browser tabs once installed.
- The browser may not offer the programmatic install prompt immediately;
  the guide provides the browser's native installation route instead.
