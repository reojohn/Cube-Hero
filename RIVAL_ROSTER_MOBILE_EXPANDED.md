# Cube Hero — Taller mobile Rival Roster

This patch expands only the **Rival Roster opponent list on phones**.
It changes **`src/components/RivalSelect.css`** without modifying the
rival artwork, portrait mapping, search/filter/selection behavior, VS intro,
level-up modal, or race/solver logic.

## Change
- Previous mobile maximum roster height: 248px.
- New mobile opponent-list height: `clamp(360px, 62dvh, 620px)`.
- Includes a `vh` fallback for older browsers.
- Keeps the roster internally scrollable; search, divisions, and Quick Picks
  remain accessible outside the internal list scroll.
- Desktop layout is unchanged.

## Verified
- 390x844 viewport: 523px roster height; no horizontal overflow.
- 320x568 viewport: 360px roster height; no horizontal overflow.
- TypeScript, Phase 2 restoration, VS intro, level-up, multi-AI, Ghost Race,
  Hero Journey, and landing checks passed.

## Installation
Extract the changed-files ZIP **directly into the Cube Hero project folder**
that contains `package.json`, preserving the `src/components/` structure.
Replace the existing `RivalSelect.css` file, then refresh your browser.
