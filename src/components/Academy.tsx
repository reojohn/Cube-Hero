import './Academy.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, BookOpen, Bookmark, Check, CheckCircle2, ChevronRight,
  CircleHelp, Copy, Eye, GraduationCap, Hand, Layers3, Lightbulb,
  ListChecks, LockKeyhole, Pause, Play, RotateCcw, Search, SkipBack, SkipForward,
  Sparkles, Target, Trophy, Undo2, Zap, LoaderCircle,
} from 'lucide-react'
import AcademyOrbitCube from './AcademyOrbitCube'
import { cubeFacesAt } from '../lib/cubeState'
import { generateScramble } from '../lib/racing'
import { solveScramble } from '../lib/solver'
import type { AcademyAlgorithm } from '../lib/academy'
import {
  ACADEMY_ALGORITHMS, ACADEMY_DRILLS, ACADEMY_LESSONS, ACADEMY_TEACHING_NOTES, CFOP_CASE_COUNTS, TWO_LOOK_OLL_CASES, TWO_LOOK_PLL_CASES,
  ACADEMY_STORAGE_KEY, academyPlan, academyProgressPercent, initialAcademyProgress,
  inverseAcademySequence, parseAcademyProgress
} from '../lib/academy'
import type { AcademyCategory, AcademyModule, AcademyProgress } from '../lib/academy'

// Academy uses the same actual sticker + physical layer-turn renderer as racing.
// Demonstrations are algorithm-specific cases, not claims that one move sequence
// solves every possible scramble or fully replaces learning case recognition.

type Tab = 'overview' | 'notation' | 'course' | 'library' | 'drills'
type LibraryFilter = 'all'|'saved'|'starter-oll'|'starter-pll'|AcademyCategory
type Props = { reducedMotion:boolean; goToRace:()=>void }
const MODULE_LABELS:Record<AcademyModule,string> = {
  notation:'Notation',cross:'Cross',f2l:'F2L',oll:'OLL',pll:'PLL',finger:'Finger Tricks'
}
const CATEGORY_LABELS:Record<AcademyCategory,string> = {
  fundamentals:'Fundamentals',cross:'Cross',f2l:'F2L',oll:'OLL',pll:'PLL'
}
const CATEGORY_OPTIONS: Array<{value:LibraryFilter;label:string}> = [
  {value:'all',label:'All algorithms'},{value:'saved',label:'Saved ★'},{value:'starter-oll',label:'2-Look OLL · 10'},{value:'starter-pll',label:'2-Look PLL · 6'},{value:'fundamentals',label:'Fundamentals'},
  {value:'cross',label:'Cross'},{value:'f2l',label:'F2L'},
  {value:'oll',label:'OLL'},{value:'pll',label:'PLL'}
]
const BASE_FACES = [
  {face:'R',name:'Right',direction:'→',color:'#f95768'},
  {face:'L',name:'Left',direction:'←',color:'#ffb26e'},
  {face:'U',name:'Up',direction:'↑',color:'#ffd769'},
  {face:'D',name:'Down',direction:'↓',color:'#eff1ff'},
  {face:'F',name:'Front',direction:'↗',color:'#4e9dff'},
  {face:'B',name:'Back',direction:'↖',color:'#39d39f'},
] as const

function loadProgress():AcademyProgress {
  try { return parseAcademyProgress(JSON.parse(localStorage.getItem(ACADEMY_STORAGE_KEY) || 'null')) }
  catch { return initialAcademyProgress() }
}

