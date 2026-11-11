CubeHero — Desktop VS layout restoration

Changes:
- Restores classic, balanced 1v1 desktop VS presentation with square preset character artwork.
- Keeps custom uploaded selfies in the circular photo frame.
- Limits card height to viewport, leaving the quote, progress bar, and Back/Enter controls unobstructed.
- Removes the visible INTRO SOUND ON/OFF text from the footer.
- Keeps the actual cinematic audio in Settings, and preserves other game sounds.
- No changes to mobile portrait/landscape VS layouts, multi-AI intro, game logic, avatars or timing.

Verification: TypeScript, VS intros, audio, avatar presets, profile, multi-AI, Ghost, Solo, mobile cube, and Vercel readiness passed.
Browser preview (1440x900, 1696x850, 1280x700): no horizontal overflow and footer within viewport.
Full Vite production build not verified on Linux (source ZIP dependencies have Windows-native Rollup binaries).

Installation: merge files into the folder containing your package.json, run `npm run build` on Windows, then commit and push to GitHub.
