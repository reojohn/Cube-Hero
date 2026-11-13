CubeHero Windows direct-download patch

What this updates
- Changes the PC / Laptop button to download CubeHero-v1.0.0-Windows-Setup.exe directly.
- Stages BOTH official installers (Android APK and Windows Setup) into dist-web/downloads during npm run build:web.
- Keeps installers out of public/ so Android builds stay clean.
- Updates landing-page copy and FAQ for the Windows direct download.

Apply
1. Extract this patch into your CubeHero_Phase1 folder.
2. Allow file replacement.
3. Make sure release-downloads contains:
   - CubeHero-v1.0.0-android.apk
   - CubeHero-v1.0.0-Windows-Setup.exe
4. Run: npm run build:web
5. Deploy to Vercel.
6. Test the PC / Laptop button on the live landing page.
