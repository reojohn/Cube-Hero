CUBEHERO - iPhone / iPad Home Screen Install (free PWA) - CHANGED FILES ONLY

What changed:
  src/components/LandingPage.tsx  - Enable iOS button in both download areas and add compact Safari install guide
  src/components/LandingPage.css  - iOS button and compact guide styling, retaining latest larger Windows guide screenshots
  src/main.tsx                  - Register website offline cache on iPhone/iPad game entry (native Android remains excluded)
  index.html                    - Apple Home Screen metadata; existing icon + manifest preserved

No new installer, .ipa, signing key, Windows EXE or Android APK required.

HOW TO APPLY:
1. Back up CubeHero_Phase1.
2. Extract these four files into CubeHero_Phase1, preserving the folder structure.
3. Your existing public/cubehero.webmanifest, public/apple-touch-icon.png,
   scripts/generate-desktop-pwa.mjs, src/lib/registerDesktopPwa.ts and
   release-downloads/CubeHero-v1.0.0-android.apk must remain in place.
4. Run: npm run build:web
5. Push source files: git add index.html src/main.tsx src/components/LandingPage.tsx src/components/LandingPage.css
   git commit -m "Enable CubeHero iOS Home Screen installation"
   git push origin main
6. After Vercel reports Ready, visit the public landing page from Safari on an iPhone/iPad.
   Tap iPhone/iPad -> Install via Safari to see directions.
   In Safari: Share -> Add to Home Screen -> Open as Web App -> Add.
   Open CubeHero online once before trying offline mode.

IMPORTANT:
- iOS does not allow a web button to start a PWA install automatically; the Safari steps are mandatory.
- This is a website-based Home Screen app, not a native App Store IPA.
- Offline availability depends on first-time game asset caching and the device retaining the cache.
- No full iOS device/offline validation was possible here; test on a physical iPhone or iPad.
