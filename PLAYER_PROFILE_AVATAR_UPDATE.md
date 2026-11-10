# Player profile avatar — Cube Hero

The user's supplied mascot PNG is now the **Guest Cuber** default player picture.

## Location
- Source: `src/assets/player-avatar.png` (512 × 512 optimized PNG derived from the supplied artwork)
- Reusable component: `src/components/PlayerAvatar.tsx` and `PlayerAvatar.css`

## Where it appears
- Top-right navigation profile circle
- Bottom of desktop/mobile sidebar next to Guest Cuber
- Player indicator during Race AI and Ghost Race
- Player entry in results and Hero Journey tournament standings

This does NOT add account creation, photo upload, a clickable profile editor, or persistent user accounts; it updates the default displayed image only. Rival portraits, game logo, race engine and settings are not modified.

## How to install
Extract the changed-files ZIP over your existing Cube Hero source, preserving folder structure. Run `npm install` if needed and `npm run build`. The PNG is imported via Vite, so its cache-busted asset path is handled automatically.
