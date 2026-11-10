# Cube Hero Landing Page V1

This update adds a standalone promotional homepage to the existing React + Vite project without replacing or changing the game routes.

## URLs

- `/` — Premium landing page. Product features, how-to-play guide, FAQ, download section, and Play links.
- `/app` or `/app#/home` — The existing Cube Hero game. Game navigation still uses its original hash routes, for example `/app#/learn`.
- `/#/race`, `/#/practice`, etc. — Older root-level game links still open the game for backward compatibility.

## What is new

- Mobile-responsive hero with the existing Cube Hero mascot.
- Navigation, four feature sections, real feature counts, how-to-play guide, Academy preview, FAQ, footer.
- Real playable links to the existing game and its specific sections.
- Android release marked **Coming soon** (there is no APK or real download URL yet).
- Separate lazy-loaded bundles for the landing page and game; visitors to `/` do not have to load the 3D racing engine immediately.
- `vercel.json` SPA rewrites for `/app` so direct links work on Vercel.
- New `Visit website` link in game footer for returning to landing page.

## Testing

1. Run `start system.bat`, visit `http://localhost:5188/` — landing page.
2. Click Play — existing Cube Hero game opens at `http://localhost:5188/app#/home`.
3. Use the game and visit Ghost, Learn, Journey; make sure locally saved history remains.
4. Try `/app#/practice` directly and old `/#/practice` links.
5. Check mobile layout, navigation menu, and FAQ accordions.

**Important:** The mobile APK has not been created. The landing page intentionally contains no fake download link. When available, replace the Coming Soon display with the verified, signed release URL.
