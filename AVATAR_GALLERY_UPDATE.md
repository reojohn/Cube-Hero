# CubeHero — Built-in Avatar Gallery Update

Based on the uploaded `CubeHero_Phase1(2).zip`.

## New behavior
- The original beige-hooded cube character you supplied is the default avatar.
- Ten new selectable, original fantasy cuber avatars in Settings → Local Player Profile.
- The avatar choice is automatically saved on the current device and synchronized between tabs.
- Upload-and-crop remains available. Your existing uploaded photo is NOT overwritten by selecting a built-in avatar; select "Your Photo" to reactivate it.
- Option to remove the saved uploaded photo from this browser.
- The chosen picture displays in the sidebar, header, AI/Ghost race UI, Race Results, Hero Journey and VS intros via the shared PlayerAvatar / LocalPlayerProvider.
- Both mobile and desktop supported; gallery adapts to portrait and landscape widths.
- 640 × 640 WebP portraits and 160 × 160 gallery thumbnails keep assets light. IDs, not large images, are stored in localStorage for presets.

## Changed/new source files
- package.json
- src/App.tsx
- src/lib/localPlayerAvatar.ts
- src/lib/playerAvatarPresets.ts (new)
- src/components/AvatarSettings.tsx, AvatarSettings.css
- src/components/LocalPlayerProvider.tsx
- src/components/PlayerAvatar.tsx
- src/components/VsIntro.tsx
- scripts/test-player-avatar.mjs
- scripts/test-avatar-presets.mjs (new)
- scripts/test-vs-intro.mjs
- src/assets/player-avatars/*.webp (11 portraits)
- src/assets/player-avatars/thumbs/*.webp (11 thumbnails)

## Install changed files
Extract this ZIP into the CubeHero project root (same folder as package.json). Replace matching files and keep the exact src / scripts folder structure.

## Local verification
npm run typecheck
npm run test:avatar
npm run test:profile
npm run test:vs
npm run build

## Deploy
 git add .
 git commit -m "Add selectable CubeHero player avatars"
 git push origin main

## Tests actually performed here
TypeScript (tsc --noEmit); avatar crop and gallery persistence; profile; VS intro; multi-AI; Ghost; Solo Timer; landing; Vercel readiness; mobile cube all passed.
A full Vite production bundle could not run in this Linux container using the uploaded Windows node_modules (Rollup native Linux binary missing). Please run npm run build locally before pushing.
