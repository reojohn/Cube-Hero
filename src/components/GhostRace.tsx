import './GhostRace.css'
import PlayerAvatar from './PlayerAvatar'
import { memo, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ArrowRight, Check, CircleHelp, Clock3, Copy, Ghost, Keyboard, LoaderCircle, Medal, RotateCcw, ShieldCheck, Sparkles, Timer, Trophy, Zap } from 'lucide-react'
import RaceCubeVisual from './RaceCubeVisual'
import LiveTimerText from './LiveTimerText'
import { competitionRenderIntervalMs, isCompactPerformanceViewport, MOBILE_PERFORMANCE_QUERY, scheduleOpponentFinishRefreshes, shouldRenderAndroidOnFinishOnly } from '../lib/mobilePerformance'
import InspectionModal from './InspectionModal'
import RaceMechanicsModal from './RaceMechanicsModal'
import { hasSeenMechanics, markMechanicsSeen } from '../lib/mechanicsVisit'
import GhostResetModal from './GhostResetModal'
import { ghostPrefetch } from '../lib/ghostPrefetch'
import { ARM_DELAY_MS, armProgressPercent, isValidStartRelease } from '../lib/stackmat'
import { inspectionElapsedMs, includeEndedHold } from '../lib/inspectionClock'
import { formatTime, generateScramble, inspectionPenalty } from '../lib/racing'
import type { InspectionPenalty } from '../lib/racing'
import { GHOST_STORAGE_KEY, GHOST_QUALIFYING_SOLVES, bestGhostTime, emptyGhostData, makeGhostPlan, officialGhostTime, parseGhostData } from '../lib/ghost'
import type { GhostAttempt, GhostData } from '../lib/ghost'
import type { AiPlan } from '../lib/aiPlan'
import { playGameSound } from '../lib/gameAudio'
import type { GraphicsQuality } from '../lib/graphicsQuality'

type Stage = 'scramble' | 'inspection' | 'ready' | 'running' | 'waiting' | 'result'
type HoldSource = 'keyboard' | 'pointer'
type Hold = { source: HoldSource; startedAt: number; pointerId?: number }
type Outcome = { attempt: GhostAttempt; baselineMs: number | null; isNewBest: boolean; qualificationNumber: number }
type Props = { precision: 2 | 3; sound: boolean; reducedMotion: boolean; graphics: GraphicsQuality; onActiveChange: (active: boolean) => void }
const msNow = () => performance.now()

function savedGhostData(): GhostData {
  try { return parseGhostData(JSON.parse(localStorage.getItem(GHOST_STORAGE_KEY) || 'null')) }
  catch { return emptyGhostData() }
}

const showTime=(ms:number|null,precision:2|3)=>ms===null?'DNF':`${formatTime(ms,precision)}s`


type BeginnerMove = {
  raw:string
  face:'L'|'R'|'U'|'D'|'F'|'B'
  suffix:''|"'"|'2'
  faceLabel:string
  faceArrow:string
  turnSymbol:string
  instruction:string
}
const FACE_GUIDE:Record<BeginnerMove['face'],{label:string;arrow:string}>= {
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
    const suffix=(raw.endsWith('2')?'2':raw.endsWith("'")?"'":'') as BeginnerMove['suffix']
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
  </div>
})
function GhostInspectReadyButton({ready,pulseAllowed,onClick}:{ready:boolean;pulseAllowed:boolean;onClick:()=>void}){
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
  return <span className="inspect-cta-wrap" style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',maxWidth:'100%',minWidth:'235px',isolation:'isolate'}}>
    {ready&&pulseAllowed&&<>
      <span ref={firstRingRef} aria-hidden="true" style={ringStyle}/>
      <span ref={secondRingRef} aria-hidden="true" style={{...ringStyle,borderColor:'#8265ff'}}/>
    </>}
    <button
      type="button"
      disabled={!ready}
      className="btn btn-primary ghost-inspect-cta"
      style={ready?{
        position:'relative',zIndex:1,
        border:'2px solid #dfb5ff',
        borderRadius:'10px',
        padding:'9px 15px',
        background:'linear-gradient(105deg,#6652ff,#aa37ff 57%,#684aff)',
        boxShadow:'0 0 15px rgba(154,64,255,.48)',
        color:'#fff',
        minHeight:'43px',
        whiteSpace:'normal',
      }:{position:'relative',zIndex:1}}
      onClick={onClick}
      title={ready ? 'Ready to inspect — click when your cube is scrambled' : 'Waiting for the verified CFOP ghost'}
    >
      <Check size={18}/> I&apos;m Scrambled — Inspect <ArrowRight size={17}/>
      {ready&&<span aria-hidden="true" style={{display:'inline-flex',alignItems:'center',padding:'4px 6px',borderRadius:'5px',fontWeight:900,fontSize:'9px',letterSpacing:'.4px',background:'#fff1a5',color:'#251039',border:'1px solid #fff5c8'}}>READY</span>}
    </button>
  </span>
}

