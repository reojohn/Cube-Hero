import PlayerAvatar from './PlayerAvatar'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ArrowRight, BrainCircuit, Check, ChevronLeft, CircleHelp, Clock3, Copy, Flag, Keyboard, Layers3, LoaderCircle, RotateCcw, ShieldCheck, Shuffle, SlidersHorizontal, Trophy, X } from 'lucide-react'
import AiCube3D from './AiCube3D'
import MobileRaceCube from './MobileRaceCube'
import MobileAiPortrait from './MobileAiPortrait'
import { AI_RIVALS, getRival } from '../lib/rivals'
import LiveTimerText from './LiveTimerText'
import { competitionRenderIntervalMs, isAndroidBrowser, isCompactPerformanceViewport, MOBILE_PERFORMANCE_QUERY, scheduleOpponentFinishRefreshes, shouldRenderAndroidOnFinishOnly } from '../lib/mobilePerformance'
import InspectionModal from './InspectionModal'
import RaceMechanicsModal from './RaceMechanicsModal'
import { createAiPlan } from '../lib/aiPlan'
import type { AiPlan } from '../lib/aiPlan'
import { aiPrefetch } from '../lib/aiPrefetch'
import { ARM_DELAY_MS, armProgressPercent, isValidStartRelease } from '../lib/stackmat'
import { includeEndedHold, inspectionElapsedMs } from '../lib/inspectionClock'
import { createRecord, formatTime, generateScramble, getAiCount, getAiPersonality, inspectionPenalty, RACE_COUNT } from '../lib/racing'
import type { InspectionPenalty, RaceRecord, RaceSession } from '../lib/racing'
import { playGameSound } from '../lib/gameAudio'

type Stage='scramble'|'ready'|'inspection'|'running'|'waiting'
type HoldSource = 'keyboard' | 'pointer'
type Props={session:RaceSession;goTo:(page:'race'|'room'|'results')=>void;onComplete:(record:RaceRecord)=>void;toast:(message:string)=>void;precision:2|3;sound:boolean;reducedMotion:boolean;onActiveChange:(value:boolean)=>void}
const msNow=()=>performance.now()

