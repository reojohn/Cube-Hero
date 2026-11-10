import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { isGameLocation } from './lib/siteRouting'
import LocalPlayerProvider from './components/LocalPlayerProvider'
import './localPlayer.css'

// The marketing page and the heavier game are separate code-split entry points.
// A visitor to / doesn't have to load the 3D cube/CFOP/racing code.
const LandingPage = lazy(() => import('./components/LandingPage'))
const GameEntry = lazy(() => import('./GameEntry'))
const showGame = isGameLocation(window.location.pathname, window.location.hash)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocalPlayerProvider>
    <Suspense fallback={<div style={{minHeight:'100dvh',display:'grid',placeItems:'center',background:'#090a17',color:'#e8d9ff',font:'700 16px system-ui'}}>CUBE HERO ✦</div>}>
      {showGame ? <GameEntry /> : <LandingPage />}
    </Suspense>
    </LocalPlayerProvider>
  </React.StrictMode>,
)
