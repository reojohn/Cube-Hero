import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { isGameLocation } from './lib/siteRouting'
import LocalPlayerProvider from './components/LocalPlayerProvider'
import './localPlayer.css'
import CubeVsLoader from './components/CubeVsLoader'

// The marketing page and the heavier game are separate code-split entry points.
// A visitor to / doesn't have to load the 3D cube/CFOP/racing code.
const LandingPage = lazy(() => import('./components/LandingPage'))
const GameEntry = lazy(() => import('./GameEntry'))
const showGame = isGameLocation(window.location.pathname, window.location.hash)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<CubeVsLoader />}>
      {/* Only players entering the arena need a local player name.
          The public landing page must be visible to first-time visitors. */}
      {showGame ? (
        <LocalPlayerProvider><GameEntry /></LocalPlayerProvider>
      ) : <LandingPage />}
    </Suspense>
  </React.StrictMode>,
)
