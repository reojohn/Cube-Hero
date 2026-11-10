# CubeHero: Mobile Race & Ghost Performance Optimization

## Scope
- Race AI + Ghost Race: on phone-sized screens, the full React arena updates every 90 ms instead of every 30 ms. Both modes continue to use `performance.now()` for official elapsed times and hold-to-start validation.
- The prominent player and featured opponent timers update their text independently at approximately 45 ms intervals without asking the whole screen to re-render.
- On mobile, multi-AI races display the featured AI 3D cube and all other opponents' separate clocks, but replace the extra 3D cubes with lightweight icons. Desktop visuals remain unchanged.
- On mobile, costly repeated glow/blur animations around the cube, rival preview, and topbar are reduced. The featured verified CFOP cube and Ghost cube continue turning.
- Solo Timer logic, qualifying Ghost solves, profiles, XP, race results, and CFOP engine are unchanged.

## Validation
`npm run typecheck`
`node scripts/test-mobile-race-performance.mjs`
`npm run test:ghost && npm run test:multi && npm run test:solo && npm run test:cfop && npm run test:vs`
`npm run build` (run on Windows or Vercel; shipped Windows node_modules cannot run the Linux Rollup binary).

## Extra performance option
If an older phone still struggles with the animated AI cube, turn off **Show AI Cube** in Race AI settings. This does not affect race timing or opponent difficulty. To further reduce decorative animation, use Settings > Reduce animations.
