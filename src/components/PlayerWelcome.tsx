import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Check, LockKeyhole, ShieldCheck, Sparkles, Trophy, UserRound } from 'lucide-react'
import { isValidPlayerName, normalizePlayerName, PLAYER_NAME_MAX_LENGTH } from '../lib/localPlayer'
import './PlayerWelcome.css'

/** First-visit local setup: no account, no passwords, no external service. */
export default function PlayerWelcome({onCreate}: {onCreate: (name: string) => boolean}) {
  const [draft, setDraft] = useState('')
  const [tried, setTried] = useState(false)
  const valid = isValidPlayerName(draft)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTried(true)
    if (valid) onCreate(normalizePlayerName(draft))
  }

  return <main className="cube-welcome" aria-labelledby="cube-welcome-title">
    <div className="cube-welcome-stars" aria-hidden="true"/>
    <section className="cube-welcome-panel">
      <div className="cube-welcome-art">
        <div className="cube-welcome-art-ring" aria-hidden="true"/>
        <img src="/cube-hero-mascot-384.png" alt="Cube Hero's hooded speedcubing mascot" width="244" height="244" decoding="async" fetchPriority="high" />
        <span className="cube-welcome-art-caption"><Trophy size={14}/> YOUR JOURNEY STARTS HERE</span>
      </div>
      <div className="cube-welcome-content">
        <span className="cube-welcome-eyebrow"><Sparkles size={14}/> CUBE HERO · PLAYER SETUP</span>
        <h1 id="cube-welcome-title">Every hero<br/>starts with a <em>name.</em></h1>
        <p>Welcome to your cubing arena. Choose the name you want to see in races, leaderboards, and Hero Journey.</p>
        <form className="cube-welcome-form" onSubmit={submit} noValidate>
          <label htmlFor="cube-player-name"><UserRound size={17}/> YOUR CUBER NAME</label>
          <input id="cube-player-name" name="playerName" type="text" autoComplete="nickname" maxLength={PLAYER_NAME_MAX_LENGTH} placeholder="What should we call you?" value={draft} aria-invalid={tried&&!valid} aria-describedby="cube-welcome-input-help" onChange={event=>setDraft(event.target.value)}/>
          <div className={`cube-welcome-input-help${tried&&!valid?' has-error':''}`} id="cube-welcome-input-help">{tried&&!valid?'Enter at least 2 characters.':`${normalizePlayerName(draft).length}/${PLAYER_NAME_MAX_LENGTH} characters · You can change it later.`}</div>
          <button type="submit" disabled={!valid}>Start My Journey <ArrowRight size={18}/></button>
        </form>
        <div className="cube-welcome-perks"><span><ShieldCheck size={16}/> No login or password</span><span><LockKeyhole size={16}/> Saved on this device</span><span><Check size={16}/> Your progress stays intact</span></div>
      </div>
    </section>
    <div className="cube-welcome-footer">CUBE HERO <span>✦</span> YOUR CUBE. YOUR STORY.</div>
  </main>
}
