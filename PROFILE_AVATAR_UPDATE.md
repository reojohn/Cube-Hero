# CubeHero — Local profile picture and cropper

## Features
- Settings → Local Player Profile → **Upload picture** or **Change picture**.
- Select JPG, PNG, WebP or GIF, up to 10 MB. Your device/browser must be able to decode the image.
- Move the image with mouse or touch, use the zoom slider, reset the crop, and save.
- Crops to a 1:1 square and compresses it to a 320 × 320 JPEG before storing it locally.
- Updates player portraits in topbar, sidebar, AI/Ghost race cards, standings, Hero Journey, and 1v1/free-for-all VS intros.
- **Restore default** removes only the custom avatar. Username, solves, Ghost records and XP stay unchanged.
- Nothing is uploaded to a server; each browser/device has a separate profile photo. Clearing browser storage removes it.
- Original transparent CubeHero mascot remains the default fallback.

## Verification
Run `npm run typecheck`, `npm run test:avatar`, `npm run test:profile`, `npm run test:vs` and `npm run build` on Windows before pushing to Vercel.
