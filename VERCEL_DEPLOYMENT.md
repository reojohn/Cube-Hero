# CubeHero — Vercel deployment guide

Repository: https://github.com/reojohn/Cube-Hero

## Before deploying

CubeHero has a React + Vite frontend. There is no separate backend or account database. The root URL `/` displays the marketing landing page; `/app` displays the training arena. Within the arena, `#/race`, `#/solo`, `#/practice`, and other routes are handled in the browser.

- **Framework preset:** Vite
- **Root directory:** `./` (the folder containing `package.json`, *if* that is the repository root)
- **Install command:** use Vercel's automatic npm installation from `package-lock.json`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node.js:** 22.x (`package.json` pins this to prevent drift across Vercel defaults)
- **Environment variables:** none required for the current local-only application

`vercel.json` includes the `/app` routes and the final `index.html` SPA fallback. Static assets in `public/` are served from the deployment root, including `/rivals`, `/ai-personalities`, and favicons. The CFOP worker is imported using Vite's worker URL syntax, so it is bundled with the application.

## 1. Run checks on your computer

In Git Bash:

```bash
cd "/c/Users/REO JOHN/OneDrive/Desktop/Cube Hero/CubeHero_Phase1"
npm ci
npm run typecheck
npm run test:vercel
npm run test:landing
npm run test:art
npm run test:vs
npm run build
```

If `npm run build` succeeds, Vite creates the `dist/` folder. `dist/` and `node_modules/` must **not** be committed. If you get errors, copy the error output before proceeding.

## 2. Commit the deployment preparation

Extract the changed-files archive into the folder containing `package.json`, replacing the matching paths, then:

```bash
git status
git add .gitignore package.json package-lock.json vercel.json scripts/test-vercel-deploy.mjs VERCEL_DEPLOYMENT.md
git commit -m "Prepare CubeHero for Vercel deployment"
git push origin main
```

The tracked source should include `src/`, `public/`, `index.html`, `package-lock.json`, `vite.config.ts`, and `vercel.json`. Confirm `.env` files and `node_modules` are **not** tracked (`git ls-files node_modules` should show nothing).

## 3. Import the GitHub repository into Vercel

1. Open https://vercel.com/new and sign in with GitHub.
2. Import `reojohn/Cube-Hero` (authorize Vercel's GitHub integration if necessary).
3. Select **Vite**. Set Root Directory to the directory that actually contains `package.json` (usually `./` if you pushed from inside `CubeHero_Phase1`).
4. Confirm Build Command `npm run build`, Output Directory `dist`, and Node.js 22.x. Keep the install command on Auto.
5. No environment variables are needed for the current application. Click **Deploy**.

A successful build will give you a Vercel URL. Subsequent pushes to `main` normally create new production deployments.

## 4. Test the public site after deployment

- Visit `/` and verify that the CubeHero landing page loads with images.
- Open `/app#/home` and `/app#/race` directly in a fresh tab (not only through in-app navigation).
- Select a rival and verify the portrait PNG/WebP images and AI personality art load.
- Start a race and confirm the CFOP solver Web Worker starts and the VS animation completes.
- Verify Solo Timer, Ghost Race, statistics, and settings on desktop and phone; check both portrait and landscape.
- Refresh `/app#/solo` and confirm routing still works, and that browser-local solves/settings persist.

## Important limitations

**Device-local data:** Usernames, solve records, Hero Journey XP, and preferences are stored in browser storage on the current site origin. Data from `localhost` does not automatically migrate to your `vercel.app` domain, and it does not sync between devices. Do not clear browser storage on a device if you need its records.

**Offline & orientation:** A deployed website is not automatically a fully offline-installed mobile app. Forced orientation locking can be restricted by mobile browsers and may require an installed PWA or native app. Responsive layouts still work when the user rotates their device.

**Deployment verification:** This ZIP was statically inspected and has a Vercel readiness smoke test; actual Linux production build and live Vercel URL must be confirmed from the Vercel deployment logs and real browser testing.
