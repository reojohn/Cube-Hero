CubeHero: Windows installation guide below the Download buttons

Changed files only:
  src/components/LandingPage.tsx
  src/components/LandingPage.css
  public/landing/windows-smartscreen-more-info.png
  public/landing/windows-smartscreen-run-anyway.png

No installers, lockfiles, or build config have been changed.

How to install:
1. Extract the ZIP directly into your CubeHero_Phase1 project folder.
2. When prompted, replace LandingPage.tsx and LandingPage.css.
3. Run: npm run build:web
4. Commit and push the source and screenshot changes to GitHub. Vercel will rebuild.
5. On the live landing page scroll to All downloads / Download section. The compact 2-step Windows guide will be below the download panel, with image previews that open at their natural size. The hero also has a direct scroll link to that guide.

Notes:
- The guide describes the SmartScreen warning honestly as a result of an unsigned build.
- Users are asked to verify the release and only proceed if they trust the installer.
- Existing Windows direct GitHub Releases link and Android APK download remain unchanged.
- The original screenshots' inner blank teal space is preserved; only the outside desktop background of the first screenshot was cropped.
