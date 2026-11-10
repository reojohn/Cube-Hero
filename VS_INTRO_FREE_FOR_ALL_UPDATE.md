# Cube Hero — Premium Free-for-All VS Introduction

## Purpose
The VS cinematic now recognizes a race against **2–10 independent AI competitors**, not an AI team. The original one-opponent cinematic is preserved without redesigning it.

## What changes
- 1 AI: existing player-vs-featured-rival cinematic remains unchanged.
- 2–10 AIs: an adaptive tournament lineup lists **YOU**, then **AI 1**, **AI 2**, and so on, with a visible `VS` separator between competitors and an explicit matchup chain.
- Every AI has its own framed portrait, opponent number, selected Sub-level, and personality. All opponents are competitors, not allies.
- Portraits use same-division rival artwork as **cosmetic identities only**. They do not alter individual AI solving speed, difficulty, personality or race results, and the race room still refers to them as AI 1, AI 2, etc. Previously available PNG/WebP portraits and SVG fallbacks work automatically.
- The roster adapts to 2–10 AIs and smaller phone screens; more than five AIs use multiple rows rather than cramming all entrants into one row.
- The pre-race intro still lasts 5 seconds (1.1 seconds with reduced motion); **Enter arena now** and **Back to setup** still work.
- Scramble generation, inspection, timers, CFOP engine, independent AI time generation, rankings, Ghost Race, and Hero Journey were not modified.

## Modified files
- `src/components/VsIntro.tsx`
- `src/components/VsIntro.css`
- `scripts/test-vs-intro.mjs`
- `VS_INTRO_FREE_FOR_ALL_UPDATE.md` (this file)

## Test coverage
TypeScript and checks for every 1v1 rival, plus separate multi-AI matchup rendering across 2–10 opponents and six selected Sub tiers. Multi-AI racing, rival identity, Hero Journey, landing page and Ghost Race regression tests passed. Full visual QA and production build should be checked locally.