export default function GhostRace({precision,sound,reducedMotion,graphics,onActiveChange}:Props){
  const [data,setData]=useState<GhostData>(savedGhostData)
  const qualifying=data.qualifications.length<GHOST_QUALIFYING_SOLVES
  const qualifiedCount=data.qualifications.length
  const baseline=bestGhostTime(data)
  const round=qualifying?qualifiedCount+1:data.duels.length+1
  const [stage,setStage]=useState<Stage>('scramble')
  const [scramble,setScramble]=useState(()=>qualifying?generateScramble():(ghostPrefetch.peekNext() ?? generateScramble()))
  const [ghostPlan,setGhostPlan]=useState<AiPlan|null>(null)
  const [ghostStatus,setGhostStatus]=useState<'loading'|'ready'|'error'>('loading')
  const [ghostError,setGhostError]=useState('')
  const [solverRetry,setSolverRetry]=useState(0)
  const [inspectionModalOpen,setInspectionModalOpen]=useState(false)
  const [mechanicsModalOpen,setMechanicsModalOpen]=useState(()=>!hasSeenMechanics('ghost'))
  const closeMechanics=()=>{markMechanicsSeen('ghost');setMechanicsModalOpen(false)}
  const [resetModalOpen,setResetModalOpen]=useState(false)
  const [tick,setTick]=useState(msNow)
  const [compactRendering,setCompactRendering]=useState(isCompactPerformanceViewport)
  const [holdStartedAt,setHoldStartedAt]=useState<number|null>(null)
  const [shortHold,setShortHold]=useState(false)
  const [stoppedRaw,setStoppedRaw]=useState<number|null>(null)
  const [outcome,setOutcome]=useState<Outcome|null>(null)
  const [copied,setCopied]=useState(false)
  const [reducedBySystem,setReducedBySystem]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const activeHold=useRef<Hold|null>(null)
  const inspectionRef=useRef<number|null>(null)
  const pauseRef=useRef<number|null>(null)
  const pauseTotalRef=useRef(0)
  const startRef=useRef<number|null>(null)
  const stoppedRef=useRef<number|null>(null)
  const penaltyRef=useRef<InspectionPenalty>('none')
  const completedRef=useRef(false)
  const keyDownRef=useRef<(e:KeyboardEvent)=>void>(()=>{})
  const keyUpRef=useRef<(e:KeyboardEvent)=>void>(()=>{})
  const arenaRef=useRef<HTMLDivElement|null>(null)
  const resultRef=useRef<HTMLElement|null>(null)

  const active=['inspection','ready','running','waiting'].includes(stage)
  const inspectionAt=(now:number)=>inspectionElapsedMs(inspectionRef.current,now,pauseTotalRef.current,pauseRef.current)
  const inspectionMs=inspectionAt(tick)
  const inspectionState=inspectionPenalty(inspectionMs)
  const heldMs=holdStartedAt===null?0:Math.max(0,tick-holdStartedAt)
  const armed=holdStartedAt!==null&&heldMs>=ARM_DELAY_MS
  const armProgress=armProgressPercent(holdStartedAt,tick)
  const rawElapsed=startRef.current===null?0:Math.max(0,tick-startRef.current)
  const ghostElapsed=ghostPlan ? (stage==='result'?ghostPlan.totalMs:Math.min(ghostPlan.totalMs,rawElapsed)) : 0
  const ghostFinished=ghostPlan!==null&&startRef.current!==null&&rawElapsed>=ghostPlan.totalMs
  const targetReady=qualifying||(ghostStatus==='ready'&&ghostPlan!==null)
  const inspectionSoundSecond=useRef(-1)
  const ghostSoundAnnounced=useRef(false)
  useEffect(()=>{
    if(stage!=='inspection'){inspectionSoundSecond.current=-1;return}
    const second=Math.ceil((15_000-inspectionMs)/1000)
    if(second>=1&&second<=3&&inspectionSoundSecond.current!==second){
      inspectionSoundSecond.current=second
      if(sound)playGameSound('countdown')
    }
  },[stage,inspectionMs,sound])
  useEffect(()=>{
    if(armed && (stage==='ready'||stage==='inspection') && sound)playGameSound('ready')
  },[armed,stage,sound])
  useEffect(()=>{
    if(stage!=='running'&&stage!=='waiting'){ghostSoundAnnounced.current=false;return}
    if(ghostFinished&&!ghostSoundAnnounced.current){
      ghostSoundAnnounced.current=true
      if(sound)playGameSound('opponentFinish')
    }
  },[stage,ghostFinished,sound])
  const pulseAllowed=!reducedMotion&&!reducedBySystem

  useEffect(()=>{
    try {localStorage.setItem(GHOST_STORAGE_KEY,JSON.stringify(data));window.dispatchEvent(new Event('cubehero-learning-progress-changed'))} catch {/* storage disabled */}
  },[data])
  useEffect(()=>{onActiveChange(active);return()=>onActiveChange(false)},[active,onActiveChange])
  useEffect(()=>{
    if(!active)return
    const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''}
    window.addEventListener('beforeunload',warn)
    return()=>window.removeEventListener('beforeunload',warn)
  },[active])
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    const change=()=>setReducedBySystem(media.matches)
    media.addEventListener('change',change)
    return()=>media.removeEventListener('change',change)
  },[])
  useEffect(()=>{
    const query=window.matchMedia(MOBILE_PERFORMANCE_QUERY)
    const refresh=()=>setCompactRendering(query.matches)
    query.addEventListener('change',refresh)
    return()=>query.removeEventListener('change',refresh)
  },[])
  useEffect(()=>{
    if(!active&&holdStartedAt===null)return
    // The visible stopwatch and opponent cube have independent clocks.
    // A complete Ghost page reconcile every 360ms only wastes Android frames.
    if ((stage==='running'||stage==='waiting') && shouldRenderAndroidOnFinishOnly()) return
    const interval=window.setInterval(()=>setTick(msNow()),competitionRenderIntervalMs(stage==='running'||stage==='waiting'))
    return()=>window.clearInterval(interval)
  },[active,holdStartedAt])
  useEffect(()=>{
    if (!['running','waiting'].includes(stage) || !shouldRenderAndroidOnFinishOnly()) return
    if (startRef.current===null || !ghostPlan) return
    return scheduleOpponentFinishRefreshes(startRef.current,[ghostPlan.totalMs],()=>setTick(msNow()))
  },[stage,ghostPlan])
  useEffect(()=>{
    const down=(event:KeyboardEvent)=>keyDownRef.current(event)
    const up=(event:KeyboardEvent)=>keyUpRef.current(event)
    window.addEventListener('keydown',down)
    window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[])
  useEffect(()=>{
    const reset=()=>cancelHold()
    const hidden=()=>{if(document.hidden)reset()}
    window.addEventListener('blur',reset)
    document.addEventListener('visibilitychange',hidden)
    return()=>{window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',hidden)}
  },[])

  // Consume only after mount so React's development StrictMode cannot burn
  // the pre-computed challenge by running the state initializer twice.
  useEffect(()=>{if(!qualifying)ghostPrefetch.claimInitial(scramble)},[])

  // Prepare the next verified scramble while the player scrambles/solves.
  // Qualifying rounds give this work ample time before the first ghost duel.
  // The cache is shared across visits to this page and never bypasses CFOP verification.
  useEffect(()=>{
    // Solving a future scramble in a background worker during a live duel
    // competes with the stopwatch and cube renderer on low-end phones.
    if(qualifying || stage==='result')ghostPrefetch.prewarm()
  },[qualifying,stage])

  // Generate a real verified CFOP solution for each NEW ghost duel scramble.
  // The player's qualifying solves need no computed solution or animated opponent.
  useEffect(()=>{
    if(stage!=='scramble'||qualifying||baseline===null)return
    let canceled=false
    setGhostPlan(null);setGhostStatus('loading');setGhostError('')
    void ghostPrefetch.prepare(scramble).then(solution=>{
      if(canceled)return
      const plan=makeGhostPlan(scramble,solution,baseline)
      setGhostPlan(plan);setGhostStatus('ready')
    }).catch(error=>{
      if(canceled)return
      setGhostStatus('error');setGhostError(error instanceof Error?error.message:'Could not prepare your ghost.')
    })
    return()=>{canceled=true}
  },[scramble,qualifying,baseline,stage,solverRetry])

  function startInspection(){
    if(!targetReady || stage!=='scramble')return
    const at=msNow()
    inspectionRef.current=at;pauseRef.current=null;pauseTotalRef.current=0
    setTick(at);setInspectionModalOpen(true);setStage('inspection')
    if(sound)playGameSound('inspect')
  }
  function resumeInspection(now:number){
    if(pauseRef.current===null)return
    pauseTotalRef.current=includeEndedHold(pauseTotalRef.current,pauseRef.current,now)
    pauseRef.current=null
  }
  function beginRace(){
    if(!targetReady || !['inspection','ready'].includes(stage) || startRef.current!==null)return
    const now=msNow()
    penaltyRef.current=inspectionRef.current===null?'none':inspectionPenalty(inspectionAt(now))
    startRef.current=now;pauseRef.current=null
    activeHold.current=null;setHoldStartedAt(null);setShortHold(false)
    setInspectionModalOpen(false);setTick(now);setStage('running')
    if(sound)playGameSound('start')
  }
  function startHold(source:HoldSource,pointerId?:number){
    if(!targetReady||!['inspection','ready'].includes(stage)||activeHold.current)return
    const at=msNow()
    activeHold.current={source,startedAt:at,pointerId}
    if(stage==='inspection'&&inspectionRef.current!==null)pauseRef.current=at
    setHoldStartedAt(at);setShortHold(false);setTick(at)
    if(sound)playGameSound('arm')
  }
  function finishHold(source:HoldSource,pointerId?:number){
    const held=activeHold.current
    if(!held||held.source!==source||(source==='pointer'&&held.pointerId!==pointerId))return
    const now=msNow()
    if(isValidStartRelease(held.startedAt,now))beginRace()
    else{
      resumeInspection(now);activeHold.current=null;setHoldStartedAt(null)
      setShortHold(true);setTick(now)
    }
  }
  function cancelHold(source?:HoldSource,pointerId?:number){
    const held=activeHold.current
    if(!held||(source&&held.source!==source)||(source==='pointer'&&held.pointerId!==pointerId))return
    const now=msNow()
    resumeInspection(now);activeHold.current=null;setHoldStartedAt(null);setTick(now)
  }
  function onPointerDown(e:ReactPointerEvent<HTMLElement>){
    if(e.button!==0||!['inspection','ready'].includes(stage))return
    e.preventDefault()
    try {e.currentTarget.setPointerCapture(e.pointerId)} catch {/* optional */}
    startHold('pointer',e.pointerId)
  }
  function onPointerUp(e:ReactPointerEvent<HTMLElement>){
    e.preventDefault();finishHold('pointer',e.pointerId)
    try {if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}catch{/* already released */}
  }
  function onPointerCancel(e:ReactPointerEvent<HTMLElement>){cancelHold('pointer',e.pointerId)}

  function finishRound(rawMs:number){
    if(completedRef.current)return
    completedRef.current=true
    const officialMs=officialGhostTime(rawMs,penaltyRef.current)
    const attempt:GhostAttempt={
      id:`ghost-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      scramble,date:new Date().toISOString(),mode:qualifying?'qualifying':'ghost',
      rawMs,penalty:penaltyRef.current,officialMs,
      opponentMs:qualifying?null:ghostPlan?.totalMs??baseline,
    }
    const newBest=officialMs!==null && !qualifying && baseline!==null && officialMs<baseline
    setOutcome({attempt,baselineMs:qualifying?null:ghostPlan?.totalMs??baseline,isNewBest:newBest,qualificationNumber:round})
    if(qualifying){
      if(officialMs!==null)setData(prev=>({...prev,qualifications:[...prev.qualifications,attempt].slice(0,GHOST_QUALIFYING_SOLVES)}))
    }else setData(prev=>({...prev,duels:[...prev.duels,attempt].slice(-300)}))
    setInspectionModalOpen(false);setStage('result');if(sound)playGameSound(newBest?'personalBest':qualifying?'ghostFinish':officialMs!==null&&baseline!==null&&officialMs<baseline?'victory':'loss',.18)
  }
  useEffect(()=>{
    if(stage!=='result')return
    const frame=requestAnimationFrame(()=>resultRef.current?.scrollIntoView({block:'center',behavior:reducedMotion||reducedBySystem?'instant':'smooth'}))
    return()=>cancelAnimationFrame(frame)
  },[stage,reducedMotion,reducedBySystem])
  function stopTimer(){
    if(stage!=='running'||startRef.current===null||stoppedRef.current!==null)return
    const raw=msNow()-startRef.current
    if(raw<350)return
    stoppedRef.current=raw;setStoppedRaw(raw);setTick(msNow());if(sound)playGameSound('stop')
    if(qualifying||!ghostPlan||raw>=ghostPlan.totalMs)finishRound(raw)
    else setStage('waiting')
  }
  useEffect(()=>{
    if(stage==='waiting'&&stoppedRef.current!==null&&ghostPlan&&rawElapsed>=ghostPlan.totalMs){
      finishRound(stoppedRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[stage,tick,ghostPlan])
  keyDownRef.current=(event:KeyboardEvent)=>{
    if(mechanicsModalOpen)return
    if(event.code!=='Space'||event.repeat||event.altKey||event.ctrlKey||event.metaKey)return
    const target=event.target as HTMLElement|null
    if(target&&(target.isContentEditable||['INPUT','SELECT','TEXTAREA'].includes(target.tagName)))return
    if(!['inspection','ready','running'].includes(stage))return
    event.preventDefault()
    if(stage==='running')stopTimer()
    else startHold('keyboard')
  }
  keyUpRef.current=(event:KeyboardEvent)=>{
    if(event.code!=='Space'||activeHold.current?.source!=='keyboard')return
    event.preventDefault();finishHold('keyboard')
  }

  useEffect(()=>{
    if(stage!=='running')return
    let second=0
    const first=requestAnimationFrame(()=>{
      second=requestAnimationFrame(()=>{
        const node=arenaRef.current
        if(!node)return
        const rect=node.getBoundingClientRect()
        const offset=window.innerWidth<=740?82:Math.max(12,(window.innerHeight-rect.height)/2)
        window.scrollTo({top:Math.max(0,window.scrollY+rect.top-offset),behavior:reducedMotion||reducedBySystem?'instant':'smooth'})
      })
    })
    return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second)}
  },[stage,reducedMotion,reducedBySystem])

  function nextRound(){
    if(active)return
    activeHold.current=null;inspectionRef.current=null;pauseRef.current=null;pauseTotalRef.current=0
    startRef.current=null;stoppedRef.current=null;penaltyRef.current='none';completedRef.current=false
    setHoldStartedAt(null);setShortHold(false);setStoppedRaw(null);setOutcome(null)
    setGhostPlan(null);setGhostStatus('loading');setGhostError('')
    setInspectionModalOpen(false);setScramble(qualifying?generateScramble():ghostPrefetch.takeNext());setTick(msNow());setStage('scramble')
    window.scrollTo({top:0,behavior:'auto'})
  }
  function resetGhost(){
    if(active)return
    setResetModalOpen(false)
    setData(emptyGhostData())
    activeHold.current=null;inspectionRef.current=null;pauseRef.current=null;pauseTotalRef.current=0
    startRef.current=null;stoppedRef.current=null;completedRef.current=false;penaltyRef.current='none'
    setOutcome(null);setStoppedRaw(null);setGhostPlan(null);setGhostStatus('loading')
    setInspectionModalOpen(false);setScramble(generateScramble());setStage('scramble');setTick(msNow())
  }
  async function copy(){
    try{await navigator.clipboard.writeText(scramble);setCopied(true);setTimeout(()=>setCopied(false),1500)}
    catch {/* Clipboard permissions vary; the scramble remains selectable. */}
  }

  const result=outcome?.attempt
  const qualificationFinished=qualifiedCount===GHOST_QUALIFYING_SOLVES
  const isQualifyingResult=result?.mode==='qualifying'
  const duelWin=result?.officialMs!=null&&outcome?.baselineMs!=null&&result.officialMs<outcome.baselineMs
  const wins=data.duels.filter(x=>x.officialMs!==null&&x.opponentMs!==null&&x.officialMs<x.opponentMs).length
  return <div className={`page-stack narrow-stack ghost-page ${stage==='running'||stage==='waiting'?'ch-performance-live':''} ch-graphics-${graphics}`}>
    <RaceMechanicsModal open={mechanicsModalOpen} mode="ghost" onClose={closeMechanics} />
    <GhostResetModal open={resetModalOpen} qualifyingSolves={qualifiedCount} duels={data.duels.length} onCancel={()=>setResetModalOpen(false)} onConfirm={resetGhost} />
    {inspectionModalOpen&&stage==='inspection'&&<InspectionModal
      elapsedMs={inspectionMs} penalty={inspectionState}
      opponentLabel={qualifying?'Solo qualifying solve':'Your Personal Ghost'} round={round}
      holding={holdStartedAt!==null} holdArmed={armed} holdProgress={armProgress}
      holdTooShort={shortHold} onHoldPointerDown={onPointerDown} onHoldPointerUp={onPointerUp} onHoldPointerCancel={onPointerCancel}
    />}
    <section className="ch-mode-hero ch-ghost-mode-hero" aria-labelledby="ch-ghost-hero-title">
      <div className="ch-mode-hero-copy">
        <div className="ch-mode-hero-eyebrow"><span className="ch-mode-hero-spark"><Sparkles size={15}/></span> YOUR PERSONAL ARENA <span className="ch-mode-hero-separator">/</span> GHOST RACE</div>
        <h1 id="ch-ghost-hero-title">YOU <span>vs</span> YOU.<br/><em>{qualifying?'Create your rival.':'Chase your best.'}</em></h1>
        <p>{qualifying?'Record three real solves on three fresh scrambles. Your fastest valid time will become your opponent.':'Your personal best is waiting. Race a turning ghost cube that finishes at your recorded best time — and try to beat it.'}</p>
        <div className="ch-mode-hero-pills"><span><Ghost size={15}/>{qualifying?'Building your ghost':'Ghost unlocked'}</span><span><Timer size={15}/>1.5s hold to start</span><span><ShieldCheck size={15}/>Verified CFOP</span></div>
        <div className="ch-mode-hero-actions"><span className="ch-mode-hero-subnote"><span/> YOUR RECORD. YOUR RIVAL.</span></div>
      </div>
      <div className="ch-ghost-hero-art" aria-label={qualifying?`${qualifiedCount} of ${GHOST_QUALIFYING_SOLVES} qualifying solves completed`:`Your current ghost record is ${showTime(baseline,precision)}`}>
        <div className="ch-ghost-hero-ring ch-ghost-hero-ring-outer" aria-hidden="true"/><div className="ch-ghost-hero-ring ch-ghost-hero-ring-inner" aria-hidden="true"/>
        <div className="ch-ghost-hero-avatar" aria-hidden="true"><img className="ghost-assassin-logo" src="/ghost-assassin-emblem.png" alt="" decoding="async" /></div>
        <div className="ch-ghost-hero-score"><span>{qualifying?'QUALIFYING PROGRESS':'GHOST RECORD'}</span><strong>{qualifying?`${qualifiedCount} / ${GHOST_QUALIFYING_SOLVES}`:showTime(baseline,precision)}</strong><small>{qualifying?'Finish three solves to unlock':'Beat it to set a new target'}</small></div>
        <span className="ch-ghost-hero-float" aria-hidden="true"><Zap size={13}/> {qualifying?'YOUR CHALLENGE AWAITS':'NEW PB? GAME ON.'}</span>
      </div>
    </section>
    <section className="ch-mechanics-spotlight ch-mechanics-spotlight-ghost" aria-label="Ghost Race mechanics help">
      <span className="ch-mechanics-spotlight-icon" aria-hidden="true"><CircleHelp size={28}/></span>
      <div className="ch-mechanics-spotlight-copy"><span>GHOST RACE GUIDE · 5 SIMPLE STEPS</span><h2>How do you race your own ghost?</h2><p>Learn how your three solves create a ghost and how to beat your best time.</p></div>
      <button type="button" className="ch-mechanics-spotlight-button" onClick={()=>setMechanicsModalOpen(true)}><CircleHelp size={19}/><span><small>MECHANICS</small>How Ghost Race Works</span><ArrowRight size={20}/></button>
    </section>
    <div className="ghost-qualification-grid">
      {Array.from({length:GHOST_QUALIFYING_SOLVES},(_,i)=>{
        const attempt=data.qualifications[i]
        const isBest=attempt&&baseline!==null&&attempt.officialMs===baseline
        return <div className={`ghost-qualification-card ${attempt?'complete':''} ${isBest?'best':''}`} key={i}>
          <span className="ghost-qualification-index">SOLVE {i+1}</span><strong>{attempt?showTime(attempt.officialMs,precision):'--.--'}</strong>
          <span>{attempt?(isBest?'★ GHOST RECORD':'✓ RECORDED'):i===qualifiedCount&&qualifying?'UP NEXT':'NOT STARTED'}</span>
        </div>
      })}
    </div>
    {stage!=='result'?<>
      <section className="surface ghost-scramble-panel">
        <div className="ghost-scramble-header"><div><span className="ghost-brow"><RotateCcw size={14}/> SHARED SCRAMBLE</span><h3>{qualifying?`Qualifying solve ${round} of 3`:`Ghost challenge ${round}`}</h3></div><span className="ghost-scramble-label">3×3×3</span></div>
        <div className="ghost-scramble-line"><strong>{scramble}</strong><button type="button" onClick={copy} title="Copy scramble" aria-label="Copy scramble">{copied?<Check size={18}/>:<Copy size={18}/>}</button></div>
        <p>{qualifying?'Apply the scramble to your physical cube, then begin inspection.':'You and your ghost start from the same scramble; the ghost cube will turn as you race.'}</p>
        <ScrambleBeginnerGuide scramble={scramble}/>
        {stage==='scramble'&&<div className="ghost-start-actions">
          {!qualifying&&<div className={`ghost-solver-state ${ghostStatus==='error'?'error':''}`} role="status">{ghostStatus==='loading'?<><LoaderCircle size={16} className="spin-icon"/> Finalizing your verified CFOP ghost…</>:ghostStatus==='error'?<><CircleHelp size={16}/> {ghostError} <button type="button" onClick={()=>setSolverRetry(n=>n+1)}>Retry</button></>:<><ShieldCheck size={16}/> Verified CFOP ghost ready · Same scramble, personal-best time</>}</div>}
          <div className="ghost-start-buttons"><button type="button" className="btn btn-outline" onClick={()=>setScramble(qualifying?generateScramble():ghostPrefetch.takeNext())}><RotateCcw size={17}/> New Scramble</button>
            <GhostInspectReadyButton ready={targetReady} pulseAllowed={pulseAllowed} onClick={startInspection}/></div>
          {!pulseAllowed&&targetReady&&<p className="inspect-motion-note">Ready highlight motion is paused because reduced animations are enabled in Cube Hero Settings or in your OS/browser motion preferences.</p>}
        </div>}
      </section>
      <div className={`ghost-arena ${qualifying?'solo':''}`} ref={arenaRef}>
        <section className="surface ghost-player-card" onPointerDown={stage==='ready'?onPointerDown:stage==='running'?(e)=>{if(e.button===0)stopTimer()}:undefined} onPointerUp={stage==='ready'?onPointerUp:undefined} onPointerCancel={stage==='ready'?onPointerCancel:undefined} onLostPointerCapture={stage==='ready'?onPointerCancel:undefined}>
          <div className="ghost-racer-top"><span><PlayerAvatar className="cube-player-avatar--inline" decorative/> YOU</span><small>Physical cube</small></div>
          <div className="ghost-racer-center"><span className="ghost-overline">YOUR SOLVE TIME</span><LiveTimerText className="ghost-player-time" timeMs={stoppedRaw??(stage==='running'?rawElapsed:0)} precision={precision} running={stage==='running'} startAt={startRef.current}/>
            <div className={`ghost-timer-help ${armed?'armed':''}`}><Keyboard size={16}/>{stage==='running'?'SPACE / TAP TO STOP':stage==='waiting'?'SOLVE RECORDED':armed?'READY · RELEASE TO START':holdStartedAt!==null?'KEEP HOLDING…':'HOLD SPACE / TOUCH 1.5s, THEN RELEASE'}</div>
            {stage==='ready'&&<div className="ghost-arm-progress"><span style={{width:`${armProgress}%`}}/></div>}
            <p>{stage==='running'?'Stop the timer when your cube is solved.':stage==='waiting'?'You finished. Your ghost is completing its turn sequence.':shortHold?'Hold for the full 1.5 seconds to start.':qualifying?'Record your time to unlock your ghost.':'Can you beat your own fastest solve?'}</p>
          </div>
        </section>
        {qualifying?<section className="surface ghost-locked-card"><div className="ghost-locked-symbol"><img className="ghost-assassin-logo" src="/ghost-assassin-emblem.png" alt="" decoding="async" /></div><h3>Meet your future rival</h3><p>Once you finish three valid solves, your fastest recorded time will power your animated ghost opponent.</p><div className="ghost-locked-progress"><span style={{width:`${qualifiedCount/GHOST_QUALIFYING_SOLVES*100}%`}}/></div><small>{GHOST_QUALIFYING_SOLVES-qualifiedCount} qualifying solve{GHOST_QUALIFYING_SOLVES-qualifiedCount===1?'':'s'} remaining</small></section>
          :<section className="surface ghost-opponent-card"><div className="ghost-racer-top"><span><Ghost size={22}/> YOUR GHOST</span><small>Personal best · {showTime(ghostPlan?.totalMs??baseline,precision)}</small></div>
            {ghostPlan?<RaceCubeVisual scramble={scramble} plan={ghostPlan} elapsedMs={ghostElapsed} active={stage==='running'||stage==='waiting'} startAt={startRef.current} compact={compactRendering} graphics={graphics}/>:<div className="ghost-loading-cube"><LoaderCircle size={31} className="spin-icon"/> Preparing cube…</div>}
            <LiveTimerText className="ghost-opponent-time" timeMs={ghostElapsed} precision={precision} running={stage==='running'||stage==='waiting'} startAt={startRef.current} limitMs={ghostPlan?.totalMs}/><span className="ghost-opponent-status">{ghostFinished?'GHOST FINISHED':stage==='running'||stage==='waiting'?'SOLVING THE SCRAMBLE':'WAITING AT THE START'}</span>
          </section>}
      </div>
      {stage==='inspection'||stage==='ready'||stage==='running'||stage==='waiting'?<section className={`surface ghost-inspection-strip ${inspectionState!=='none'&&stage==='inspection'?'warning':''}`}><div><Clock3 size={18}/><strong>{stage==='inspection'?(holdStartedAt!==null?'Inspection paused':'Inspection'):stage==='ready'?'Ready':'Race live'}</strong></div><div className="ghost-inspection-meter"><span style={{width:`${stage==='inspection'?Math.max(0,100-inspectionMs/170):100}%`}}/></div><strong>{stage==='inspection'?`${Math.max(0,17-inspectionMs/1000).toFixed(1)}s`:stage==='ready'?'READY':'LIVE'}</strong></section>:null}
      {stage==='ready'&&<button className="btn btn-primary btn-lg btn-full ghost-start-hold" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onLostPointerCapture={onPointerCancel} onClick={e=>e.preventDefault()}>{armed?'GREEN — RELEASE TO START':holdStartedAt!==null?'KEEP HOLDING…':'HOLD TO START — 1.5s'}</button>}
      {stage==='running'&&<button className="btn btn-primary btn-lg btn-full ghost-stop-button" onClick={stopTimer}><Timer size={19}/> STOP YOUR TIMER · SPACE</button>}
      {stage==='waiting'&&<div className="ghost-waiting"><LoaderCircle size={18} className="spin-icon"/> Your solve is saved. Waiting for your ghost to finish…</div>}
      <div className="ghost-explanation"><ShieldCheck size={16}/><span>Ghost moves are a verified CFOP animation paced to your best time. They are not a recording of your physical turns.</span></div>
    </>:<section ref={resultRef} className="surface ghost-results-panel">
      <div className="ghost-results-icon"><Trophy size={35}/></div>
      <span className="ghost-brow">{isQualifyingResult?'QUALIFYING SOLVE COMPLETE':'YOU VS YOU · RACE RESULT'}</span>
      <h2>{isQualifyingResult?(result?.officialMs===null?'That one was a DNF.':qualificationFinished?'Your Ghost is unlocked!':`Solve ${outcome?.qualificationNumber} recorded!`):outcome?.isNewBest?'NEW PERSONAL BEST!':result?.officialMs===null?'Your Ghost takes the win':duelWin?'You beat your Ghost!':result?.officialMs===outcome?.baselineMs?'It’s a tie!':'Your Ghost wins this round'}</h2>
      <p>{isQualifyingResult?(result?.officialMs===null?'A DNF does not count toward your three qualifying solves. Try again with a new scramble.':qualificationFinished?'Your fastest qualifying solve is now the target. Start your first Ghost Race!':'You’re one step closer to racing your own best time.'):outcome?.isNewBest?'Your new time automatically becomes your ghost for the next round.':'Challenge yourself again to get closer to your best.'}</p>
      <div className="ghost-results-times"><div><span>YOUR TIME</span><strong>{showTime(result?.officialMs??null,precision)}</strong></div><div><span>{isQualifyingResult?'QUALIFYING STATUS':'GHOST TARGET'}</span><strong>{isQualifyingResult?(result?.officialMs===null?'RETRY':`${qualificationFinished?'3 / 3':`${qualifiedCount} / 3`}`):showTime(outcome?.baselineMs??null,precision)}</strong></div></div>
      {result?.penalty==='plus2'&&<div className="ghost-penalty-note">Your official time includes a +2-second inspection penalty.</div>}
      <button className="btn btn-primary btn-lg" onClick={nextRound}><ArrowRight size={18}/>{isQualifyingResult&&result?.officialMs===null?'Retry Qualifying Solve':isQualifyingResult&&qualificationFinished?'Race Your Ghost':isQualifyingResult?'Next Qualifying Solve':'Race Again'}</button>
    </section>}
    <section className="surface ghost-history-panel">
      <div className="ghost-history-head"><div><h3><Medal size={18}/> Your Ghost Journey</h3><p>Stored in this browser, separately from AI racing statistics.</p></div><div className="ghost-history-metrics"><span><b>{data.duels.length}</b> duels</span><span><b>{wins}</b> wins</span></div></div>
      {data.duels.length?<div className="ghost-history-list">{data.duels.slice(-8).reverse().map((x,i)=><div key={x.id}><span>#{data.duels.length-i}</span><strong>{showTime(x.officialMs,precision)}</strong><span>vs {showTime(x.opponentMs,precision)}</span><b className={x.officialMs!==null&&x.opponentMs!==null&&x.officialMs<x.opponentMs?'win':''}>{x.officialMs!==null&&x.opponentMs!==null&&x.officialMs<x.opponentMs?'WIN':'GHOST'}</b></div>)}</div>:<p className="ghost-empty-history">Your Ghost Race history will appear here after your first challenge.</p>}
      <div className="ghost-reset-zone">
        <div className="ghost-reset-zone-message"><span className="ghost-reset-zone-icon"><RotateCcw size={19}/></span><div><strong>Want to start fresh?</strong><p>Reset your personal ghost, qualifying solves, and Ghost Race results.</p></div></div>
        <button type="button" className="ghost-reset-button" onClick={()=>setResetModalOpen(true)} disabled={active} title={active?'Finish your current round before resetting':'Reset your Ghost Race progress'}><RotateCcw size={17}/> Reset Ghost Progress</button>
      </div>
    </section>
  </div>
}
