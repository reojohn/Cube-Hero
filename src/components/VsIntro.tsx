import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { ArrowRight, ChevronLeft, Flag, ShieldCheck, Sparkles, Swords, Zap } from 'lucide-react'
import type { RaceSettings } from '../lib/racing'
import { getAiCount } from '../lib/racing'
import { AI_RIVALS, getRival } from '../lib/rivals'
import { prewarmRivalPortraits, getRivalPortraitTheme } from '../lib/rivalPortraits'
import RivalPortrait from './RivalPortrait'
import playerAvatar from '../assets/player-avatars/default-cube-keeper.webp'
import { useLocalPlayer } from './LocalPlayerProvider'
import { playGameSound } from '../lib/gameAudio'
import './VsIntro.css'

/** The intro intentionally does NOT render RaceRoom or create a running timer.
 * The caller mounts RaceRoom only after onEnterArena fires.
 */
export const VS_INTRO_DURATION_MS = 5000
export const VS_INTRO_REDUCED_DURATION_MS = 1100

type Props = {
  playerName?: string
  settings: RaceSettings
  reducedMotion: boolean
  onEnterArena: () => void
  onBack: () => void
}


export default function VsIntro({ settings, reducedMotion, onEnterArena, onBack, playerName = 'Guest Cuber' }: Props) {
  const {avatarUrl, avatarKind} = useLocalPlayer()
  const playerPortrait = avatarUrl || playerAvatar
  const rival = getRival(settings.difficulty)
  const opponentCount = getAiCount(settings.aiCount)
  const isTournament = opponentCount > 1
  // Landscape uses an overlay layer for the VS badges.  Keeping them outside
  // the cards avoids clipping them when the short-screen cards hide overflow.
  const landscapeColumns = opponentCount + 1 <= 6 ? opponentCount + 1 : Math.ceil((opponentCount + 1) / 2)
  // Portraits are visual personas only: all opponents keep the selected Sub-level
  // and personality in the actual race engine, with independent solve clocks.
  const divisionPortraits = AI_RIVALS.filter(persona => persona.division === rival.division)
  const portraitStart = divisionPortraits.findIndex(persona => persona.difficulty === rival.difficulty)
  const opponents = Array.from({ length: opponentCount }, (_, index) => ({
    id: index + 1,
    portrait: divisionPortraits[(portraitStart + index) % divisionPortraits.length] ?? rival,
  }))
  const [systemReducedMotion, setSystemReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const motionOff = reducedMotion || systemReducedMotion
  const enterRef = useRef(onEnterArena)
  const backRef = useRef(onBack)
  enterRef.current = onEnterArena
  backRef.current = onBack
  const finishedRef = useRef(false)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const skipButtonRef = useRef<HTMLButtonElement>(null)

  const enter = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    enterRef.current()
  }
  const back = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    backRef.current()
  }

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    // Browser audio is unlocked by the actual Start Race tap in the caller.
    // Schedule rather than playing synchronously on mount so React StrictMode's
    // development-only effect replay does not double the opening impact.
    // Clear pending cues on Back/Skip; the race clock remains untouched.
    const delays = motionOff ? [80, 560] : [80, 1500, 2980]
    const cues = motionOff ? (['vs', 'vsImpact'] as const) : (['vs', 'vsImpact', 'vsFinal'] as const)
    const timers = delays.map((delay, index) => window.setTimeout(() => playGameSound(cues[index]), delay))
    return () => timers.forEach(id => window.clearTimeout(id))
  }, [motionOff])

  useEffect(() => {
    // Covers both approved PNG/WebP opponents and the SVG fallback for future rivals.
    prewarmRivalPortraits(settings.difficulty)
  }, [settings.difficulty])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    skipButtonRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true
        enterRef.current()
      }
    }, motionOff ? VS_INTRO_REDUCED_DURATION_MS : VS_INTRO_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [motionOff])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      back()
    }
    // Keep keyboard focus inside the full-screen dialog.
    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === backButtonRef.current) {
        event.preventDefault()
        skipButtonRef.current?.focus()
      } else if (!event.shiftKey && document.activeElement === skipButtonRef.current) {
        event.preventDefault()
        backButtonRef.current?.focus()
      }
    }
  }

  return (
    <div
      className={`cube-vs-intro${motionOff ? ' cube-vs-intro--reduced' : ''}${opponentCount >= 7 ? ' cube-vs-intro--dense' : ''}${!isTournament ? ' cube-vs-intro--head-to-head' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={isTournament ? `Cube Hero free-for-all: You versus ${opponentCount} independent AI opponents, Sub-${rival.difficulty}` : `Cube Hero matchup: You versus ${rival.name}, Sub-${rival.difficulty}`}
      onKeyDown={onKeyDown}
      style={{ '--vs-rival-accent': getRivalPortraitTheme(rival.difficulty,rival.accent,rival.glow)['--rival-accent'], '--vs-rival-glow': getRivalPortraitTheme(rival.difficulty,rival.accent,rival.glow)['--rival-glow'], ...getRivalPortraitTheme(rival.difficulty,rival.accent,rival.glow) } as CSSProperties}
    >
      <div className="cube-vs-atmosphere" aria-hidden="true"><span/><span/><span/></div>
      <div className="cube-vs-frame">
        <header className="cube-vs-topline">
          <div className="cube-vs-brand"><span className="cube-vs-brand-cube"><Sparkles size={18}/></span><div><b>CUBE HERO</b><small>{isTournament ? 'RACE ARENA · FREE FOR ALL' : 'RACE ARENA · HEAD TO HEAD'}</small></div></div>
          <div className="cube-vs-top-right"><span className="cube-vs-live-dot"/> MATCHUP CONFIRMED</div>
        </header>

        <div className="cube-vs-kicker"><span>01</span><div/> {isTournament ? `${opponentCount + 1} RACERS · ONE WINNER` : 'YOUR NEXT CHALLENGE'} <div/><span>{String(opponentCount + 1).padStart(2, '0')}</span></div>

        {isTournament ? (
          <div className={`cube-vs-tournament${opponentCount >= 7 ? ' cube-vs-tournament--dense' : ''}`} aria-label="Free-for-all matchup lineup">
            <div className="cube-vs-tournament-heading">
              <span className="cube-vs-tournament-heading-icon"><Swords size={16}/> FREE-FOR-ALL TOURNAMENT</span>
              <h1 aria-label="Every racer for themselves."><span className="cube-vs-title-word">Every</span><span className="cube-vs-title-word">racer</span><span className="cube-vs-title-word cube-vs-title-word--accent">for</span><span className="cube-vs-title-word cube-vs-title-word--accent">themselves.</span></h1>
              <p>{opponentCount + 1} racers · {opponentCount} independent AI opponents · Same scramble, separate solve clocks.</p>
            </div>
            <div className="cube-vs-tournament-lineup" role="list" aria-label={`You versus ${opponentCount} independent AI opponents`} style={{ '--vs-lineup-columns': Math.min(opponentCount + 1, 6), '--vs-tablet-columns': Math.min(opponentCount + 1, 4), '--vs-mobile-columns': opponentCount === 3 ? 2 : 3, '--vs-mobile-rows': Math.ceil((opponentCount + 1) / (opponentCount === 3 ? 2 : 3)), '--vs-landscape-columns': opponentCount + 1 <= 6 ? opponentCount + 1 : Math.ceil((opponentCount + 1) / 2), '--vs-landscape-rows': opponentCount + 1 <= 6 ? 1 : 2 } as CSSProperties}>
              <article className="cube-vs-contender cube-vs-contender--player" role="listitem" aria-label="YOU, player competitor">
                <div className="cube-vs-contender-top"><ShieldCheck size={13}/> PLAYER</div>
                <div className="cube-vs-contender-art cube-vs-contender-art--custom"><span className="cube-vs-contender-aura" aria-hidden="true"/><img src={playerPortrait} width={512} height={512} alt="" draggable={false} decoding="async" fetchPriority="high"/></div>
                <div className="cube-vs-contender-info"><strong>YOU</strong><span title={playerName}>{playerName}</span></div>
              </article>
              {opponents.map(({ id, portrait }, index) => (
                <article key={id} className="cube-vs-contender cube-vs-contender--ai" role="listitem" aria-label={`AI ${id}, independent opponent, Sub-${rival.difficulty}`} style={{ '--vs-entrant-index': index, ...getRivalPortraitTheme(portrait.difficulty,portrait.accent,portrait.glow) } as CSSProperties}>
                  <span className="cube-vs-contender-separator" aria-hidden="true">VS</span>
                  <div className="cube-vs-contender-top"><Swords size={13}/> OPPONENT {String(id).padStart(2, '0')}</div>
                  <div className="cube-vs-contender-art"><span className="cube-vs-contender-aura" aria-hidden="true"/><RivalPortrait rival={portrait} large/></div>
                  <div className="cube-vs-contender-info"><strong>AI {id}</strong><span>SUB-{rival.difficulty} · {settings.personality.toUpperCase()}</span></div>
                </article>
              ))}
              <div className="cube-vs-lineup-labels" aria-hidden="true">
                {opponents.filter(({ id }) => id % landscapeColumns !== 0).map(({ id }) => (
                  <span
                    key={id}
                    className="cube-vs-lineup-label"
                    style={{ gridColumn: id % landscapeColumns + 1, gridRow: Math.floor(id / landscapeColumns) + 1, '--vs-entrant-index': id - 1 } as CSSProperties}
                  >VS</span>
                ))}
              </div>
            </div>
            <div className="cube-vs-tournament-summary">
              <div className="cube-vs-tournament-chain" aria-label={`You versus ${opponents.map(o => `AI ${o.id}`).join(' versus ')}`}>
                <strong>YOU</strong>
                {opponents.map(o => <span key={o.id}><b>VS</b><strong>AI {o.id}</strong></span>)}
              </div>
              <p><Swords size={15}/> NO ALLIES · EVERY RACER COMPETES FOR FIRST PLACE</p>
            </div>
          </div>
        ) : <div className="cube-vs-matchup">
          <section className="cube-vs-fighter cube-vs-fighter--player" aria-label="Player">
            <span className="cube-vs-corner cube-vs-corner--tl" aria-hidden="true"/>
            <span className="cube-vs-corner cube-vs-corner--br" aria-hidden="true"/>
            <div className="cube-vs-fighter-tag"><ShieldCheck size={15}/> PLAYER ONE</div>
            <div className="cube-vs-portrait-stage cube-vs-portrait-stage--player">
              <span className="cube-vs-halo" aria-hidden="true"/>
              <span className="cube-vs-halo-ring" aria-hidden="true"/>
              <img className={`cube-vs-player-image ${avatarKind === 'upload' ? 'cube-vs-player-image--custom' : 'cube-vs-player-image--preset'}`} src={playerPortrait} width={512} height={512} alt="Cube Hero player mascot" draggable={false} decoding="async" fetchPriority="high"/>
            </div>
            <div className="cube-vs-fighter-title"><span>THE CHALLENGER</span><h2>YOU</h2><p title={playerName}>{playerName}</p></div>
          </section>

          <div className="cube-vs-center" aria-hidden="true">
            <span className="cube-vs-center-spark">✦</span>
            <span className="cube-vs-center-slash"/>
            <strong className="cube-vs-symbol">VS</strong>
            <span className="cube-vs-center-sub">READY TO RACE</span>
          </div>

          <section className="cube-vs-fighter cube-vs-fighter--rival" aria-label="Selected AI rival">
            <span className="cube-vs-corner cube-vs-corner--tl" aria-hidden="true"/>
            <span className="cube-vs-corner cube-vs-corner--br" aria-hidden="true"/>
            <div className="cube-vs-fighter-tag"><Swords size={15}/> {rival.division.toUpperCase()} DIVISION</div>
            <div className="cube-vs-portrait-stage cube-vs-portrait-stage--rival">
              <span className="cube-vs-halo" aria-hidden="true"/>
              <span className="cube-vs-halo-ring" aria-hidden="true"/>
              <div className="cube-vs-rival-art"><RivalPortrait rival={rival} large/></div>
            </div>
            <div className="cube-vs-fighter-title"><span>AI OPPONENT · SUB-{rival.difficulty}</span><h2>{rival.name}</h2><p>{rival.title}</p></div>
          </section>
        </div>}

        <div className="cube-vs-bottom">
          <div className="cube-vs-rival-quote"><Zap size={17}/><span>{isTournament ? `“No teammates. One scramble. One winner.”` : `“${rival.motto}”`}</span></div>
          <div className="cube-vs-metadata"><span><Flag size={13}/> 3×3 CUBE RACE</span><span>{isTournament ? `SUB-${rival.difficulty} · ${settings.personality.toUpperCase()} · ${opponentCount} INDEPENDENT AIS` : `SUB-${rival.difficulty} · ${settings.personality.toUpperCase()} STYLE`}</span></div>
          <div className="cube-vs-progress" aria-hidden="true"><span key={motionOff ? 'short' : 'full'}/></div>
          <div className="cube-vs-actions">
            <button type="button" ref={backButtonRef} className="cube-vs-back" onClick={back}><ChevronLeft size={18}/> Back to setup</button>
            <button type="button" ref={skipButtonRef} className="cube-vs-skip" onClick={enter}>Enter arena now <ArrowRight size={17}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}
