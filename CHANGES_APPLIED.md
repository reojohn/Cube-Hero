CubeHero leaderboard + inspect CTA polish

Changes included:
1. Added AI rival profile portraits to the Race Results leaderboard on both desktop and mobile.
2. Added the fastest AI portrait to the top AI result summary card.
3. Replaced the old bouncing/pulsing Inspect CTA behavior with a gentler static-highlight + echo-ring effect.
4. Applied the same Inspect CTA tweak to both Race AI and Ghost Race so the button no longer scales/bounces.
5. Kept the READY chip, but made it static to reduce layout jitter near the New Scramble button.
6. Added a reusable small RivalMiniPortrait component that uses fast thumbnail art with fallbacks.

Validation:
- TypeScript check: passed with `npx tsc --noEmit`.
- Full Vite production build could not be completed in this container because Rollup's optional native dependency was missing from the provided node_modules.
