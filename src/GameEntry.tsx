import { useEffect } from 'react'
import App from './App'
import './styles.css'
import './premium.css'
import './mobile-compact.css'
import './mobile-bottom-nav.css'
import './home-premium.css'
import './ai-personality-portraits.css'
import './mobile-landscape.css'

export default function GameEntry() {
  useEffect(() => {
    document.title = 'Cube Hero — Speedcubing Arena'
    document.body.classList.add('cube-game-body')
    return () => document.body.classList.remove('cube-game-body')
  }, [])
  return <App />
}
