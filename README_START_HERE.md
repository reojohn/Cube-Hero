# CUBE HERO — Phase 3: Human-Like CFOP AI

Cube Hero is a premium React + Vite + TypeScript speedcubing training website. The updated Phase 3 code integrates a CFOP solver and moves the 3D cube through verified Cross, four F2L pairs, OLL, and PLL.

## Start system (Windows)
1. Make sure Node.js 22 LTS is installed.
2. Extract the folder to a location you can write to.
3. Double-click **start system.bat**. It installs new CFOP libraries when needed, then opens `http://localhost:5188/`.
4. Select Race AI, opponent difficulty and personality, then start a race.
5. Apply the scramble to a physical cube and wait for **Verified CFOP solution ready**. Start inspection (if enabled). **Hold Space or the touch-start surface for 1.5 seconds and release** to start both timers. Press Space or tap the player timer to stop your solve.
6. Watch the AI's physically turning cube and review the seven CFOP stages on the Results screen.

AI solve moves are computed and stage-verified for the scramble. Simulated opponent timing is still based on difficulty, personality and move characteristics. No user account or server-side database required.

For details, installation instructions, and verification limits, read `CFOP_UPGRADE_README.md`.


## NEW: YOU vs YOU · Ghost Race
The former Practice page is now **Ghost Race** in the left sidebar. Record three valid timed solves on three scrambles, and your fastest official time becomes your ghost. From then on, your ghost displays a turning 3D cube and finishes at your recorded best time. Each new personal best becomes the next ghost target.

The ghost animation is a verified CFOP reconstruction, **not a recording of your physical cube moves**. The 15-second inspection modal, hold-for-1.5-seconds and release start, and local history are supported. Details in `GHOST_RACE_UPDATE.md`.