function AcademyCube({sequence,msPerMove=660,modeLabel,reducedMotion=false,setupScramble}:{
  sequence:string;msPerMove?:number;modeLabel:string;reducedMotion?:boolean;setupScramble?:string
}) {
  const [elapsed,setElapsed]=useState(0)
  const [playing,setPlaying]=useState(false)
  const [speed,setSpeed]=useState(1)
  const plan=useMemo(()=>academyPlan(sequence,msPerMove),[sequence,msPerMove])
  const setup=useMemo(()=>setupScramble??inverseAcademySequence(sequence),[sequence,setupScramble])
  useEffect(()=>{setElapsed(0);setPlaying(false)},[sequence])
  useEffect(()=>{
    if(!playing)return
    let id=0,last=0
    const tick=(now:number)=>{
      if(!last)last=now
      const delta=Math.min(100,now-last)
      last=now
      setElapsed(previous=>Math.min(plan.totalMs,previous+delta*speed))
      id=requestAnimationFrame(tick)
    }
    id=requestAnimationFrame(tick)
    return ()=>cancelAnimationFrame(id)
  },[playing,speed,plan.totalMs])
  useEffect(()=>{if(playing&&elapsed>=plan.totalMs)setPlaying(false)},[elapsed,playing,plan.totalMs])
  const completed=plan.moveEndsMs.filter(x=>x<=elapsed).length
  const activeMove=plan.moves[completed]
  const progress=plan.totalMs>0?Math.min(100,Math.round(elapsed/plan.totalMs*100)):0
  const play=()=>{
    if(plan.totalMs<=0)return
    if(elapsed>=plan.totalMs)setElapsed(0)
    setPlaying(v=>!v)
  }
  const previous=()=>{
    setPlaying(false)
    setElapsed(plan.moveEndsMs.filter(end=>end<elapsed-0.5).at(-1)??0)
  }
  const next=()=>{
    setPlaying(false)
    setElapsed(plan.moveEndsMs.find(end=>end>elapsed+0.5)??plan.totalMs)
  }
  return <div className="academy-player">
    <div className="academy-player-stage">
      <div className="academy-player-stage-top"><span><Sparkles size={14}/> LIVE 3D PRACTICE</span><span className="academy-stage-tag">{modeLabel}</span></div>
      <AcademyOrbitCube scramble={setup} plan={plan} elapsedMs={elapsed} reducedMotion={reducedMotion}/>
      <div className="academy-player-stage-bottom"><span>{completed===plan.moves.length?'Sequence complete':elapsed===0?`Ready for ${activeMove??'the next move'}`:activeMove?`Turning ${activeMove}`:'Ready to practice'}</span><span>{completed} / {plan.moves.length} moves</span></div>
    </div>
    <div className="academy-player-controls">
      <div className="academy-playback-bar"><span>Playback</span><strong>{progress}%</strong></div>
      <input aria-label="Scrub algorithm playback" className="academy-seek" type="range" min={0} max={Math.max(1,plan.totalMs)} value={elapsed} step={10}
        onChange={e=>{setPlaying(false);setElapsed(Number(e.target.value))}} />
      <div className="academy-control-buttons">
        <button className="academy-icon-button" title="Restart" aria-label="Restart playback" onClick={()=>{setPlaying(false);setElapsed(0)}}><RotateCcw size={17}/></button>
        <button className="academy-icon-button" title="Previous move" aria-label="Previous move" onClick={previous}><SkipBack size={18}/></button>
        <button className="academy-play-button" onClick={play} aria-label={playing?'Pause playback':'Play solution'}>{playing?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}{playing?'Pause':'Play'}</button>
        <button className="academy-icon-button" title="Next move" aria-label="Next move" onClick={next}><SkipForward size={18}/></button>
        <label className="academy-speed-control"><span>Speed</span><select aria-label="Playback speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
      </div>
    </div>
    <div className="academy-move-scroll" aria-label="Algorithm moves">
      {plan.moves.map((token,index)=><button key={`${index}-${token}`} title={`Show state after move ${index+1}`} aria-label={`Go to move ${index+1}, ${token}`} className={`academy-move-token ${index===completed && elapsed<plan.totalMs?'current':''} ${index<completed?'done':''}`} onClick={()=>{setPlaying(false);setElapsed(plan.moveEndsMs[index])}}><small>{index+1}</small>{token}</button>)}
    </div>
    <p className="academy-player-note"><CircleHelp size={14}/> {setupScramble?'This starts with your real generated scramble and shows its verified Cross-only moves. The other pieces may remain unsolved.':'This is a prepared case using inverse setup moves. The cube performs the real turns for this example.'}{reducedMotion?' Use the step buttons if you prefer minimal motion.':''}</p>
  </div>
}

const CUBE_COLORS = {U:'#ffd45c',D:'#f6f7ff',F:'#398cff',R:'#ec4965',L:'#fa9b4c',B:'#2fc696'} as const
const RING_FACES = ['F','R','B','L'] as const
function CasePattern({algorithm,compact=false}:{algorithm:AcademyAlgorithm;compact?:boolean}) {
  const faces=useMemo(()=>cubeFacesAt(inverseAcademySequence(algorithm.sequence)),[algorithm.sequence])
  return <div className={`academy-pattern ${compact?'compact':''}`} title={`Prepared starting pattern for ${algorithm.name}`}>
    {!compact&&<div className="academy-pattern-heading"><strong>Recognize this case</strong><span>Prepared starting position</span></div>}
    <div className="academy-pattern-inner">
      <div className="academy-pattern-top" role="img" aria-label={`Top view of prepared cube for ${algorithm.name}`}>
        {faces.U.map((sticker,i)=><span key={i} style={{background:CUBE_COLORS[sticker]}} title={`Top sticker ${i+1}: ${sticker}`}/>)}
      </div>
      {!compact&&<div className="academy-pattern-side-rows">
        {RING_FACES.map(face=><div className="academy-pattern-side-row" key={face}><span className="academy-pattern-side-label">{face}</span><div>{faces[face].slice(0,3).map((color,i)=><span key={i} style={{background:CUBE_COLORS[color]}} title={`${face} side sticker ${i+1}: ${color}`}/>)}</div></div>)}
      </div>}
    </div>
    {!compact&&<p>{algorithm.category==='oll'?'Yellow on top: compare the top shape and the yellow stickers along its sides.':algorithm.category==='pll'?'Yellow on top: recognize matching color bars and headlights on the four sides.':algorithm.category==='f2l'?'Watch the front-right corner and edge positions. The 3D demo shows the complete prepared cube.':'This is a prepared practice state. Follow the sequence to see how the pieces move.'}</p>}
  </div>
}

