import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ArrowRight, BarChart3, Check, ChevronDown, CircleHelp, Clock3, Copy, Flag, History, Keyboard, RotateCcw, ShieldCheck, Shuffle, Sparkles, Timer, Trash2, Trophy, Zap } from 'lucide-react'
import { generateScramble, formatTime, newId } from '../lib/racing'
import { ARM_DELAY_MS } from '../lib/stackmat'
import { SOLO_TIMER_STORAGE_KEY, SOLO_SOLVE_LIMIT, officialSoloMs, parseSoloSolves, soloAverageOf, soloBest, soloMean } from '../lib/soloTimer'
import type { SoloPenalty, SoloSolve } from '../lib/soloTimer'
import './SoloTimer.css'

type Phase = 'idle'|'inspection'|'holding'|'running'|'stopped'
type Props = { precision: 2|3; onActiveChange: (value:boolean)=>void; reducedMotion:boolean; onRaceClick:()=>void }
const clock = () => performance.now()
function loadSolves(): SoloSolve[] {
  try { return parseSoloSolves(JSON.parse(window.localStorage.getItem(SOLO_TIMER_STORAGE_KEY) || '[]')) }
  catch { return [] }
}
const timeLabel = (value:number|null|undefined, precision:2|3) => value===undefined?'—':value===null?'DNF':formatTime(value,precision)

type SolveCardProps = {
  solve: SoloSolve
  number: number
  precision: 2 | 3
  personalBest: boolean
  expanded: boolean
  copied: boolean
  disabled: boolean
  onToggle: (id: string) => void
  onPenaltyChange: (id: string, penalty: SoloPenalty) => void
  onCopyScramble: (id: string, scramble: string) => void
}

