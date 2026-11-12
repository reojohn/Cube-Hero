# CubeHero — Graphics Preview and Premium Confirmation Update

This update builds on the working **single-cube, smoothly rotating Medium renderer**. No cube rendering files, race timer algorithms, AI speeds, scramble generation, history formats, or Android native project files were changed.

## Graphics Settings

- **Low, Medium, High** now have tiny static 3D-looking SVG cube previews. These are previews, not live race engines, so they do not introduce timer or cube animation overhead.
- Medium shows **Recommended for Android**; High shows **Recommended for Desktop**.
- Existing **Default on this device** badges and saved user choices remain.
- Desktop mouse hover adds a gentle lift/tilt, with no hover animation on touch devices and none with reduced motion.
- New device defaults remain **Medium for mobile, High for desktop**; saved preferences still win.

## Confirmation Modals

A shared premium, portal-based confirmation component now handles:

- leaving an active Race AI/Ghost Race/Solo Timer;
- replacing an unfinished tournament;
- clearing AI race history;
- resetting Ghost Race (including qualifying-solves and races summary);
- deleting the most recent Solo Timer solve;
- clearing all Solo Timer history;
- clearing Solo Timer history from Statistics.

The modal supports Cancel, backdrop click, Escape, keyboard focus trapping and restoration, and Android Back dismissal for app-level confirmations. Space/Enter keyboard input inside the modal is not allowed to bubble into the underlying game controls. Inspection and help dialogs are not confirmations and remain untouched.

## Apply the changed-files ZIP

1. Extract the ZIP into the parent of your `CubeHero_Phase1` folder so its folders and files overwrite their matching locations.
2. Keep your existing `node_modules`, `.env` settings, user data, and Android project.
3. From your project directory, run `npm run typecheck`, `npm run test:graphics`, `npm run test:solo`, and `node scripts/test-premium-ui.mjs`.
4. Test Settings and the popups locally with `npm run dev`.
5. To update your Android APK, use `npm run android:sync`, then `cd android` and `gradlew.bat assembleDebug` on Windows.

## Validation in this environment

Passed: TypeScript; graphics tests; Solo Timer; premium UI checks; Ghost Race; multi-AI; CFOP; Capacitor; profile; audio.

Full `vite build` was not completed here because the source has Windows-oriented dependencies and the Linux-only Rollup native binary is not available. Build the app in your Windows project environment.
