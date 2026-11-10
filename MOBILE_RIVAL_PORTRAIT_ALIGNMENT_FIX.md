# Mobile selected rival alignment fix (2026-11-09)

- Corrects the selected rival portrait sitting too low within the right-hand side of the compact mobile preview.
- At 376–720px, the character art stage is now 156px tall and does not stretch with the details column; the PNG or SVG portrait is vertically and horizontally centered inside it.
- At 375px and below, the existing stacked layout is preserved and the portrait stays centered.
- Artwork, glows, orbits, rival selection, VS animations, level-up celebrations and race code are unchanged.

## Updated file
`src/components/RivalSelect.css`

## Validation
`npm run typecheck`, `npm run test:phase2`, `npm run test:multi`, and `npm run test:levelup` passed.