// Keep the list inexpensive while the timer updates every 25ms.
const SolveCard = memo(function SolveCard({
  solve, number, precision, personalBest, expanded, copied, disabled,
  onToggle, onPenaltyChange, onCopyScramble,
}: SolveCardProps) {
  const official = officialSoloMs(solve)
  const date = new Date(solve.createdAt)
  const shortDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const fullDate = date.toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  const result = timeLabel(official, precision)
  return <article className={`solo-solve-card${expanded?' solo-solve-card-open':''}${personalBest?' solo-solve-card-best':''}${solve.penalty==='dnf'?' solo-solve-card-dnf':''}`}>
    <button type="button" className="solo-solve-card-trigger" disabled={disabled}
      onClick={() => onToggle(solve.id)} aria-expanded={expanded}
      aria-controls={expanded?`solo-solve-details-${solve.id}`:undefined}
      aria-label={`Solve ${number}: ${result}${official===null?'':' seconds'}, ${shortDate}. ${expanded?'Hide':'Show'} details`}>
      <span className="solo-solve-card-top"><span>{shortDate}</span><ChevronDown size={14} aria-hidden="true"/></span>
      <span className="solo-solve-card-time">{result}{official!==null&&<small>s</small>}</span>
      <span className="solo-solve-card-flags">
        {personalBest&&<span className="solo-solve-pb"><Trophy size={11}/> PB</span>}
        {solve.penalty==='plus2'&&<span className="solo-solve-penalty-tag">+2</span>}
        {solve.penalty==='dnf'&&<span className="solo-solve-penalty-tag solo-solve-dnf-tag">DNF</span>}
        {!personalBest&&solve.penalty==='none'&&<span className="solo-solve-number">#{number}</span>}
      </span>
    </button>
    {expanded&&<div className="solo-solve-details" id={`solo-solve-details-${solve.id}`}>
      <div className="solo-solve-details-heading"><strong>Solve #{number}</strong><span>3×3×3</span></div>
      <div className="solo-solve-details-fields">
        <div><span>Recorded</span><strong>{fullDate}</strong></div>
        <div><span>Raw time</span><strong>{formatTime(solve.rawMs,precision)}s</strong></div>
        <div><span>Final result</span><strong>{result}{official!==null?'s':''}</strong></div>
        <label className="solo-solve-penalty-field"><span>Penalty</span>
          <select value={solve.penalty} disabled={disabled} aria-label={`Penalty for solve ${number}`}
            onChange={event=>onPenaltyChange(solve.id,event.target.value as SoloPenalty)}>
            <option value="none">OK</option><option value="plus2">+2 seconds</option><option value="dnf">DNF</option>
          </select>
        </label>
      </div>
      <div className="solo-solve-scramble-heading"><strong>Scramble</strong><button type="button" onClick={()=>onCopyScramble(solve.id,solve.scramble)}><Copy size={13}/>{copied?'Copied!':'Copy'}</button></div>
      <p className="solo-solve-scramble">{solve.scramble}</p>
    </div>}
  </article>
})

export default function SoloTimer({ precision, onActiveChange, reducedMotion, onRaceClick }: Props) {
  const [solves,setSolves] = useState<SoloSolve[]>(loadSolves)
  const [scramble,setScramble] = useState(generateScramble)
  const [phase,setPhase] = useState<Phase>('idle')
  const [inspectionEnabled,setInspectionEnabled] = useState(false)
  const [tick,setTick] = useState(clock)
  const [holdSince,setHoldSince] = useState<number|null>(null)
  const [displayResult,setDisplayResult] = useState<SoloSolve|null>(null)
  const [copied,setCopied] = useState(false)
  const [confirmClear,setConfirmClear] = useState(false)
  const [visibleCount,setVisibleCount] = useState(40)
  const [expandedSolveId,setExpandedSolveId] = useState<string|null>(null)
  const [copiedHistoryId,setCopiedHistoryId] = useState<string|null>(null)
  const [statsExpanded,setStatsExpanded] = useState(false)
  const [historyExpanded,setHistoryExpanded] = useState(false)
  const holdSinceRef = useRef<number|null>(null)
  const startRef = useRef<number|null>(null)
  const inspectionRef = useRef<number|null>(null)
  const beforeHoldRef = useRef<Phase>('idle')
  const holdInputRef = useRef<'pointer'|'keyboard'|null>(null)
  const pressedKeysRef = useRef(false)
  const phaseRef = useRef<Phase>('idle')
  const latestScrambleRef = useRef(scramble)
  const padRef = useRef<HTMLButtonElement|null>(null)
  phaseRef.current = phase
  latestScrambleRef.current = scramble

  useEffect(()=>{
    try { window.localStorage.setItem(SOLO_TIMER_STORAGE_KEY, JSON.stringify(solves.slice(-SOLO_SOLVE_LIMIT))) }
    catch {/* private mode or storage disabled */}
  },[solves])

  const active = ['inspection','holding','running'].includes(phase)
  useEffect(()=>{onActiveChange(active);return()=>onActiveChange(false)},[active,onActiveChange])
  useEffect(()=>{
    if(!active)return
    const handleBeforeUnload=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''}
    window.addEventListener('beforeunload',handleBeforeUnload)
    return()=>window.removeEventListener('beforeunload',handleBeforeUnload)
  },[active])
  useEffect(()=>{
    if(!active)return
    const interval=window.setInterval(()=>setTick(clock()), 25)
    return()=>window.clearInterval(interval)
  },[active])
  useEffect(()=>{
    const onHidden=()=>{
      if(document.hidden && holdSinceRef.current !== null){
        holdSinceRef.current=null;holdInputRef.current=null;setHoldSince(null)
        setPhase(beforeHoldRef.current)
      }
    }
    document.addEventListener('visibilitychange',onHidden)
    return()=>document.removeEventListener('visibilitychange',onHidden)
  },[])

  const stop = useCallback(()=>{
    if(phaseRef.current!=='running' || startRef.current===null)return
    const ms=Math.max(0,Math.round(clock()-startRef.current))
    const elapsedInspection=inspectionRef.current===null ? 0 : startRef.current-inspectionRef.current
    const penalty:SoloPenalty=inspectionRef.current===null?'none':elapsedInspection>17_000?'dnf':elapsedInspection>15_000?'plus2':'none'
    const solve:SoloSolve={id:newId(),createdAt:Date.now(),rawMs:ms,scramble:latestScrambleRef.current,penalty}
    setSolves(previous=>[...previous,solve].slice(-SOLO_SOLVE_LIMIT))
    setDisplayResult(solve)
    startRef.current=null;inspectionRef.current=null
    holdSinceRef.current=null;holdInputRef.current=null;setHoldSince(null)
    setScramble(generateScramble())
    setPhase('stopped')
  },[])

  const startHold = useCallback((source:'pointer'|'keyboard')=>{
    if(phaseRef.current==='running') {stop();return}
    if(phaseRef.current==='holding' || holdSinceRef.current!==null)return
    beforeHoldRef.current=phaseRef.current
    holdInputRef.current=source
    const at=clock()
    holdSinceRef.current=at
    setHoldSince(at)
    setPhase('holding')
    setTick(at)
  },[stop])
  const finishHold=useCallback((source:'pointer'|'keyboard')=>{
    if(holdInputRef.current!==source || holdSinceRef.current===null)return
    const duration=clock()-holdSinceRef.current
    const previous=beforeHoldRef.current
    holdSinceRef.current=null;holdInputRef.current=null;setHoldSince(null)
    if(duration<ARM_DELAY_MS){setPhase(previous);return}
    startRef.current=clock()
    setTick(startRef.current)
    setPhase('running')
  },[])

  useEffect(()=>{
    const keyDown=(event:KeyboardEvent)=>{
      if(event.code!=='Space' || event.repeat || event.altKey || event.metaKey || event.ctrlKey)return
      const target=event.target as HTMLElement | null
      if(target?.closest('input, textarea, select, a, [contenteditable="true"]'))return
      if(target?.closest('button') && target!==padRef.current && phaseRef.current!=='running')return
      event.preventDefault()
      if(pressedKeysRef.current)return
      pressedKeysRef.current=true
      startHold('keyboard')
    }
    const keyUp=(event:KeyboardEvent)=>{
      if(event.code!=='Space' || !pressedKeysRef.current)return
      event.preventDefault()
      pressedKeysRef.current=false
      finishHold('keyboard')
    }
    const onBlur=()=>{
      pressedKeysRef.current=false
      if(holdInputRef.current==='keyboard' && holdSinceRef.current!==null){
        holdSinceRef.current=null;holdInputRef.current=null;setHoldSince(null);setPhase(beforeHoldRef.current)
      }
    }
    document.addEventListener('keydown',keyDown)
    document.addEventListener('keyup',keyUp)
    window.addEventListener('blur',onBlur)
    return()=>{document.removeEventListener('keydown',keyDown);document.removeEventListener('keyup',keyUp);window.removeEventListener('blur',onBlur)}
  },[startHold,finishHold])

  const pointerDown=(event:ReactPointerEvent<HTMLButtonElement>)=>{
    if(event.button!==0)return
    if(phaseRef.current==='running'){event.preventDefault();stop();return}
    if(phaseRef.current==='holding')return
    event.currentTarget.setPointerCapture(event.pointerId)
    startHold('pointer')
  }
  const pointerUp=(event:ReactPointerEvent<HTMLButtonElement>)=>{
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)
    finishHold('pointer')
  }
  const cancelPointer=()=>{
    if(holdInputRef.current!=='pointer')return
    holdInputRef.current=null;holdSinceRef.current=null;setHoldSince(null)
    setPhase(beforeHoldRef.current)
  }
  const beginInspection=()=>{
    if(active)return
    inspectionRef.current=clock();setTick(inspectionRef.current)
    setDisplayResult(null)
    setPhase('inspection')
  }
  const cancelInspection=()=>{
    if(phase==='running'||phase==='holding')return
    inspectionRef.current=null;setPhase(displayResult?'stopped':'idle')
  }
  const changeScramble=()=>{
    if(active)return
    setScramble(generateScramble());setCopied(false)
    setPhase('idle');setDisplayResult(null)
  }
  const copyScramble=async()=>{
    try{await navigator.clipboard.writeText(scramble);setCopied(true);window.setTimeout(()=>setCopied(false),1600)}catch{/* clipboard unavailable */}
  }
  const editPenalty=useCallback((id:string,penalty:SoloPenalty)=>{
    setSolves(prev=>prev.map(s=>s.id===id?{...s,penalty}:s))
    setDisplayResult(prev=>prev?.id===id?{...prev,penalty}:prev)
  },[])
  const toggleSolve=useCallback((id:string)=>setExpandedSolveId(prev=>prev===id?null:id),[])
  const copyHistoryScramble=useCallback(async(id:string,historyScramble:string)=>{
    try {
      await navigator.clipboard.writeText(historyScramble)
      setCopiedHistoryId(id)
      window.setTimeout(()=>setCopiedHistoryId(current=>current===id?null:current),1800)
    } catch {/* Clipboard access can be unavailable outside HTTPS. */}
  },[])
  const deleteLast=()=>{
    if(active || solves.length===0)return
    if(!window.confirm('Delete your most recent solo solve?'))return
    const last=solves[solves.length-1]
    setSolves(prev=>prev.slice(0,-1))
    setExpandedSolveId(prev=>prev===last.id?null:prev)
    if(displayResult?.id===last.id)setDisplayResult(null)
  }
  const clearHistory=()=>{
    if(active)return
    setSolves([]);setDisplayResult(null);setExpandedSolveId(null);setVisibleCount(40);setConfirmClear(false)
  }

  const elapsed=phase==='running' && startRef.current!==null? Math.max(0,tick-startRef.current):0
  const held=holdSince===null?0:Math.max(0,tick-holdSince)
  const armed=phase==='holding' && held>=ARM_DELAY_MS
  const inspectionElapsed=inspectionRef.current===null?0:Math.max(0,tick-inspectionRef.current)
  const inspecting=phase==='inspection'||(phase==='holding' && inspectionRef.current!==null)
  const lastOfficial=displayResult?officialSoloMs(displayResult):undefined
  const display=phase==='running'?formatTime(elapsed,precision)
    :phase==='holding'?'0.'+('0'.repeat(precision))
    :phase==='stopped'?timeLabel(lastOfficial,precision)
    :'0.'+('0'.repeat(precision))
  const prompt=phase==='running'?'Tap or press Space to stop'
    :phase==='holding'?(armed?'READY — RELEASE TO START':'KEEP HOLDING TO ARM')
    :phase==='inspection'?'INSPECTION ACTIVE · HOLD TO START'
    :phase==='stopped'?'SOLVE SAVED · HOLD FOR NEXT SOLVE'
    :'HOLD SPACE OR PRESS AND HOLD THE TIMER'
  const recent=useMemo(()=>solves.slice(-visibleCount).reverse(),[solves,visibleCount])
  const {best,mean,ao5,ao12}=useMemo(()=>({
    best:soloBest(solves),mean:soloMean(solves),
    ao5:soloAverageOf(solves,5),ao12:soloAverageOf(solves,12),
  }),[solves])

  return <div className={`solo-page${reducedMotion?' solo-reduced-motion':''}`}>
    <header className="solo-heading">
      <div><div className="solo-eyebrow"><Sparkles size={15}/> CUBE HERO · YOUR PERSONAL TRAINING ARENA</div><h1>Solo <span>Timer.</span></h1><p>No opponents. No pressure. Just you, your cube, and a new personal best.</p></div>
      <div className="solo-heading-pill"><span className="solo-live-dot"/> LOCAL PRACTICE <strong>3×3×3</strong></div>
    </header>

    <section className="solo-main-surface" aria-label="Solo 3 by 3 cube timer">
      <div className="solo-halo solo-halo-a" aria-hidden="true"/><div className="solo-halo solo-halo-b" aria-hidden="true"/>
      <div className="solo-scramble-top"><span><Shuffle size={17}/> NEW SCRAMBLE <small>WCA-STYLE 3×3 MOVES</small></span><div className="solo-scramble-actions"><button type="button" onClick={copyScramble} className="solo-icon-button" aria-label="Copy scramble"><Copy size={16}/>{copied?'Copied':'Copy'}</button><button type="button" onClick={changeScramble} disabled={active} className="solo-icon-button"><RotateCcw size={16}/> New</button></div></div>
      <div className="solo-scramble-text" aria-label="Current scramble">{scramble.split(' ').map((move,i)=><span key={`${i}:${move}`} className={i%2===0?'solo-move-even':'solo-move-odd'}>{move}</span>)}</div>
      <div className="solo-timer-divider"/>
      <div className="solo-timer-meta"><span className="solo-status-dot"/> {phase==='running'?'SOLVING':inspecting?'INSPECTING':phase==='holding'?'GET READY':'READY WHEN YOU ARE'} <span className="solo-meta-right">STACKMAT-STYLE · 1.5S HOLD</span></div>
      <button
        ref={padRef} type="button" className={`solo-timer-pad solo-phase-${phase}${armed?' solo-armed':''}`}
        onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={cancelPointer}
        onContextMenu={event=>event.preventDefault()}
        aria-label={phase==='running'?'Stop the solo timer':`Solo timer. ${prompt.toLowerCase()}`}>
        <span className="solo-pad-corner solo-corner-one"/><span className="solo-pad-corner solo-corner-two"/>
        <span className={`solo-time${display.length >= 7 ? ' solo-time-long' : ''}`} aria-live="off">{display}</span>
        <span className="solo-timer-prompt">{prompt}</span>
        <span className="solo-hold-track" aria-hidden="true"><span style={{width:`${phase==='holding'?Math.min(100,held/ARM_DELAY_MS*100):0}%`}}/></span>
      </button>
      <div className="solo-below-timer">
        <div className="solo-input-hint"><Keyboard size={16}/><span className="solo-help-desktop">Desktop: hold Space for 1.5s, release to start · Space to stop</span><span className="solo-help-mobile">Hold for 1.5s → release to start · tap to stop</span></div>
        <div className="solo-inspection-controls"><label className="solo-check"><input type="checkbox" checked={inspectionEnabled} disabled={active} onChange={event=>setInspectionEnabled(event.target.checked)}/><span>15-second inspection</span></label>{inspectionEnabled&&<>{!inspecting&&phase!=='running'&&<button type="button" className="solo-inspect-btn" onClick={beginInspection}><Clock3 size={16}/> Start inspection</button>}{inspecting&&<><span className={`solo-inspection-count${inspectionElapsed>=15_000?' solo-warning':''}`}>{Math.max(0,Math.ceil((15_000-inspectionElapsed)/1000))}s {inspectionElapsed>17_000?'DNF':inspectionElapsed>15_000?'+2':''}</span>{phase==='inspection'&&<button type="button" className="solo-inspect-btn" onClick={cancelInspection}>Cancel</button>}</>}</> }</div>
      </div>
      {phase==='stopped'&&displayResult&&<div className="solo-result-banner"><Check size={17}/><span><strong>{lastOfficial===null?'DNF':`${formatTime(lastOfficial,precision)}s`}</strong> saved locally.</span><span className="solo-result-penalties">{(['none','plus2','dnf'] as const).map(p=><button type="button" key={p} className={displayResult.penalty===p?'active':''} onClick={()=>editPenalty(displayResult.id,p)}>{p==='none'?'OK':p==="plus2"?'+2':'DNF'}</button>)}</span></div>}
    </section>

    <section className={`solo-stats-section${statsExpanded?' solo-expanded':''}`} aria-label="Personal timer statistics">
      <button type="button" className="solo-section-toggle" aria-expanded={statsExpanded} aria-controls="solo-metrics-grid" onClick={()=>setStatsExpanded(value=>!value)}>
        <span className="solo-disclosure-label"><span className="solo-disclosure-icon"><BarChart3 size={19}/></span><span><strong>Statistics</strong><small>PB {timeLabel(best,precision)}{best!==null?'s':''} · Mean {timeLabel(mean,precision)}{mean!==null?'s':''}</small></span></span>
        <span className="solo-disclosure-action">{statsExpanded?'Hide':'View'} <ChevronDown size={18}/></span>
      </button>
      <div className="solo-metrics" id="solo-metrics-grid">
      <div className="solo-metric"><span><Trophy size={17}/> PERSONAL BEST</span><strong>{timeLabel(best,precision)}<small>{best===null?'':'s'}</small></strong><em>Fastest valid solve</em></div>
      <div className="solo-metric"><span><Zap size={17}/> SESSION MEAN</span><strong>{timeLabel(mean,precision)}<small>{mean===null?'':'s'}</small></strong><em>Valid solves only</em></div>
      <div className="solo-metric"><span><Flag size={17}/> CURRENT Ao5</span><strong>{timeLabel(ao5,precision)}<small>{ao5===null||ao5===undefined?'':'s'}</small></strong><em>Trimmed average of 5</em></div>
      <div className="solo-metric"><span><Timer size={17}/> CURRENT Ao12</span><strong>{timeLabel(ao12,precision)}<small>{ao12===null||ao12===undefined?'':'s'}</small></strong><em>Trimmed average of 12</em></div>
      </div>
    </section>

    <section className={`solo-history${historyExpanded?' solo-expanded':''}`} aria-label="Solo practice history">
      <button type="button" className="solo-section-toggle" aria-expanded={historyExpanded} aria-controls="solo-history-panel" onClick={()=>setHistoryExpanded(value=>!value)}>
        <span className="solo-disclosure-label"><span className="solo-disclosure-icon"><History size={19}/></span><span><strong>Solve History</strong><small>{solves.length} {solves.length===1?'solve':'solves'} saved locally</small></span></span>
        <span className="solo-disclosure-action">{historyExpanded?'Hide':'View'} <ChevronDown size={18}/></span>
      </button>
      <div className="solo-history-panel" id="solo-history-panel"><div className="solo-history-title"><div><span className="solo-eyebrow"><ShieldCheck size={15}/> SAVED ON THIS DEVICE</span><h2>Your solves <small>{solves.length} recorded</small></h2></div><div className="solo-history-actions"><button type="button" disabled={!solves.length||active} onClick={deleteLast}><RotateCcw size={15}/> Undo last</button><button type="button" disabled={!solves.length||active} onClick={()=>setConfirmClear(true)}><Trash2 size={15}/> Clear</button></div></div>
      {solves.length===0
        ? <div className="solo-empty"><Timer size={25}/><strong>Your next PB starts here.</strong><p>Complete a solve to see your times and averages.</p></div>
        : <>
          <div className="solo-solves-caption"><span>Newest first · Tap a solve for details</span><span>Showing {recent.length} of {solves.length}</span></div>
          <div className="solo-solves-grid" aria-label="Your solo solves, newest first">
            {recent.map((solve,index)=><SolveCard key={solve.id} solve={solve} number={solves.length-index}
              precision={precision} personalBest={officialSoloMs(solve)!==null && officialSoloMs(solve)===best}
              expanded={expandedSolveId===solve.id} copied={copiedHistoryId===solve.id} disabled={active}
              onToggle={toggleSolve} onPenaltyChange={editPenalty} onCopyScramble={copyHistoryScramble}/>)}
          </div>
          <div className="solo-solves-pagination">
            {visibleCount<solves.length&&<button type="button" className="solo-history-more" onClick={()=>setVisibleCount(count=>Math.min(solves.length,count+40))}>Show older solves <ChevronDown size={15}/></button>}
            {visibleCount>40&&<button type="button" className="solo-history-more solo-history-fewer" onClick={()=>{setVisibleCount(40);setExpandedSolveId(null)}}>Show fewer</button>}
          </div>
        </>}
      <div className="solo-history-foot"><CircleHelp size={15}/> Solo solves stay separate from AI races and Hero Journey XP. Browser storage can be cleared by your browser. <button type="button" onClick={onRaceClick}>Want a rival? Race AI <ArrowRight size={14}/></button></div>
      </div>
    </section>
    {confirmClear&&<div className="solo-confirm-scrim" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setConfirmClear(false)}}><section className="solo-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="solo-confirm-title"><Trash2 size={30}/><h2 id="solo-confirm-title">Clear solo history?</h2><p>This permanently deletes all {solves.length} saved solo solves from this browser. AI race history and Hero Journey will not be affected.</p><div><button type="button" onClick={()=>setConfirmClear(false)}>Keep my solves</button><button type="button" className="solo-danger" onClick={clearHistory}>Delete solo history</button></div></section></div>}
  </div>
}
