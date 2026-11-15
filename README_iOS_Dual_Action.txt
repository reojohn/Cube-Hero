CubeHero — iPhone/iPad modal + scroll installation guide patch

Files changed:
- src/components/LandingPage.tsx
- src/components/LandingPage.css

Behavior:
- Clicking either iPhone / iPad installation button scrolls the underlying page to the iOS instructions and opens a compact three-step Safari installation modal.
- Close the modal with X, Got it, the View screenshot instructions button, clicking outside, or Escape.
- Closing keeps the page at the iOS image instructions below the main download section.
- Android direct APK, Windows direct EXE, iOS screenshot images, and macOS guide remain unchanged.
- Responsive on mobile: the modal scrolls internally on short screens.

Instructions:
1. Copy the files into your CubeHero_Phase1 folder, preserving paths and overwriting the existing TSX/CSS.
2. Run npm run build:web.
3. git add src/components/LandingPage.tsx src/components/LandingPage.css
4. git commit -m "Show iOS install popup and scroll to guide"
5. git push origin main

Note: iOS installs through Safari Add to Home Screen; this button does not download an IPA. Test behavior in a browser after Vercel deploys.
