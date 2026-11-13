import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { isGameLocation } from './lib/siteRouting'
import LocalPlayerProvider from './components/LocalPlayerProvider'
import './localPlayer.css'
import CubeVsLoader from './components/CubeVsLoader'
import { isNativeApp } from './lib/nativePlatform'
import StartupErrorBoundary from './components/StartupErrorBoundary'

// The marketing page and the heavier game are separate code-split entry points.
// A visitor to / doesn't have to load the 3D cube/CFOP/racing code.
const LandingPage = lazy(() => import('./components/LandingPage'))
const GameEntry = lazy(() => import('./GameEntry'))
// Native APKs boot at / (bundled assets); never show the marketing page there.
// On the website, / still shows the public landing page and /app opens the game.
const showGame = isGameLocation(window.location.pathname, window.location.hash) || isNativeApp()
if (isNativeApp()) document.documentElement.classList.add('cube-native')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StartupErrorBoundary>
    <Suspense fallback={<CubeVsLoader />}>
      {/* Only players entering the arena need a local player name.
          The public landing page must be visible to first-time visitors. */}
      {showGame ? (
        <LocalPlayerProvider><GameEntry /></LocalPlayerProvider>
      ) : <LandingPage />}
    </Suspense>
    </StartupErrorBoundary>
  </React.StrictMode>,
)


// Cache desktop game files only after entering the arena, not while browsing
// the marketing landing page. Native Android and mobile browsers are untouched.
// Desktop installability is provided by the manifest even before registration.
const isDesktopWebGame = showGame || window.matchMedia('(display-mode: standalone)').matches
if (import.meta.env.PROD && !isNativeApp() && isDesktopWebGame && !/Android|iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  void import('./lib/registerDesktopPwa').then(({ registerDesktopPwa }) => registerDesktopPwa())
}
