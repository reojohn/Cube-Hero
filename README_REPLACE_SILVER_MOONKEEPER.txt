CubeHero — Silver Moonkeeper player avatar image update

This patch updates ONLY the selectable Silver Moonkeeper player-avatar preset.

Replaced images:
- src/assets/player-avatars/silver-moonkeeper.webp (640x640)
- src/assets/player-avatars/thumbs/silver-moonkeeper.webp (160x160)

Both assets are prepared from the newly selected close-up Moonkeeper artwork.
The preset name and stored ID remain exactly the same, so existing players who chose this preset will see its updated art automatically after they update the app.

How to apply:
1. Extract this ZIP into CubeHero_Phase1 and replace both matching files.
2. Run: npm run typecheck
3. Run: npm run build
4. Test avatar selection in Settings and the small avatar previews.
5. Rebuild Android APK and Windows installer using your existing official signed release scripts if you want this art in the downloadable native apps.
6. For website deployment, run npm run build:web and git commit/push the two image files.

This does not change the CubeHero app launcher icon, landing-page hooded mascot logo, or game logic.
