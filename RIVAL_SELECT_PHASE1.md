# Cube Hero — Rival Select Arena (Phase 1)

This update converts the Race AI speed picker into a fighting-game-inspired
**Rival Select Arena**. It does not copy any third-party game characters or UI assets.

## Implemented

- A roster of **55 original named AI rivals**, one for every existing Sub-6
  through Sub-60 speed tier. For example: Zenith at Sub-6, Ryuu at Sub-15,
  Ryo at Sub-20, and Cody at Sub-60.
- Search by character name or exact Sub level, with filters for Legend, Master,
  Expert, Challenger and Rising divisions.
- A detailed, live selected-rival panel with original title, short motto,
  chosen difficulty, expected average race pace and selected AI personality.
- Keyboard-accessible roster buttons, a scrollable roster, previous/next
  controls, animated selection/hover states and six quick-pick favorites.
- Responsive desktop/tablet/mobile layouts, including narrow 320px phones.
- Original SVG silhouette crests as **Phase 1 placeholders**. Unique finished
  character portraits, richer animations and voice/style copy are planned for
  Phase 2 and are not represented as complete here.

## Compatibility

- Selecting a rival updates the existing `RaceSettings.difficulty` only.
  It does not modify the AI opponent's timing algorithm, verified CFOP solver,
  scramble preparation, inspection controls or race results data format.
- Casual / Balanced / Competitive remains a separate user selection.
  For multi-AI races, all AI opponents continue using the shared selected
  Sub speed and personality, as before.
- Existing saved Sub preferences and original popular Sub quick-picks remain
  compatible. All characters are selectable now; no progression locks are
  added until a future phase.

## Validation

- `node scripts/test-rivals.mjs`
- `node scripts/test-difficulty-levels.mjs`
- `node scripts/test-multi-ai.mjs`
- `node node_modules/typescript/lib/tsc.js --noEmit`
- Existing CFOP, Ghost Race, Academy, Hero Journey and landing checks.

The full Vite production build requires platform-compatible `node_modules`.
The uploaded ZIP includes Windows-native dependencies, so TypeScript and
isolated UI previews were verified here, not a full integrated production build.
