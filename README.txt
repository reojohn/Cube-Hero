CubeHero landing-page scroll smoothness patch
12 Nov 2026

Files changed:
  src/components/LandingPage.css

Analysis of the uploaded/latest poster-based landing page:
  - Sticky navbar applied 24px backdrop-filter/saturation to every passing section.
  - The 768px transparent mascot continuously animated while using a broad drop-shadow.
  - Large hero halo animated wide 90-125px shadows.
  - Several decorative cards and the download section repeated unnecessary backdrop filtering.
  - Academy showcase cube continued animating offscreen.
  - All below-the-fold sections painted despite being static and offscreen.

Patch approach:
  - Keep visual theme and layout with nearly opaque dark sticky header.
  - Remove costly backdrop-filter from decorative layers.
  - Keep mascot and glowing halo visually present, but stop always-on motion.
  - Stop decorative Academy cube animation.
  - Defer offscreen paint using content-visibility where supported.
  - Avoid sticky hover transforms during touch scrolling.

NOT modified:
  - CubeHero game itself, Android build, gameplay mechanics
  - Race AI/Ghost posters and explanations
  - Play/download URLs, iOS/PC placeholders, game records
  - Hero artwork files, download APK, button ring/flash effect

Installation:
  1. Back up src/components/LandingPage.css.
  2. Unzip in the CubeHero_Phase1 root (overwrite the matching CSS file).
  3. Run npm run dev, or use your existing local start script.
  4. Hard-refresh the page (Ctrl+Shift+R) and test scrolling.
  5. Also compare after npm run build && npm run preview; Vite dev and
     browser extensions can affect perceived scrolling smoothness.

This is a targeted improvement based on inspecting styles, not a measured
frame-rate guarantee on your computer. If stutter persists after these
changes, collect a Chromium/Edge Performance recording to identify the
remaining hotspot before removing other features.
