# Cube Hero — Local Player Profile (Website + Game)

## What changed

- On the **first visit** to `/` (website) or `/app` (game), Cube Hero asks for a 2–24 character username before displaying the site.
- After setup, returning visitors using the same browser/site storage go straight into Cube Hero. No login, password, account, API call, or database is required.
- Player name appears in the sidebar, desktop top bar, 1v1 and free-for-all VS introductions, results standings, and Hero Journey tournament leaderboards.
- Edit the username at **Settings → Local Player Profile**. The name change doesn't modify the actual saved game IDs, XP, ghost records, or race data.
- Local username is stored under `cube-hero-local-player-name-v1` in `localStorage` and existing progress keys are preserved.

## Installation

Extract the changed-files ZIP directly inside your Cube Hero project folder (where `package.json` is), replacing the matching files. Keep all other source and `public` assets intact.

Run:

```sh
npm run typecheck
npm run test:profile
npm run test:phase2
npm run dev
```

## Notes

- Clearing site storage, switching browsers/devices, private browsing, or uninstalling the mobile app may erase the local name and/or progress. There is no cloud sync.
- If browser storage is blocked, a player can still enter a name for the current session, but it may not be remembered after closing the tab.
- Existing saved race history and Hero Journey XP remain accessible when an existing user sets a name for the first time.
- VS and Hero Journey use the unchanged internal racer ID `YOU` so rankings and previously saved records remain compatible.
- The website is **not automatically offline-capable** with this change. An installable PWA/offline caching is a separate feature.
