import { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles, Trophy } from 'lucide-react'
import './LevelUpCelebration.css'

type Props = {
  level: number
  previousLevel: number
  title: string
  reducedMotion: boolean
  onContinue: () => void
}

/**
 * Hero Journey's earned-level celebration. This is a presentation only:
 * XP/rank calculation remains exclusively in lib/heroJourney.ts.
 */
export default function LevelUpCelebration({ level, previousLevel, title, reducedMotion, onContinue }: Props) {
  const continueRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    continueRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onContinue() }
      if (event.key === 'Tab') { event.preventDefault(); continueRef.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      lastFocus?.focus({ preventScroll: true })
    }
  }, [onContinue])

  return <div className={`ch-levelup ${reducedMotion ? 'ch-levelup--still' : ''}`} role="dialog" aria-modal="true" aria-labelledby="ch-levelup-heading" aria-describedby="ch-levelup-description">
    <div className="ch-levelup-night" aria-hidden="true" />
    <div className="ch-levelup-arena" aria-hidden="true">
      <div className="ch-levelup-crowd ch-levelup-crowd--left" />
      <div className="ch-levelup-crowd ch-levelup-crowd--right" />
      <div className="ch-levelup-spotlight ch-levelup-spotlight--left" />
      <div className="ch-levelup-spotlight ch-levelup-spotlight--right" />
      <div className="ch-levelup-stage">
        <span/><span/><span/>
      </div>
    </div>
    <div className="ch-levelup-fx" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => <i key={`firework-${i}`} className={`ch-levelup-firework ch-levelup-firework--${i + 1}`}/>) }
      {Array.from({ length: 33 }, (_, i) => <i key={`particle-${i}`} className="ch-levelup-particle" style={{
        '--n': i,
        '--x': `${(i * 41 + 17) % 97 + 1}%`,
        '--delay': `${(i % 9) * .14}s`,
        '--duration': `${3 + (i % 6) * .4}s`,
      } as React.CSSProperties}/>)}
    </div>

    <div className="ch-levelup-content">
      <div className="ch-levelup-header">
        <span className="ch-levelup-eyebrow"><Sparkles size={14}/> HERO JOURNEY · NEW MILESTONE <Sparkles size={14}/></span>
        <h2 id="ch-levelup-heading">LEVEL UP<span>!</span></h2>
        <p id="ch-levelup-description">CONGRATULATIONS, CUBER!</p>
      </div>

      <div className="ch-levelup-badge-wrap">
        <div className="ch-levelup-lightburst" aria-hidden="true" />
        <svg className="ch-levelup-badge" viewBox="0 0 640 410" role="img" aria-label={`Earned level ${level} emblem with golden wings`}>
          <defs>
            <linearGradient id="lvl-wings" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#fff9e1"/><stop offset=".27" stopColor="#ffd970"/><stop offset=".58" stopColor="#d68d25"/><stop offset="1" stopColor="#8b4924"/>
            </linearGradient>
            <linearGradient id="lvl-feathers" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#fff2ff"/><stop offset=".43" stopColor="#d9baff"/><stop offset=".85" stopColor="#9c66d8"/><stop offset="1" stopColor="#633e9e"/>
            </linearGradient>
            <linearGradient id="lvl-gold" x1=".08" y1="0" x2=".9" y2="1">
              <stop stopColor="#fff9da"/><stop offset=".22" stopColor="#ffe78b"/><stop offset=".55" stopColor="#eeb545"/><stop offset=".77" stopColor="#b96b18"/><stop offset="1" stopColor="#fff6b0"/>
            </linearGradient>
            <linearGradient id="lvl-purple" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#ffbbf9"/><stop offset=".35" stopColor="#a94ee5"/><stop offset=".72" stopColor="#6b31c8"/><stop offset="1" stopColor="#39135e"/>
            </linearGradient>
            <radialGradient id="lvl-core" cx="50%" cy="35%" r="73%">
              <stop stopColor="#f65eff"/><stop offset=".43" stopColor="#a94af3"/><stop offset=".85" stopColor="#642abd"/><stop offset="1" stopColor="#29134f"/>
            </radialGradient>
            <filter id="lvl-light" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
            <filter id="lvl-number-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="2.6" floodColor="#1c0c3b" floodOpacity=".85"/></filter>
          </defs>
          <g opacity=".5" filter="url(#lvl-light)"><path d="M55 185 L196 120 L230 285 L110 295Z" fill="#d783ff"/><path d="M585 185 L444 120 L410 285 L530 295Z" fill="#d783ff"/></g>
          <g className="ch-levelup-wing ch-levelup-wing--left" strokeLinejoin="round">
            <path d="M249 166 L173 104 L64 86 L104 157 L20 151 L77 221 L45 257 L167 270 L270 247Z" fill="url(#lvl-feathers)" stroke="#ffe7ff" strokeWidth="6"/>
            <path d="M237 169 L175 122 L95 100 L127 166 L62 174 L126 232 L194 234Z" fill="#d9adff" opacity=".72"/>
            <path d="M219 177 L143 128 L133 166 L88 184 L166 222 L225 215Z" fill="#f6dbff" opacity=".7"/>
            <path d="M236 162 L185 92 L136 73 L148 126 L198 178Z" fill="url(#lvl-wings)" stroke="#fff2b3" strokeWidth="4"/>
            <path d="M226 171 L208 101 L178 62 L180 133 Z" fill="#ffe8a0" stroke="#fff4d5" strokeWidth="3"/>
          </g>
          <g className="ch-levelup-wing ch-levelup-wing--right" transform="translate(640 0) scale(-1 1)" strokeLinejoin="round">
            <path d="M249 166 L173 104 L64 86 L104 157 L20 151 L77 221 L45 257 L167 270 L270 247Z" fill="url(#lvl-feathers)" stroke="#ffe7ff" strokeWidth="6"/>
            <path d="M237 169 L175 122 L95 100 L127 166 L62 174 L126 232 L194 234Z" fill="#d9adff" opacity=".72"/>
            <path d="M219 177 L143 128 L133 166 L88 184 L166 222 L225 215Z" fill="#f6dbff" opacity=".7"/>
            <path d="M236 162 L185 92 L136 73 L148 126 L198 178Z" fill="url(#lvl-wings)" stroke="#fff2b3" strokeWidth="4"/>
            <path d="M226 171 L208 101 L178 62 L180 133 Z" fill="#ffe8a0" stroke="#fff4d5" strokeWidth="3"/>
          </g>
          <g className="ch-levelup-medallion">
            <path d="M320 19 L420 76 L450 151 L450 258 L320 365 L190 258 L190 151 L220 76Z" fill="#270b52" stroke="#fff1ad" strokeWidth="9"/>
            <path d="M320 29 L412 82 L438 154 L438 252 L320 351 L202 252 L202 154 L228 82Z" fill="url(#lvl-gold)"/>
            <path d="M320 43 L401 90 L426 159 L426 242 L320 337 L214 242 L214 159 L239 90Z" fill="#61359d" stroke="#ead8ff" strokeWidth="6"/>
            <path d="M320 63 L393 105 L414 166 L414 238 L320 319 L226 238 L226 166 L247 105Z" fill="url(#lvl-purple)" stroke="#fff3c4" strokeWidth="6"/>
            <path d="M320 92 L381 127 L396 172 L396 228 L320 294 L244 228 L244 172 L259 127Z" fill="url(#lvl-core)" stroke="#e7bbff" strokeWidth="4"/>
            <path d="M269 135 L320 107 L371 135" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="6"/>
            <path d="M320 18 L344 53 L320 71 L296 53Z" fill="url(#lvl-gold)" stroke="#fff8cc" strokeWidth="3"/>
            <path d="M320 342 L338 365 L320 386 L302 365Z" fill="url(#lvl-gold)" stroke="#fff8cc" strokeWidth="3"/>
            <path d="M214 295 L177 296 L197 266 L226 268Z" fill="url(#lvl-wings)" stroke="#ffeb9e" strokeWidth="4"/>
            <path d="M426 295 L463 296 L443 266 L414 268Z" fill="url(#lvl-wings)" stroke="#ffeb9e" strokeWidth="4"/>
            <text x="320" y="226" textAnchor="middle" fontSize={level>=100 ? '102' : level>=10 ? '142' : '157'} fontWeight="900" fontFamily="Arial, sans-serif" stroke="#401269" strokeWidth="6" paintOrder="stroke" fill="#fff8ff" filter="url(#lvl-number-shadow)">{level}</text>
          </g>
        </svg>
      </div>

      <div className="ch-levelup-message">
        <span className="ch-levelup-new-rank"><Trophy size={17} aria-hidden="true"/> {title.toUpperCase()}</span>
        <p>LEVEL {previousLevel} <span>→</span> <strong>LEVEL {level}</strong></p>
        <small>Keep racing, solving, and earning your place among Cube Hero legends.</small>
      </div>
      <button type="button" className="ch-levelup-continue" ref={continueRef} onClick={onContinue}>CONTINUE <ArrowRight size={20} aria-hidden="true"/></button>
    </div>
  </div>
}