function CrossChallenge({reducedMotion}:{reducedMotion:boolean}) {
  const [scramble,setScramble]=useState('')
  const [crossMoves,setCrossMoves]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const requestRef=useRef(0)
  useEffect(()=>()=>{requestRef.current+=1},[])
  const runChallenge=async()=>{
    const id=++requestRef.current
    const next=generateScramble()
    setScramble(next)
    setCrossMoves('')
    setError('')
    setLoading(true)
    try{
      // The race solver verifies every CFOP stage. Only its Cross is displayed.
      const result=await solveScramble(next)
      if(requestRef.current!==id)return
      const cross=result.stages.find(stage=>stage.id==='cross')?.moves??''
      if(!cross)throw new Error('The Cross was already solved. Generate another challenge.')
      setCrossMoves(cross)
    }catch(reason){if(requestRef.current===id)setError(reason instanceof Error?reason.message:'Unable to prepare the Cross example.')}
    finally{if(requestRef.current===id)setLoading(false)}
  }
  return <section className="academy-cross-challenge" aria-label="Cross practice on an actual random scramble">
    <div className="academy-section-heading"><div><span className="academy-label">PRACTICE FROM A REAL SCRAMBLE</span><h3>Cross Coach</h3><p>Get a random 3×3 scramble and see one verified Cross solution. There is no single Cross algorithm for every starting position.</p></div><button className="btn btn-primary" type="button" onClick={()=>void runChallenge()} disabled={loading}>{loading?<LoaderCircle size={16} className="spin-icon"/>:<RotateCcw size={16}/>} {loading?'Preparing Cross…':'Generate Cross challenge'}</button></div>
    {scramble&&<div className="academy-cross-scramble"><strong>SCRAMBLE</strong><code>{scramble}</code></div>}
    {loading&&<p className="academy-cross-status">Computing a real Cross for this scramble. The first calculation may take a moment.</p>}
    {error&&<p className="academy-cross-error" role="alert">{error}</p>}
    {crossMoves&&<div className="academy-cross-preview"><div><span className="academy-label">VERIFIED CROSS SOLUTION</span><p>{crossMoves}</p><small>See how the four white edges reach the bottom with matching side centers. Try planning these moves before playing them.</small></div><AcademyCube key={scramble} setupScramble={scramble} sequence={crossMoves} modeLabel="REAL CROSS" reducedMotion={reducedMotion}/></div>}
    {!scramble&&<div className="academy-cross-placeholder"><Target size={23}/><span>Generate a scramble, find the four white edges, and watch one way to solve the Cross.</span></div>}
  </section>
}

function NotationStudio({onTurn,reducedMotion}:{onTurn:()=>void;reducedMotion:boolean}){
  const [moves,setMoves]=useState<string[]>([])
  const [suffix,setSuffix]=useState<''|"'"|'2'>('')
  const [elapsed,setElapsed]=useState(0)
  const [playing,setPlaying]=useState(false)
  const duration=520
  const plan=useMemo(()=>academyPlan(moves.join(' '),duration),[moves])
  useEffect(()=>{
    if(!playing)return
    let id=0,last=0
    const frame=(now:number)=>{
      if(!last)last=now
      const delta=Math.min(100,now-last)
      last=now
      setElapsed(prev=>Math.min(plan.totalMs,prev+delta))
      id=requestAnimationFrame(frame)
    }
    id=requestAnimationFrame(frame)
    return()=>cancelAnimationFrame(id)
  },[playing,plan.totalMs])
  useEffect(()=>{if(playing&&elapsed>=plan.totalMs)setPlaying(false)},[elapsed,playing,plan.totalMs])
  const doMove=(face:string)=>{
    setElapsed(plan.totalMs)
    setMoves(prev=>[...prev,`${face}${suffix}`])
    setPlaying(!reducedMotion)
    if(reducedMotion)setElapsed((moves.length+1)*duration)
    onTurn()
  }
  const undo=()=>{
    setPlaying(false)
    setMoves(prev=>prev.slice(0,-1))
    setElapsed(Math.max(0,(moves.length-1)*duration))
  }
  const reset=()=>{setPlaying(false);setMoves([]);setElapsed(0)}
  return <div className="academy-notation-layout">
    <div className="academy-notation-workbench">
      <div className="academy-workbench-head"><span className="academy-label">INTERACTIVE 3D WORKBENCH</span><span className="academy-stage-tag">TRY EACH TURN</span></div>
      <AcademyOrbitCube scramble="" plan={plan} elapsedMs={elapsed} reducedMotion={reducedMotion}/>
      <div className="academy-workbench-controls"><span>{moves.length?'Your last move: '+moves.at(-1):'Solved cube — choose any face'}</span><div><button title="Undo last move" onClick={undo} disabled={!moves.length}><Undo2 size={16}/> Undo</button><button title="Reset cube" onClick={reset} disabled={!moves.length}><RotateCcw size={16}/> Reset</button></div></div>
      <div className="academy-move-scroll academy-notation-history" aria-live="polite">
        {moves.length?moves.slice(-16).map((move,i)=><span className="academy-move-token done" key={`${i}-${move}`}>{move}</span>):<span className="academy-history-placeholder">Your moves will appear here.</span>}
      </div>
    </div>
    <div className="academy-notation-actions">
      <div className="academy-lesson-minihead"><h3>Choose a face</h3><p>Turn it on the cube, then try prime or double moves.</p></div>
      <div className="academy-suffix-picker" role="group" aria-label="Turn type">
        {[{value:'',label:'Normal',symbol:'↻'},{value:"'",label:'Prime',symbol:'↺'},{value:'2',label:'Double',symbol:'2×'}].map(option=><button type="button" key={option.label} aria-pressed={suffix===option.value} className={suffix===option.value?'active':''} onClick={()=>setSuffix(option.value as ''|"'"|'2')}><b>{option.symbol}</b><span>{option.label}</span></button>)}
      </div>
      <div className="academy-face-grid">
        {BASE_FACES.map(entry=><button type="button" key={entry.face} className="academy-face-button" onClick={()=>doMove(entry.face)} aria-label={`Turn ${entry.name} ${suffix==="'"?'counterclockwise':suffix==='2'?'twice':'clockwise'}`}><span className="academy-face-symbol" style={{color:entry.color}}>{entry.face}{suffix}</span><span>{entry.name} <b>{entry.direction}</b></span></button>)}
      </div>
      <div className="academy-callout"><Lightbulb size={18}/><span>Clockwise means clockwise <strong>when you look straight at that face.</strong> A prime (′) reverses the turn and 2 means a 180° turn.</span></div>
    </div>
  </div>
}

