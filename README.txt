CubeHero — Installation guides below download section (changed files only)

Changed files:
  src/components/LandingPage.tsx
  src/components/LandingPage.css

Based on the latest CubeHero Apple installation pictures patch. No image assets are replaced.
Keep these existing files in public/landing/:
  cubehero-ios-share-step.webp
  cubehero-ios-add-to-home-screen-step.webp
  cubehero-macos-add-to-dock-step.webp
  windows-smartscreen-more-info.png
  windows-smartscreen-run-anyway.png

Changes:
- Relocates Windows and Apple guides directly after the main purple Download showcase, before FAQ.
- Makes Windows screenshots larger, in two cards with instructional text above the images.
- Apple iPhone screenshots are displayed without crop and enlarge to ~420 CSS pixels each on desktop; stacked and full width on mobile.
- Mac illustration displayed at up to 920 CSS pixels wide, uncropped.
- Both Apple image links still open the full images in a new browser tab.
- Windows download button STILL opens the direct GitHub Release .exe URL using an ordinary hyperlink in a separate tab, AND smoothly scrolls the existing landing page to the Windows help guide.
  Note: browsers may briefly focus a new tab while starting the download; return to the landing-page tab to see the guide.
- iOS download button now smoothly scrolls to the inline iOS Safari guide instead of showing a redundant popup. Safari requires manual Add to Home Screen.
- Existing APK download button and Windows GitHub Release URL are unchanged.

Apply:
1. Extract into CubeHero_Phase1 and overwrite matching files.
2. npm run build:web
3. npm run preview:web
4. Test both buttons and check images on mobile and desktop.
5. git add src/components/LandingPage.tsx src/components/LandingPage.css
6. git commit -m "Improve installation guides and download navigation"
7. git push origin main

IMPORTANT: Since github.com is cross-origin and the installer download is hosted there, normal browser security/download restrictions apply. An anchor opens the direct asset URL in a new tab to keep the landing page available for the guide; direct download still depends on GitHub Release serving the file.
