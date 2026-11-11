# CubeHero — Premium Game Sound Effects

## What changed

- Reused one Web Audio engine for Race AI, Ghost Race, Solo Timer and VS introductions instead of creating a new AudioContext for every beep.
- Added short, lightweight sci-fi sounds for entering inspection, arming/ready, timer start/stop, final three inspection countdown seconds, AI and Ghost finishes, victory/loss, qualifying completion and new personal bests.
- Added settings: Game sound effects, Sound volume (0–100), Cinematic VS sounds, Timer and inspection sounds, and Test sound.
- Kept all prior game mechanics, 3D cubes, player settings, saved profiles and race timing unchanged.
- Disabled by default for players who have never chosen sound settings. Existing sound enabled preference persists.
- Does not download audio or run continuous audio loops during racing; scheduling only occurs at race milestones.
- Mobile requires a user gesture to unlock audio, handled by pointer/keyboard input in the main app.

## User controls

Open Settings → Experience → Game sound effects. Turn the master switch on, adjust volume, preview with Test sound, and optionally disable VS or timer-specific sounds. All preferences are saved locally in the existing `cube-hero-preferences-v1` key.

## Verification

- `npm run typecheck`
- `npm run test:audio`
- `npm run test:vs`, `npm run test:ghost`, `npm run test:solo`, `npm run test:multi`
- Other existing gameplay and Vercel tests

The source passes TypeScript and local regression checks. The complete Vite build cannot run on this Linux host using ZIP-bundled Windows-only native Rollup dependencies. Run `npm run build` on Windows, or push to GitHub for Vercel's clean Linux installation.