export default function Academy({reducedMotion,goToRace}:Props){
  const [tab,setTab]=useState<Tab>('overview')
  const [progress,setProgress]=useState<AcademyProgress>(loadProgress)
  const [lessonId,setLessonId]=useState<AcademyModule>(()=>loadProgress().lastModule)
  const [algorithmId,setAlgorithmId]=useState('oll-27')
  const [drillId,setDrillId]=useState(ACADEMY_DRILLS[0].id)
  const [category,setCategory]=useState<LibraryFilter>('all')
  const [query,setQuery]=useState('')
  const [copied,setCopied]=useState(false)
  const [showCount,setShowCount]=useState(24)
  const explorerRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{try{localStorage.setItem(ACADEMY_STORAGE_KEY,JSON.stringify(progress));window.dispatchEvent(new Event('cubehero-learning-progress-changed'))}catch{/* unavailable */}},[progress])
  const selectedLesson=ACADEMY_LESSONS.find(x=>x.id===lessonId)??ACADEMY_LESSONS[0]
  const selectedDrill=ACADEMY_DRILLS.find(x=>x.id===drillId)??ACADEMY_DRILLS[0]
  const exampleAlgorithm=ACADEMY_ALGORITHMS.find(x=>x.id===selectedLesson.practiceAlgorithm)??ACADEMY_ALGORITHMS[0]
  const percentage=academyProgressPercent(progress.completed)
  const finished=progress.completed.length
  const filteredAlgorithms=ACADEMY_ALGORITHMS.filter(item=>(category==='all'||(category==='saved'?progress.favorites.includes(item.id):category==='starter-oll'?TWO_LOOK_OLL_CASES.some(id=>id===item.id):category==='starter-pll'?TWO_LOOK_PLL_CASES.some(id=>id===item.id):item.category===category)) && `${item.name} ${item.id} ${item.group??''} ${item.purpose} ${item.sequence}`.toLowerCase().includes(query.trim().toLowerCase()))
  // Never show an unrelated PLL case when the user chooses the OLL or F2L filter.
  const selectedAlgorithm=filteredAlgorithms.find(item=>item.id===algorithmId)??filteredAlgorithms[0]
  const shownAlgorithms=filteredAlgorithms.slice(0,showCount)
  const caseLearned=progress.masteredCases.length
  const toggleMastered=(id:string)=>setProgress(previous=>({...previous,masteredCases:previous.masteredCases.includes(id)?previous.masteredCases.filter(x=>x!==id):[...previous.masteredCases,id]}))
  const selectCategory=(value:typeof category)=>{setCategory(value);setShowCount(24)}

  const switchTab=(next:Tab)=>{
    if(next==='course'&&!['cross','f2l','oll','pll'].includes(lessonId))setLessonId('cross')
    setTab(next)
    if(next!=='overview')window.setTimeout(()=>explorerRef.current?.scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'}),0)
  }
  const chooseLesson=(id:AcademyModule)=>{
    setLessonId(id)
    setProgress(prev=>({...prev,lastModule:id}))
    switchTab(id==='notation'?'notation':id==='finger'?'drills':'course')
  }
  const complete=(id:AcademyModule)=>setProgress(prev=>({...prev,completed:prev.completed.includes(id)?prev.completed:[...prev.completed,id],lastModule:id}))
  const toggleFavorite=(id:string)=>setProgress(prev=>({...prev,favorites:prev.favorites.includes(id)?prev.favorites.filter(x=>x!==id):[...prev.favorites,id]}))
  const copyAlgorithm=async(value:string)=>{try{await navigator.clipboard.writeText(value);setCopied(true);window.setTimeout(()=>setCopied(false),1300)}catch{/* still selectable */}}

  return <div className="academy-page page-stack">
    <section className="academy-hero" aria-label="Cube Hero Academy welcome">
      <div className="academy-hero-content"><span className="academy-eyebrow"><Sparkles size={15}/> THE CUBE HERO ACADEMY <i/> LEARN AT YOUR PACE</span>
        <h1>Master the moves.<br/><em>Unlock your speed.</em></h1>
        <p>Start from cube notation, learn all four CFOP stages, explore all 119 standard cases, and practice every move on a turning 3D cube.</p>
        <div className="academy-hero-actions"><button className="btn btn-primary btn-lg" onClick={()=>chooseLesson(progress.lastModule)}><BookOpen size={18}/>{finished?'Continue learning':'Start learning'} <ArrowRight size={17}/></button><button className="btn btn-outline btn-lg" onClick={()=>switchTab('library')}><Layers3 size={18}/> Algorithm library</button></div>
        <div className="academy-trust"><CheckCircle2 size={15}/> Interactive cube turns <span>•</span> Progress saved locally</div>
      </div>
      <div className="academy-hero-visual" aria-hidden="true"><div className="academy-halo"><GraduationCap size={55}/></div><span className="academy-floating-symbol sym-a">R U R′</span><span className="academy-floating-symbol sym-b">F2L</span><span className="academy-floating-symbol sym-c">PLL</span><span className="academy-visual-caption"><Zap size={15}/> PRACTICE • REPEAT • IMPROVE</span></div>
    </section>

    <section className="academy-overview-metrics" aria-label="Your academy progress">
      <div className="academy-progress-card"><div className="academy-progress-ring" style={{'--academy-progress':`${percentage}%`} as React.CSSProperties}><span>{percentage}%</span></div><div><span className="academy-label">YOUR LEARNING PROGRESS</span><strong>{finished} of 6 lessons complete</strong><p>Finish a lesson when you feel confident, then keep practicing.</p></div></div>
      <div className="academy-mini-metric"><span className="academy-metric-icon"><Bookmark size={21}/></span><strong>{progress.favorites.length}</strong><small>Saved algorithms</small></div>
      <div className="academy-mini-metric"><span className="academy-metric-icon"><Hand size={21}/></span><strong>{progress.notationTurns}</strong><small>Notation turns practiced</small></div>
    </section>

    <section className="academy-case-counts" aria-label="Complete CFOP course coverage">
      <div><span>CROSS</span><strong>Intuitive</strong><small>12 guided examples</small></div>
      <div><span>F2L</span><strong>{CFOP_CASE_COUNTS.f2l} cases</strong><small>All front-right pair patterns</small></div>
      <div><span>OLL</span><strong>{CFOP_CASE_COUNTS.oll} cases</strong><small>Full last-layer orientation</small></div>
      <div><span>PLL</span><strong>{CFOP_CASE_COUNTS.pll} cases</strong><small>Every last-layer permutation</small></div>
    </section>
    <div className="academy-learned-meter"><span>CASE MASTERY</span><strong>{caseLearned} saved as learned</strong><span>All progress stays on this device</span></div>

    <section className="academy-explorer" ref={explorerRef}>
      <div className="academy-explorer-head"><div><span className="academy-label">YOUR LEARNING SPACE</span><h2>Choose what to practice</h2></div><span className="academy-explorer-subtitle">Click any tab to switch activities</span></div>
      <div className="academy-tabs" role="tablist" aria-label="Academy sections">
        {[{key:'overview',label:'Overview',icon:GraduationCap},{key:'notation',label:'Notation lab',icon:Target},{key:'course',label:'CFOP lessons',icon:Layers3},{key:'library',label:'Algorithms',icon:BookOpen},{key:'drills',label:'Finger tricks',icon:Zap}].map(entry=><button key={entry.key} type="button" role="tab" aria-selected={tab===entry.key} className={`academy-tab ${tab===entry.key?'active':''}`} onClick={()=>switchTab(entry.key as Tab)}><entry.icon size={17}/>{entry.label}</button>)}
      </div>

      {tab==='overview'&&<div className="academy-overview-content">
        <div className="academy-section-heading"><div><span className="academy-label">THE LEARNING PATH</span><h3>Six steps to better solves</h3><p>Start with moves, learn CFOP, then build speed and control.</p></div><span className="academy-path-badge"><ListChecks size={16}/> {finished}/6 complete</span></div>
        <div className="academy-course-grid">{ACADEMY_LESSONS.map((lesson,index)=><button key={lesson.id} className={`academy-course-card ${progress.completed.includes(lesson.id)?'completed':''}`} aria-label={`${lesson.title}. ${lesson.description}. ${progress.completed.includes(lesson.id)?'Review lesson':'Open lesson'}`} onClick={()=>chooseLesson(lesson.id)}><span className="academy-course-top"><span className="academy-course-num">{String(index+1).padStart(2,'0')}</span>{progress.completed.includes(lesson.id)?<span className="academy-completed"><Check size={14}/> COMPLETE</span>:<span className="academy-course-level">{lesson.level.toUpperCase()}</span>}</span><strong>{lesson.title}</strong><p>{lesson.description}</p><span className="academy-course-cta">{progress.completed.includes(lesson.id)?'Review lesson':'Open lesson'} <ArrowRight size={16}/></span></button>)}</div>
        <div className="academy-quick-grid"><button onClick={()=>switchTab('notation')}><span className="academy-quick-icon"><Target size={20}/></span><strong>Try a cube turn</strong><small>Tap a face and watch the 3D cube move</small><ArrowRight size={17}/></button><button onClick={()=>switchTab('library')}><span className="academy-quick-icon"><BookOpen size={20}/></span><strong>Browse algorithms</strong><small>Search OLL, PLL and everyday triggers</small><ArrowRight size={17}/></button><button onClick={()=>switchTab('drills')}><span className="academy-quick-icon"><Zap size={20}/></span><strong>Train your fingers</strong><small>Practice smooth turns with guided drills</small><ArrowRight size={17}/></button></div>
      </div>}

      {tab==='notation'&&<div className="academy-content-panel">
        <div className="academy-section-heading"><div><span className="academy-label">LESSON 01 · BEGINNER</span><h3>Learn cube notation by doing</h3><p>Pick a face and watch it actually turn on the cube.</p></div><span className="academy-path-badge"><Target size={15}/> INTERACTIVE</span></div>
        <NotationStudio reducedMotion={reducedMotion} onTurn={()=>setProgress(prev=>({...prev,notationTurns:Math.min(999999,prev.notationTurns+1)}))}/>
        <div className="academy-lesson-footer"><div><strong>Feel confident reading R, U, F, primes and 2?</strong><p>Mark this topic complete and move on to Cross.</p></div><button className={`btn ${progress.completed.includes('notation')?'btn-outline':'btn-primary'}`} onClick={()=>complete('notation')}><Check size={17}/>{progress.completed.includes('notation')?'Completed':'Mark as learned'}</button><button className="btn btn-outline" onClick={()=>chooseLesson('cross')}>Next: Cross <ArrowRight size={16}/></button></div>
      </div>}

      {tab==='course'&&<div className="academy-content-panel">
        <div className="academy-section-heading"><div><span className="academy-label">GUIDED CFOP PATH</span><h3>Learn one stage at a time</h3><p>Short explanations and a real animated cube for every lesson.</p></div><span className="academy-path-badge"><Layers3 size={15}/> FOUR STAGES</span></div>
        <div className="academy-stage-select" role="group" aria-label="Choose CFOP stage">{ACADEMY_LESSONS.filter(x=>['cross','f2l','oll','pll'].includes(x.id)).map(lesson=><button type="button" key={lesson.id} aria-pressed={lessonId===lesson.id} className={lessonId===lesson.id?'active':''} onClick={()=>{setLessonId(lesson.id);setProgress(prev=>({...prev,lastModule:lesson.id}))}}><span>{MODULE_LABELS[lesson.id]}</span>{progress.completed.includes(lesson.id)&&<CheckCircle2 size={15}/>}</button>)}</div>
        <div className="academy-lesson-layout">
          <div className="academy-lesson-info"><span className="academy-label">{selectedLesson.label}</span><h3>{selectedLesson.title}</h3><p className="academy-lesson-intro">{selectedLesson.intro}</p><div className="academy-checklist"><strong><ListChecks size={18}/> Step by step</strong>{selectedLesson.steps.map((step,index)=><div key={index}><span>{index+1}</span><p>{step}</p></div>)}</div>{(['cross','f2l','oll','pll'] as string[]).includes(selectedLesson.id)&&<div className="academy-teaching-detail">
            <div className="academy-teaching-goal"><Target size={18}/><div><strong>What you should finish with</strong><p>{ACADEMY_TEACHING_NOTES[selectedLesson.id as 'cross'|'f2l'|'oll'|'pll'].goal}</p></div></div>
            <h4>How to recognize the pieces</h4><ul>{ACADEMY_TEACHING_NOTES[selectedLesson.id as 'cross'|'f2l'|'oll'|'pll'].recognition.map(item=><li key={item}>{item}</li>)}</ul>
            <h4>Beginner-friendly method</h4><ol>{ACADEMY_TEACHING_NOTES[selectedLesson.id as 'cross'|'f2l'|'oll'|'pll'].beginnerSteps.map(item=><li key={item}>{item}</li>)}</ol>
            <h4>Common mistakes</h4><ul>{ACADEMY_TEACHING_NOTES[selectedLesson.id as 'cross'|'f2l'|'oll'|'pll'].mistakes.map(item=><li key={item}>{item}</li>)}</ul>
            <p className="academy-teaching-practice">{ACADEMY_TEACHING_NOTES[selectedLesson.id as 'cross'|'f2l'|'oll'|'pll'].practice}</p>
            <button className="btn btn-outline" onClick={()=>{selectCategory(selectedLesson.id as AcademyCategory);switchTab('library')}}><Layers3 size={16}/> Explore {selectedLesson.id==='cross'?'Cross exercises':`all ${selectedLesson.id==='f2l'?41:selectedLesson.id==='oll'?57:21} ${selectedLesson.id.toUpperCase()} cases`} <ArrowRight size={16}/></button>
          </div>}<div className="academy-callout"><Lightbulb size={18}/><span>{selectedLesson.why}</span></div></div>
          <div className="academy-lesson-demo"><div className="academy-demo-head"><div><span className="academy-label">WATCH THE MOVE SEQUENCE</span><h4>{exampleAlgorithm.name}</h4></div><span className="academy-stage-tag">DEMO</span></div><div className="academy-alg-sequence">{exampleAlgorithm.sequence}</div><AcademyCube key={selectedLesson.id} sequence={exampleAlgorithm.sequence} modeLabel={MODULE_LABELS[selectedLesson.id]} reducedMotion={reducedMotion}/><div className="academy-setup-note">Setup for this example: <code>{inverseAcademySequence(exampleAlgorithm.sequence)}</code></div></div>
        </div>
        {selectedLesson.id==='cross'&&<CrossChallenge reducedMotion={reducedMotion}/>}
        <div className="academy-lesson-footer"><div><strong>{progress.completed.includes(selectedLesson.id)?'Lesson completed':'Ready to move forward?'}</strong><p>Practice until you can explain what each move does.</p></div><button className={`btn ${progress.completed.includes(selectedLesson.id)?'btn-outline':'btn-primary'}`} onClick={()=>complete(selectedLesson.id)}><Check size={17}/>{progress.completed.includes(selectedLesson.id)?'Completed':'Mark as learned'}</button><button className="btn btn-outline" onClick={()=>chooseLesson(selectedLesson.id==='cross'?'f2l':selectedLesson.id==='f2l'?'oll':selectedLesson.id==='oll'?'pll':'finger')}>Next lesson <ArrowRight size={16}/></button></div>
      </div>}

      {tab==='library'&&<div className="academy-content-panel">
        <div className="academy-section-heading"><div><span className="academy-label">ALGORITHM COLLECTION</span><h3>All CFOP cases, with 3D demos</h3><p>Every F2L, OLL and PLL case, plus Cross practice. Search, recognize, play and track what you learn.</p></div><span className="academy-path-badge"><BookOpen size={15}/> {ACADEMY_ALGORITHMS.length} ENTRIES</span></div>
        <div className="academy-library-tools"><label className="academy-search"><Search size={18}/><input type="search" value={query} onChange={e=>{setQuery(e.target.value);setShowCount(24)}} placeholder="Search Sune, PLL, R U R'…" aria-label="Search algorithms"/></label><div className="academy-category-filters" role="group" aria-label="Algorithm categories">{CATEGORY_OPTIONS.map(item=><button key={item.value} aria-pressed={category===item.value} className={category===item.value?'active':''} onClick={()=>selectCategory(item.value)}>{item.label}</button>)}</div></div>
        <div className="academy-library-overview">
          <strong>Complete standard CFOP set: 41 F2L · 57 OLL · 21 PLL</strong>
          <p>Cross is learned by thinking through edge positions, not memorizing a fixed set of algorithms. Learn the easy cases first, then work through the advanced families. Each example starts from a prepared cube state.</p>
          <div className="academy-library-summary"><span>{filteredAlgorithms.length} matching entries</span><span>{caseLearned} cases learned</span><span>{progress.favorites.length} saved</span></div>
        </div>
        <div className="academy-library-layout">
          <div className="academy-algorithm-browser">
            <div className="academy-library-counter"><strong>{filteredAlgorithms.length} results</strong><span>Showing {Math.min(showCount,filteredAlgorithms.length)}</span></div>
            <div className="academy-algorithm-list">{shownAlgorithms.map(item=><button key={item.id} className={`academy-algorithm-card ${selectedAlgorithm?.id===item.id?'selected':''}`} onClick={()=>setAlgorithmId(item.id)}>
              <div className="academy-algorithm-list-body"><span className="academy-algorithm-card-top"><b>{item.name}</b><span>{CATEGORY_LABELS[item.category]}</span></span><code>{item.sequence}</code><small>{item.group??item.purpose}</small><span className="academy-case-progress">{progress.masteredCases.includes(item.id)?'✓ Learned':progress.favorites.includes(item.id)?'★ Saved':'Select to learn'}</span></div>
              <CasePattern algorithm={item} compact/>
            </button>)}{!filteredAlgorithms.length&&<div className="academy-no-results"><Search size={22}/><strong>No algorithms found</strong><p>Try a different name, stage, or sequence.</p></div>}</div>
            {showCount<filteredAlgorithms.length&&<button className="btn btn-outline academy-show-more" onClick={()=>setShowCount(n=>n+24)}>Show next {Math.min(24,filteredAlgorithms.length-showCount)} cases <ChevronRight size={16}/></button>}
          </div>
          <div className="academy-library-preview">{selectedAlgorithm?<>
            <div className="academy-demo-head"><div><span className="academy-label">SELECTED CASE · {selectedAlgorithm.group??'PRACTICE'}</span><h4>{selectedAlgorithm.name}</h4></div><span className="academy-stage-tag">{CATEGORY_LABELS[selectedAlgorithm.category]}</span></div>
            <p className="academy-preview-purpose">{selectedAlgorithm.purpose}</p>
            <CasePattern algorithm={selectedAlgorithm}/>
            <div className="academy-alg-sequence">{selectedAlgorithm.sequence}</div>
            <AcademyCube key={selectedAlgorithm.id} sequence={selectedAlgorithm.sequence} modeLabel={selectedAlgorithm.level} reducedMotion={reducedMotion}/>
            <div className="academy-preview-actions"><button className="btn btn-outline" onClick={()=>void copyAlgorithm(selectedAlgorithm.sequence)}><Copy size={16}/>{copied?'Copied':'Copy moves'}</button><button className={`btn ${progress.favorites.includes(selectedAlgorithm.id)?'btn-primary':'btn-outline'}`} onClick={()=>toggleFavorite(selectedAlgorithm.id)}><Bookmark size={16}/>{progress.favorites.includes(selectedAlgorithm.id)?'Saved':'Save case'}</button><button className={`btn ${progress.masteredCases.includes(selectedAlgorithm.id)?'btn-outline':'btn-primary'}`} onClick={()=>toggleMastered(selectedAlgorithm.id)}><Check size={16}/>{progress.masteredCases.includes(selectedAlgorithm.id)?'Mark as learning':'Mark as learned'}</button></div>
            <div className="academy-callout"><Lightbulb size={18}/><span>{selectedAlgorithm.recognition??selectedAlgorithm.tip} {selectedAlgorithm.tip}</span></div>
            <p className="academy-recognition-disclaimer">This 3D exercise is prepared using the inverse of the selected algorithm. On a real scramble, find the matching pattern and adjust U alignment or cube grip as needed.</p>
          </>:<div className="academy-no-results"><Search size={21}/><strong>Select an algorithm</strong><p>Try changing your search or category to see a case preview.</p></div>}</div>
        </div>
      </div>}

      {tab==='drills'&&<div className="academy-content-panel">
        <div className="academy-section-heading"><div><span className="academy-label">SMOOTHER MOVES, BETTER FLOW</span><h3>Finger tricks & lookahead drills</h3><p>Follow the animated examples at a comfortable speed.</p></div><span className="academy-path-badge"><Hand size={15}/> HANDS-ON PRACTICE</span></div>
        <div className="academy-drills-layout"><div className="academy-drill-list">{ACADEMY_DRILLS.map(drill=><button className={`academy-drill-card ${drillId===drill.id?'selected':''}`} key={drill.id} onClick={()=>setDrillId(drill.id)}><span className="academy-label">{drill.label}</span><strong>{drill.name}</strong><p>{drill.objective}</p><span>Practice drill <ChevronRight size={16}/></span></button>)}<div className="academy-coach-note"><Eye size={19}/><div><strong>Lookahead advice</strong><p>During F2L, try tracking the next pair while finishing the current one. Start slow and reduce pauses.</p></div></div></div>
          <div className="academy-drill-preview"><span className="academy-label">GUIDED MOVEMENT</span><h4>{selectedDrill.name}</h4><p>{selectedDrill.objective}</p><div className="academy-alg-sequence">{selectedDrill.sequence}</div><AcademyCube key={selectedDrill.id} sequence={selectedDrill.sequence} modeLabel="FINGER TRICK" reducedMotion={reducedMotion}/><div className="academy-checklist academy-drill-cues"><strong><ListChecks size={18}/> Technique cues</strong>{selectedDrill.cues.map((cue,i)=><div key={cue}><span>{i+1}</span><p>{cue}</p></div>)}</div></div></div>
        <div className="academy-lesson-footer"><div><strong>Practice makes smoother solves.</strong><p>Mark Finger Tricks as learned when you're comfortable with these drills.</p></div><button className={`btn ${progress.completed.includes('finger')?'btn-outline':'btn-primary'}`} onClick={()=>complete('finger')}><Check size={17}/>{progress.completed.includes('finger')?'Completed':'Mark as learned'}</button></div>
      </div>}
    </section>

    <div className="academy-bottom-banner"><div className="academy-bottom-icon"><Trophy size={25}/></div><div><span className="academy-label">PUT YOUR SKILLS TO THE TEST</span><h3>Practice what you just learned.</h3><p>Challenge an AI opponent with real timed solves. Your Academy progress is saved separately.</p></div><button className="btn btn-primary" onClick={goToRace}>Race the AI <ArrowRight size={17}/></button></div>
    <p className="academy-privacy-note"><LockKeyhole size={14}/> Learning progress stays in your browser. No account or camera is needed.</p>
  </div>
}
