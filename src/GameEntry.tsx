import { useEffect } from 'react'
import App from './App'
import { isAndroidBrowser } from './lib/mobilePerformance'
import './styles.css'
import './premium.css'
import './mobile-compact.css'
import './mobile-bottom-nav.css'
import './home-premium.css'
import './ai-personality-portraits.css'
import './mobile-landscape.css'
import './mobile-performance.css'
// Keep the accessible audio layout last so older theme/media rules cannot squash it.
import './settings-audio.css'

export default function GameEntry() {
  useEffect(() => {
    document.title = 'Cube Hero — Speedcubing Arena'
    document.body.classList.add('cube-game-body')
    if (isAndroidBrowser()) document.documentElement.classList.add('cube-android-browser')
    return () => {
      document.body.classList.remove('cube-game-body')
      document.documentElement.classList.remove('cube-android-browser')
    }
  }, [])
  return <App />
}