type BeginnerMove = {
  raw:string
  face:'L'|'R'|'U'|'D'|'F'|'B'
  suffix:''|"'"|'2'
  faceLabel:string
  faceArrow:string
  turnSymbol:string
  instruction:string
}
const FACE_GUIDE:Record<BeginnerMove['face'],{label:string;arrow:string}>={
  L:{label:'Left face',arrow:'←'},
  R:{label:'Right face',arrow:'→'},
  U:{label:'Up face',arrow:'↑'},
  D:{label:'Down face',arrow:'↓'},
  F:{label:'Front face',arrow:'⤢'},
  B:{label:'Back face',arrow:'⤡'},
}
function parseBeginnerMoves(scramble:string):BeginnerMove[]{
  return scramble.trim().split(/\s+/).map((raw)=>{
    const face=(raw[0] as BeginnerMove['face'])
    const suffix=(raw.endsWith("2")?'2':raw.endsWith("'")?"'":'') as BeginnerMove['suffix']
    const info=FACE_GUIDE[face] ?? {label:'Face turn',arrow:'↻'}
    const turnLabel=suffix==='2'?'turn twice':suffix==="'"?'reverse turn':'clockwise turn'
    const turnSymbol=suffix==='2'?'2×':suffix==="'"?'↺':'↻'
    return {raw,face,suffix,faceLabel:info.label,faceArrow:info.arrow,turnSymbol,instruction:`${info.label} · ${turnLabel}`}
  })
}
const ScrambleBeginnerGuide = memo(function ScrambleBeginnerGuide({scramble}:{scramble:string}){
  const moves=parseBeginnerMoves(scramble)
  return <div className="ch-compact-helper" aria-label="Compact beginner scramble guide">
    <div className="ch-compact-heading">
      <strong>Beginner Arrows <span className="ch-compact-badge">2-ROW COMPACT</span></strong>
      <span className="ch-compact-notation"><b>↻</b> normal <b>↺</b> reverse (') <b>2×</b> twice</span>
    </div>
    <div className="ch-compact-faces" aria-label="Face selection arrows">
      {Object.entries(FACE_GUIDE).map(([face,info])=><span className="ch-compact-face" key={face} title={info.label}><b>{face}</b> {info.arrow}</span>)}
      <span className="ch-compact-note">Face arrows = location · curved arrows = turn viewed straight at the face.</span>
    </div>
    <div className="ch-compact-scroll" role="region" tabIndex={0} aria-label="Scramble moves in exactly two rows; scroll horizontally to see more">
      <div className="ch-compact-track" style={{display:'grid',gridAutoFlow:'column',gridTemplateRows:'repeat(2, 46px)',gridAutoColumns:'70px',width:'max-content',gap:'5px'}}>
        {moves.map((move,index)=><div className="ch-compact-move" key={`${move.raw}-${index}`} title={`Move ${index+1}: ${move.instruction}`} aria-label={`Move ${index+1}: ${move.instruction}`}>
          <span className="ch-move-index">{index+1}</span>
          <span className="ch-move-token">{move.raw}</span>
          <span className="ch-move-arrow">{move.faceArrow} <b>{move.turnSymbol}</b></span>
        </div>)}
      </div>
    </div>
    <div className="ch-compact-hint">Read top → bottom, then move right. <span>Swipe sideways for the remaining moves →</span></div>
  </div>})

/**
 * The inspect call-to-action uses the browser Web Animations API rather than
 * animation CSS classes. This keeps the pulse reliable if Vite/Windows still
 * has an earlier copy of styles.css cached.
 *
 * The React stage change unmounts this button and cancels all animations.
 */
function InspectReadyButton({
  ready, pulseAllowed, inspection, onClick,
}:{ready:boolean; pulseAllowed:boolean; inspection:boolean; onClick:()=>void}){
  const firstRingRef=useRef<HTMLSpanElement|null>(null)
  const secondRingRef=useRef<HTMLSpanElement|null>(null)
  useEffect(()=>{
    if(!ready||!pulseAllowed)return
    const animations:Animation[]=[]
    for (const [index,ring] of [firstRingRef.current,secondRingRef.current].entries()){
      if(!ring||typeof ring.animate!=='function')continue
      animations.push(ring.animate([
        {offset:0,opacity:0,transform:'scale(.985)'},
        {offset:.22,opacity:.75,transform:'scale(1.01)'},
        {offset:1,opacity:0,transform:'scale(1.16)'},
      ],{duration:1700,iterations:Infinity,delay:index*850,easing:'ease-out'}))
    }
    return()=>{for(const animation of animations)animation.cancel()}
  },[ready,pulseAllowed])
  const ringStyle={
    position:'absolute' as const,
    inset:'-4px',
    border:'2px solid #c88fff',
    borderRadius:'12px',
    opacity:0,
    pointerEvents:'none' as const,
    zIndex:0,
  }
  return <span className="inspect-cta-wrap" style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',maxWidth:'100%',isolation:'isolate'}}>
    {ready&&pulseAllowed&&<>
      <span ref={firstRingRef} aria-hidden="true" style={ringStyle}/>
      <span ref={secondRingRef} aria-hidden="true" style={{...ringStyle,borderColor:'#8265ff'}}/>
    </>}
    <button
            type="button"
      disabled={!ready}
      className="btn btn-primary btn-sm"
      style={ready?{
        position:'relative',zIndex:1,
        border:'2px solid #dfb5ff',
        borderRadius:'10px',
        padding:'9px 15px',
        background:'linear-gradient(105deg,#6652ff,#aa37ff 57%,#684aff)',
        boxShadow:'0 0 15px rgba(154,64,255,.48)',
        color:'#fff',
        minHeight:'42px',
        whiteSpace:'normal',
      }:{position:'relative',zIndex:1}}
      onClick={onClick}
      title={ready ? 'Ready to inspect — click when your cube is scrambled' : 'Waiting for the CFOP solution'}
    >
      <Check size={15}/>{inspection?'I’m Scrambled — Inspect':'I’m Scrambled — Ready'}
      {ready&&<span aria-hidden="true" style={{display:'inline-flex',alignItems:'center',padding:'4px 6px',borderRadius:'5px',fontWeight:900,fontSize:'9px',letterSpacing:'.4px',background:'#fff1a5',color:'#251039',border:'1px solid #fff5c8'}}>READY</span>}
    </button>
  </span>
}

export default function RaceRoom({session,goTo,onComplete,toast,precision,sound,reducedMotion,onActiveChange}:Props){
  const [stage,setStage]=useState<Stage>('scramble')
  // Explicitly open the inspection dialog on the Inspect click, independently of the timer render.
  const [inspectionModalOpen,setInspectionModalOpen]=useState(false)
  const [mechanicsModalOpen,setMechanicsModalOpen]=useState(false)
  const [holdStartedAt,setHoldStartedAt]=useState<number|null>(null)
  const [holdTooShort,setHoldTooShort]=useState(false)
  const activeHold=useRef<{source:HoldSource;startedAt:number;pointerId?:number}|null>(null)
  const racersRef=useRef<HTMLDivElement|null>(null)
  // Peek, rather than consume, in the initializer: React StrictMode may
  // run state initializers twice before committing a render.
  const [scramble,setScramble]=useState(()=>aiPrefetch.peekNext() ?? generateScramble())
  // Claim after commit so the already-verified/in-flight solve remains reusable.
  useEffect(()=>{aiPrefetch.claimInitial(scramble)},[scramble])
  const [plans,setPlans]=useState<AiPlan[]>([])
  const plan=plans[0]??null
  const [solverStatus,setSolverStatus]=useState<'preparing'|'ready'|'error'>('preparing')
  const [solverError,setSolverError]=useState('')
  const [retry,setRetry]=useState(0)
  const [tick,setTick]=useState(msNow)
  // Competition UI is cheaper on phones; official timings remain high-resolution.
  const [compactRendering,setCompactRendering]=useState(isCompactPerformanceViewport)
  const [copied,setCopied]=useState(false)
  const [systemReducedMotion,setSystemReducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    const update=()=>setSystemReducedMotion(media.matches)
    update()
    media.addEventListener('change',update)
    return()=>media.removeEventListener('change',update)
  },[])
  const [playerStopped,setPlayerStopped]=useState<number|null>(null)
  const [penalty,setPenalty]=useState<InspectionPenalty>('none')
  const inspectionRef=useRef<number|null>(null)
  // Once a Stackmat hold begins, inspection time is frozen at that instant.
  // Invalid or canceled holds resume the clock without gaining extra inspection time.
  const inspectionPausedAtRef=useRef<number|null>(null)
  const inspectionPausedTotalRef=useRef(0)
  const startRef=useRef<number|null>(null)
  const stoppedRef=useRef<number|null>(null)
  const penaltyRef=useRef<InspectionPenalty>('none')
  const completeRef=useRef(false)
  const keyActionRef=useRef<(event:KeyboardEvent)=>void>(()=>{})
  const keyReleaseRef=useRef<(event:KeyboardEvent)=>void>(()=>{})
  const total=RACE_COUNT[session.settings.raceLength]
  const aiCount=getAiCount(session.settings.aiCount)
  const aiPersonality=getAiPersonality(session.settings.personality)
  const personalityName=aiPersonality.charAt(0).toUpperCase()+aiPersonality.slice(1)
  // Match the exact visual rival sequence used by VsIntro. Their Sub-level and
  // solving behaviour remain the configured race difficulty for every AI.
  // The small approved 160px portraits are only rendered in compact mobile mode.
  const mobileOpponentPortraits=useMemo(()=>{
    const featured=getRival(session.settings.difficulty)
    const division=AI_RIVALS.filter(candidate=>candidate.division===featured.division)
    const first=Math.max(0,division.findIndex(candidate=>candidate.difficulty===featured.difficulty))
    return Array.from({length:aiCount},(_,index)=>division[(first+index)%division.length]??featured)
  },[session.settings.difficulty,aiCount])
  const round=session.records.length+1
  function inspectionElapsedAt(now:number){
    return inspectionElapsedMs(inspectionRef.current,now,inspectionPausedTotalRef.current,inspectionPausedAtRef.current)
  }
  function resumeInspection(now:number){
    if(inspectionPausedAtRef.current===null)return
    inspectionPausedTotalRef.current=includeEndedHold(inspectionPausedTotalRef.current,inspectionPausedAtRef.current,now)
    inspectionPausedAtRef.current=null
  }
  const inspectionMs=inspectionElapsedAt(tick)
  const holdElapsedMs=holdStartedAt===null?0:Math.max(0,tick-holdStartedAt)
  const holdProgress=armProgressPercent(holdStartedAt,tick)
  const holdArmed=holdStartedAt!==null && holdElapsedMs>=ARM_DELAY_MS
  const inspectionSoundSecond=useRef(-1)
  const announcedAiFinishes=useRef(0)
  useEffect(()=>{
    if(stage!=='inspection') {inspectionSoundSecond.current=-1;return}
    const second=Math.ceil((15_000-inspectionMs)/1000)
    if(second>=1&&second<=3&&inspectionSoundSecond.current!==second){
      inspectionSoundSecond.current=second
      if(sound)playGameSound('countdown')
    }
  },[stage,inspectionMs,sound])
  useEffect(()=>{
    if(holdArmed && (stage==='ready'||stage==='inspection') && sound)playGameSound('ready')
  },[holdArmed,stage,sound])
  useEffect(()=>{
    if((stage!=='running'&&stage!=='waiting')||startRef.current===null){
      announcedAiFinishes.current=0
      return
    }
    const count=plans.filter(rival=>tick-startRef.current!>=rival.totalMs).length
    if(count>announcedAiFinishes.current&&sound)playGameSound('opponentFinish')
    announcedAiFinishes.current=count
  },[stage,plans,tick,sound])
  const currentPenalty=stage==='inspection'?inspectionPenalty(inspectionMs):penalty
  const elapsed=startRef.current===null?0:Math.max(0,tick-startRef.current)
  const aiTarget=plan?.totalMs??0
  const aiElapsed=startRef.current===null?0:Math.min(aiTarget,elapsed)
  const lastAiFinishMs=plans.length?Math.max(...plans.map(p=>p.totalMs)):0
  const aiFinishedCount=startRef.current===null?0:plans.filter(p=>elapsed>=p.totalMs).length


  // Calculate an actual verified solution BEFORE inspection and racing begin.
  // Discard stale responses when a different scramble is selected.
  useEffect(()=>{
    let canceled=false
    setPlans([])
    setSolverStatus('preparing')
    setSolverError('')
    void aiPrefetch.prepare(scramble).then(solution=>{
      if(canceled)return
      // All competitors face the identical verified CFOP scramble. Their
      // times and stage-to-stage cadence are sampled independently.
      const next=Array.from({length:aiCount},(_,i)=>createAiPlan(scramble,solution,session.settings.difficulty,aiPersonality,i===0?'':`AI-${i+1}`))
      setPlans(next)
      setSolverStatus('ready')
    }).catch(error=>{
      if(canceled)return
      setSolverStatus('error')
      setSolverError(error instanceof Error?error.message:'Could not prepare the opponent.')
    })
    return()=>{canceled=true}
  },[scramble,session.settings.difficulty,aiPersonality,aiCount,retry])

  useEffect(()=>{onActiveChange(['inspection','running','waiting'].includes(stage));return()=>onActiveChange(false)},[stage,onActiveChange])
  useEffect(()=>{
    const query=window.matchMedia(MOBILE_PERFORMANCE_QUERY)
    const refresh=()=>setCompactRendering(query.matches)
    query.addEventListener('change',refresh)
    return()=>query.removeEventListener('change',refresh)
  },[])
  useEffect(()=>{
    if(!['inspection','running','waiting'].includes(stage) && !(stage==='ready' && holdStartedAt!==null))return
    // Android: the live stopwatches and turning cube already run independently.
    // Avoid a costly full RaceRoom render every 360ms during the actual solve.
    if ((stage==='running'||stage==='waiting') && shouldRenderAndroidOnFinishOnly()) return
    const timer=window.setInterval(()=>setTick(msNow()),competitionRenderIntervalMs(stage==='running'||stage==='waiting'))
    return()=>window.clearInterval(timer)
  },[stage,holdStartedAt])
  useEffect(()=>{
    if (!['running','waiting'].includes(stage) || !shouldRenderAndroidOnFinishOnly()) return
    if (startRef.current===null || !plans.length) return
    return scheduleOpponentFinishRefreshes(startRef.current,plans.map(rival=>rival.totalMs),()=>setTick(msNow()))
  },[stage,plans])
  useEffect(()=>{
    const down=(event:KeyboardEvent)=>keyActionRef.current(event)
    const up=(event:KeyboardEvent)=>keyReleaseRef.current(event)
    window.addEventListener('keydown',down)
    window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[])
  // A lost focus or a canceled touch can never leave the timer armed.
  useEffect(()=>{
    const reset=()=>cancelHold()
    const hidden=()=>{if(document.hidden)reset()}
    window.addEventListener('blur',reset)
    document.addEventListener('visibilitychange',hidden)
    return()=>{window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',hidden)}
  },[])
  useEffect(()=>{
    if(!['running','waiting','inspection'].includes(stage))return
    const handler=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''}
    window.addEventListener('beforeunload',handler)
    return()=>window.removeEventListener('beforeunload',handler)
  },[stage])
  function completeRace(rawMs:number,pen:InspectionPenalty){
    if(completeRef.current||!plan||!plans.length)return
    completeRef.current=true
    // Keep aiMs as the fastest opponent for legacy statistics and the
    // single-opponent results panel. Every opponent is stored separately.
    const fastest=plans.reduce((best,item)=>item.totalMs<best.totalMs?item:best,plans[0])
    const fastestIndex=plans.indexOf(fastest)
    const opponents=plans.map((item,index)=>({id:`AI ${index+1}`,ms:item.totalMs}))
    const record=createRecord(session,scramble,rawMs,pen,fastest.totalMs,{solution:fastest.solution,moveCount:fastest.moves.length,qtm:fastest.qtm,segmentsMs:fastest.segmentsMs,method:fastest.method,cfopStages:fastest.cfopMarkers?.map(({id,moves})=>({id,moves})),opponents,variantKey:fastestIndex?`AI-${fastestIndex+1}`:''})
    if(sound)playGameSound(record.win?'victory':'loss',.19)
    onComplete(record)
  }
  function startInspection(){
    if(!plan || startRef.current!==null)return
    // Open immediately. This guards against the overlay failing to appear after the stage update.
    setInspectionModalOpen(true)
    inspectionRef.current=msNow()
    inspectionPausedAtRef.current=null
    inspectionPausedTotalRef.current=0
    setTick(inspectionRef.current)
    setStage('inspection')
    if(sound)playGameSound('inspect')
  }
  function markReady(){if(plan)setStage('ready')}
  // Stackmat-style start: the first press freezes inspection and ARMS the timer.
  // A valid release starts the race; an early release resumes the unused inspection time.
  function beginRace(){
    if(!plan || startRef.current!==null || !['ready','inspection'].includes(stage))return
    const now=msNow()
    const inspectionTime=inspectionElapsedAt(now)
    const p=session.settings.inspection?inspectionPenalty(inspectionTime):'none'
    penaltyRef.current=p;setPenalty(p)
    inspectionPausedAtRef.current=null
    startRef.current=now
    activeHold.current=null
    setHoldStartedAt(null)
    setHoldTooShort(false)
    setInspectionModalOpen(false)
    setTick(now);setStage('running')
    if(sound)playGameSound('start')
  }
  function startHold(source:HoldSource,pointerId?:number){
    if(!plan || startRef.current!==null || !['ready','inspection'].includes(stage) || activeHold.current)return
    const at=msNow()
    activeHold.current={source,startedAt:at,pointerId}
    if(stage==='inspection'&&inspectionRef.current!==null)inspectionPausedAtRef.current=at
    setHoldStartedAt(at)
    setHoldTooShort(false)
    setTick(at)
    if(sound)playGameSound('arm')
  }
  function finishHold(source:HoldSource,pointerId?:number){
    const held=activeHold.current
    if(!held || held.source!==source || (source==='pointer' && held.pointerId!==pointerId))return
    const now=msNow()
    if(isValidStartRelease(held.startedAt,now)){
      // Read inspection duration while paused, before releasing the clock for racing.
      beginRace()
    }else{
      resumeInspection(now)
      activeHold.current=null
      setHoldStartedAt(null)
      setHoldTooShort(true)
      setTick(now)
    }
  }
  function cancelHold(source?:HoldSource,pointerId?:number){
    const held=activeHold.current
    if(!held || (source && held.source!==source) || (source==='pointer' && held.pointerId!==pointerId))return
    const now=msNow()
    resumeInspection(now)
    activeHold.current=null
    setHoldStartedAt(null)
    setTick(now)
  }
  function onHoldPointerDown(event:ReactPointerEvent<HTMLElement>){
    if(event.button!==0)return
    if(!['ready','inspection'].includes(stage))return
    event.preventDefault()
    try{event.currentTarget.setPointerCapture(event.pointerId)}catch{/* capture not supported */}
    startHold('pointer',event.pointerId)
  }
  function onHoldPointerUp(event:ReactPointerEvent<HTMLElement>){
    event.preventDefault()
    finishHold('pointer',event.pointerId)
    try{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}catch{/* capture already released */}
  }
  function onHoldPointerCancel(event:ReactPointerEvent<HTMLElement>){cancelHold('pointer',event.pointerId)}
  // After the modal closes and the race begins, center BOTH racer panels in the viewport.
  // This runs once on the transition to 'running', never during solve timer ticks.
  useEffect(()=>{
    if(stage!=='running')return
    let secondFrame=0
    const firstFrame=window.requestAnimationFrame(()=>{
      secondFrame=window.requestAnimationFrame(()=>{
        const racers=racersRef.current
        if(!racers)return
        const bounds=racers.getBoundingClientRect()
        const offset=window.innerWidth<=740?86:Math.max(12,(window.innerHeight-bounds.height)/2)
        const top=Math.max(0,window.scrollY+bounds.top-offset)
        window.scrollTo({top,behavior:reducedMotion||systemReducedMotion?'instant':'smooth'})
      })
    })
    return()=>{window.cancelAnimationFrame(firstFrame);window.cancelAnimationFrame(secondFrame)}
  },[stage,reducedMotion,systemReducedMotion])
  function stopRace(){
    if(!plan||startRef.current===null||stoppedRef.current!==null)return
    const raw=msNow()-startRef.current
    if(raw<350)return
    stoppedRef.current=raw
    setPlayerStopped(raw)
    setTick(msNow())
    if(sound)playGameSound('stop')
    if(raw>=lastAiFinishMs)completeRace(raw,penaltyRef.current)
    else setStage('waiting')
  }
  useEffect(()=>{
    if(stage!=='waiting'||stoppedRef.current===null||startRef.current===null||!plan)return
    if(tick-startRef.current>=lastAiFinishMs)completeRace(stoppedRef.current,penaltyRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[stage,tick,plans])
  keyActionRef.current=(event:KeyboardEvent)=>{
    if(mechanicsModalOpen)return
    if(event.code!=='Space'||event.altKey||event.ctrlKey||event.metaKey)return
    const t=event.target as HTMLElement|null
    if(t && (t.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(t.tagName)))return
    if(!['ready','inspection','running'].includes(stage))return
    event.preventDefault()
    if(event.repeat)return
    if(stage==='running')stopRace()
    else startHold('keyboard')
  }
  keyReleaseRef.current=(event:KeyboardEvent)=>{
    if(event.code!=='Space' || activeHold.current?.source!=='keyboard')return
    event.preventDefault()
    finishHold('keyboard')
  }
  async function copy(){
    try {await navigator.clipboard.writeText(scramble);setCopied(true);window.setTimeout(()=>setCopied(false),1600)}
    catch{toast('Clipboard unavailable. Select the scramble text to copy it.')}
  }
  function leave(){goTo('race')}
  const stageLabel=stage==='scramble'?'SCRAMBLE YOUR CUBE':stage==='ready'?'READY TO START':stage==='inspection'?'INSPECTION RUNNING':stage==='running'?'RACE IN PROGRESS':'YOU FINISHED — AI STILL SOLVING'
  return <div className={`page-stack narrow-stack room-page phase2-room phase3-room ${stage==='running'||stage==='waiting'?'ch-performance-live':''}`}>
    <RaceMechanicsModal open={mechanicsModalOpen} mode="ai" onClose={()=>setMechanicsModalOpen(false)} />
    {inspectionModalOpen&&<InspectionModal elapsedMs={inspectionMs} penalty={currentPenalty} opponentLabel={`${aiCount>1?`${aiCount} AI rivals · `:''}Sub-${session.settings.difficulty} · ${personalityName}`} round={round} holding={holdStartedAt!==null} holdArmed={holdArmed} holdProgress={holdProgress} holdTooShort={holdTooShort} onHoldPointerDown={onHoldPointerDown} onHoldPointerUp={onHoldPointerUp} onHoldPointerCancel={onHoldPointerCancel}/> }
    <div className="room-heading"><div><button className="text-back" onClick={leave}><ChevronLeft size={17}/> Back to setup</button><h1>Race vs {aiCount===1?'AI':`${aiCount} AIs`} <span className="room-mid-dot">•</span> <span className="level-pill">Sub-{session.settings.difficulty}</span></h1><p>Round {round} of {total} · {personalityName} AI · {aiCount>1?`${aiCount} rivals, one shared scramble · `:''}CFOP-only solving</p></div><div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap',justifyContent:'flex-end'}}><button className="btn btn-outline btn-sm" type="button" onClick={()=>setMechanicsModalOpen(true)}><CircleHelp size={16}/> Mechanics · How Race AI Works</button><button className="btn btn-outline btn-sm" onClick={leave}><X size={16}/> Leave Race</button></div></div>
    <div className="live-status" role="status"><span className={`live-status-dot ${stage==='running'?'pulse':''}`}/><strong>{stageLabel}</strong><span>{stage==='waiting'?'Your time is locked in. The remaining AI rivals are finishing their solves.':stage==='scramble'?'Apply this scramble to your physical 3×3 cube.':stage==='ready'?'Hold Space or your timer for 1.5 seconds, then release.':stage==='inspection'?'Hold Space or the inspection screen for 1.5 seconds, then release.':'Every AI is solving the same scramble with its own simulated pace.'}</span></div>
    <section className="surface scramble-panel"><div className="scramble-meta"><Shuffle size={16}/> 3×3 Scramble · Round {round}</div><div className="scramble-line"><strong>{scramble}</strong><button type="button" title="Copy scramble" aria-label="Copy scramble" onClick={copy}>{copied?<Check size={21}/>:<Copy size={21}/>}</button></div><div className="scramble-subtext">25-turn practice scramble · Both racers start from the same exact cube state</div>{copied&&<div className="copied-indicator">Copied!</div>}<ScrambleBeginnerGuide scramble={scramble}/>
      {stage==='scramble'&&<><div className={`solver-prep solver-${solverStatus}`} role="status">{solverStatus==='preparing'?<><LoaderCircle size={16} className="spin-icon"/> Computing a verified CFOP solve (Cross → F2L → OLL → PLL)…</>:solverStatus==='ready'?<><ShieldCheck size={16}/> Verified CFOP solution ready · {plan?.moves.length} moves · {aiCount>1?`${aiCount} AI rivals prepared`: 'Cross / 4 F2L / OLL / PLL'}</>:<><X size={16}/> {solverError} <button type="button" className="inline-retry" onClick={()=>setRetry(n=>n+1)}>Retry</button></>}</div><div className="scramble-actions">
          <button type="button" className="btn btn-outline btn-sm scramble-new-button" onClick={()=>setScramble(aiPrefetch.takeNext())}><RotateCcw size={15}/> New Scramble</button>
          <InspectReadyButton
            ready={Boolean(plan && solverStatus==='ready')}
            pulseAllowed={!reducedMotion&&!systemReducedMotion}
            inspection={session.settings.inspection}
            onClick={session.settings.inspection?startInspection:markReady}
          />
        </div>
        {plan && solverStatus==='ready' && (reducedMotion || systemReducedMotion) && <p className="inspect-motion-note" role="status">
          {reducedMotion?'Ready highlight motion paused: “Reduce animations” is enabled in Cube Hero Settings.':'Ready highlight motion paused by your Windows/browser reduced-motion preference.'} The button remains highlighted.
        </p>}</>}
    </section>
    <div className="racer-grid" ref={racersRef}><section className={`surface racer-panel human-panel ${stage==='running'?'racer-live':''} ${holdArmed?'stackmat-armed':holdStartedAt!==null?'stackmat-holding':''} ${stage==='ready'?'stackmat-touch-zone':''}`} onPointerDown={stage==='ready'?onHoldPointerDown:undefined} onPointerUp={stage==='ready'?onHoldPointerUp:undefined} onPointerCancel={stage==='ready'?onHoldPointerCancel:undefined} onLostPointerCapture={stage==='ready'?onHoldPointerCancel:undefined} onClick={stage==='running'?stopRace:undefined}><div className="racer-top"><div><PlayerAvatar className="cube-player-avatar--inline" decorative/><strong>YOU</strong></div><span className="racer-subtitle">Physical cube</span></div><div className="timer-preview-label">YOUR SOLVE TIME</div><LiveTimerText className="racer-timer" timeMs={playerStopped??(stage==='running'?elapsed:0)} precision={precision} running={stage==='running'} startAt={startRef.current}/><div className="timer-control"><Keyboard size={18}/><span>{stage==='running'?<><kbd>SPACE</kbd> or tap to stop</>:stage==='waiting'?'Solve recorded':holdArmed?'GREEN — RELEASE TO START':holdStartedAt!==null?'KEEP HOLDING…':<><kbd>SPACE</kbd> hold 1.5s, then release</>}</span></div>{stage==='ready'&&<div className="stackmat-arm-track" aria-label="Hold-to-start progress"><span style={{width:`${holdProgress}%`}}/></div>}<p>{stage==='waiting'?'You finished! Waiting for the last AI opponents.':stage==='running'?'Press Space or tap your timer to stop.':holdTooShort?'Too short — hold for 1.5 seconds before releasing.':stage==='ready'?'Hold Space or touch this panel for 1.5 seconds, then release.':'Scramble your real cube before beginning.'}</p></section>
      <section className="surface racer-panel ai-panel"><div className="racer-top"><div><BrainCircuit size={22}/><strong>{aiCount===1?'AI OPPONENT':'AI OPPONENT 1'}</strong></div><span className="level-pill mini">Sub-{session.settings.difficulty} · {personalityName}</span></div>{session.settings.showCube&&plan?(compactRendering?<MobileRaceCube scramble={scramble} plan={plan} active={stage==='running'||stage==='waiting'} startAt={startRef.current}/>:<AiCube3D scramble={scramble} plan={plan} elapsedMs={aiElapsed}/>):<div className="cube-hidden"><Layers3 size={27}/><span>{plan?'Cube visual hidden':'Preparing solution…'}</span></div>}<LiveTimerText className="racer-timer ai-timer" aria-label="AI solve time" timeMs={aiElapsed} precision={precision} running={stage==='running'||stage==='waiting'} startAt={startRef.current} limitMs={aiTarget}/></section>
    {aiCount>1&&<section className="surface multi-ai-live" aria-label="Other racing AI opponents">
      <div className="multi-ai-live-heading"><div><span className="multi-ai-live-eyebrow">LIVE TOURNAMENT · SHARED SCRAMBLE</span><h3><BrainCircuit size={18}/> Other AI Racers</h3><p>AI 1 is featured above. Every rival has a separate solve clock.</p></div><span className="multi-ai-finish-count">{aiFinishedCount} / {aiCount} FINISHED</span></div>
      <div className="multi-ai-live-grid">{plans.slice(1).map((rival,i)=>{
        const time=startRef.current===null?0:Math.min(rival.totalMs,elapsed)
        const done=startRef.current!==null&&elapsed>=rival.totalMs
        return <div className={`multi-ai-live-rival ${done?'finished':''}`} key={`ai-${i+2}`}><div className="multi-ai-rival-top"><span className="multi-ai-rival-avatar"><BrainCircuit size={15}/></span>{compactRendering?<span className="multi-ai-rival-name"><strong>AI {i+2}</strong><span>{mobileOpponentPortraits[i+1]?.name}</span></span>:<strong>AI {i+2}</strong>}<small>{done?'SOLVED':'RACING'}</small></div><div className="multi-ai-rival-body"><div className="multi-ai-rival-time">{compactRendering&&isAndroidBrowser()?<LiveTimerText className="multi-ai-rival-value" timeMs={time} precision={precision} running={stage==='running'||stage==='waiting'} startAt={startRef.current} limitMs={rival.totalMs}/>:formatTime(time,precision)}<small>s</small></div>{compactRendering?<MobileAiPortrait rival={mobileOpponentPortraits[i+1]}/>:session.settings.showCube?<div className="multi-ai-rival-cube" aria-hidden="true"><AiCube3D scramble={scramble} plan={rival} elapsedMs={time}/></div>:<div className="multi-ai-rival-cube-placeholder" aria-hidden="true"><Layers3 size={22}/></div>}</div></div>
      })}</div>
    </section>}
    </div>
    {(stage==='inspection'||stage==='ready'||stage==='running'||stage==='waiting')&&<section className={`surface inspection-panel ${currentPenalty!=='none'?'inspection-warning':''}`}><div><Clock3 size={19}/><strong>{stage==='inspection'?(holdStartedAt!==null?'Inspection paused':'Inspection'):stage==='ready'?'Ready':currentPenalty==='plus2'?'+2 penalty':currentPenalty==='dnf'?'Inspection DNF':'Race status'}</strong><span>{stage==='inspection'?(holdStartedAt!==null?'Holding to arm timer':currentPenalty==='dnf'?'17s reached':currentPenalty==='plus2'?'15s exceeded':'15s window'):stage==='ready'?'No inspection':'Competition-style timing'}</span></div><div className="inspection-track"><span style={{width:stage==='inspection'?`${Math.max(0,100-inspectionMs/170)}%`:'100%'}}/></div><strong>{stage==='inspection'?`${Math.max(0,17-inspectionMs/1000).toFixed(1)}s`:stage==='ready'?'Ready':currentPenalty==='plus2'?'+2':currentPenalty==='dnf'?'DNF':'LIVE'}</strong></section>}
    {stage==='inspection'&&<p className="inspection-hint">{holdStartedAt!==null?'Inspection paused while you hold. Release after 1.5s to start; releasing early resumes inspection.':'Start before 15s to avoid +2. Start at 17s or later for DNF (WCA-inspired inspection rules).'}</p>}
    {(stage==='inspection'||stage==='ready')&&<button className={`btn btn-primary btn-lg btn-full start-race-button stackmat-hold-button ${holdArmed?'stackmat-armed':''}`} onPointerDown={onHoldPointerDown} onPointerUp={onHoldPointerUp} onPointerCancel={onHoldPointerCancel} onLostPointerCapture={onHoldPointerCancel} onClick={e=>e.preventDefault()}><Flag size={19}/>{holdArmed?'READY — RELEASE TO START':holdStartedAt!==null?'KEEP HOLDING…':'HOLD TO START — 1.5s'} <Keyboard size={16}/></button>}
    {stage==='running'&&<button className="btn btn-primary btn-lg btn-full stop-race-button" onClick={stopRace}><Trophy size={19}/> STOP TIMER — SPACE</button>}
    {stage==='waiting'&&<div className="race-waiting"><ShieldCheck size={19}/> Player time saved. Results appear after all AI opponents finish solving.</div>}
    <div className="room-actions"><button className="btn btn-outline" onClick={leave}><SlidersHorizontal size={17}/> Change settings</button><div className="round-badge"><Flag size={16}/> Round {round}/{total} <ArrowRight size={15}/></div></div>
  </div>
}
