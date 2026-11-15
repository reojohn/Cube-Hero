CubeHero — Illustrated Apple Installation Modal (Changed Files Only)

This patch changes only:
  src/components/LandingPage.tsx
  src/components/LandingPage.css

It assumes you already applied the previous Apple screenshot patch and have these assets:
  public/landing/cubehero-ios-share-step.webp
  public/landing/cubehero-ios-add-to-home-screen-step.webp
  public/landing/cubehero-macos-add-to-dock-step.webp

What changed:
- Clicking iPhone/iPad still scrolls to the Apple installation guide behind the modal.
- The modal now shows BOTH the iPhone/iPad and macOS guides with all three images and step-by-step text.
- Both sections reuse exactly the same content as the guides below the Download section.
- The modal scrolls vertically on phones and tablets; images retain their aspect ratio and are not cropped.
- Closing the modal reveals the Apple guide on the page.
- Android APK and Windows EXE buttons are unchanged.

To apply, extract this ZIP over CubeHero_Phase1, preserving folder structure.
Then run:
  npm run build:web
  git add src/components/LandingPage.tsx src/components/LandingPage.css
  git commit -m "Show Apple screenshots in installation popup"
  git push origin main

Test the popup at mobile widths. Click both image previews to enlarge.
