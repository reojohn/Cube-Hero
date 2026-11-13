CubeHero: Apple install instructions below the Windows SmartScreen guide
CHANGED SOURCE FILES ONLY (built on latest iOS PWA patch)

CHANGED FILES
- src/components/LandingPage.tsx
- src/components/LandingPage.css

WHAT WAS ADDED
- Separate Apple devices installation section directly below the existing Windows guide.
- Clearly labeled iOS/iPadOS instructions: Safari > Share > Add to Home Screen.
- Clearly labeled macOS instructions: Safari > File > Add to Dock (macOS Sonoma 14+).
- Readable compact, responsive two-card layout. Stacks on mobile.
- Offline cache guidance, plus an FAQ entry about Mac installation.

PRESERVED
- Both original SmartScreen screenshots, including their latest larger sizing.
- Android APK and Windows GitHub Release links.
- iPhone/iPad install button and existing iOS modal.
- Hero and landing page styling, game, achievement, and other platform flows.

HOW TO APPLY
1. Back up CubeHero_Phase1 before applying updates.
2. IMPORTANT: Apply the earlier CubeHero_iOS_PWA_Installation_Changed_Files.zip first if you have not done so; this patch is built on top of it.
3. Extract this ZIP into CubeHero_Phase1, keeping its folder structure and replacing the two source files.
4. In PowerShell/CMD from CubeHero_Phase1, run:
   npm run build:web
   git add src/components/LandingPage.tsx src/components/LandingPage.css
   git commit -m "Add iOS and macOS installation steps below Windows guide"
   git push origin main
5. After Vercel redeploys, inspect both PC and mobile layouts.

Apple documentation (installation steps):
https://support.apple.com/en-ca/104996
https://support.apple.com/en-hk/guide/iphone/iphea86e5236/27/ios/27

Notes: Mac installation uses Safari web apps and is not a native .dmg/.pkg build. Offline operation requires a successful online load and device caching.
