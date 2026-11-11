import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight, ArrowUpRight, BarChart3, BookOpen, BrainCircuit, Check, ChevronDown,
  ChevronRight, CircleHelp, Clock3, Flag, Gauge,
  Home, Layers3, Menu, PanelLeftClose, PanelLeftOpen, RotateCcw, Settings2, ShieldCheck,
  Shuffle, SlidersHorizontal, Sparkles, Timer, Trophy,
  X, Zap, ChartNoAxesCombined, CheckCircle2, LockKeyhole,
  Ghost, Award, Smartphone, TabletSmartphone, RefreshCw, RotateCw, Volume2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import CubeArt from './components/CubeArt'
import aiHeroCore from './assets/neon-holographic-ai-core.png'
import RaceRoom from './components/RaceRoom'
import RaceResults from './components/RaceResults'
import RaceStatistics from './components/RaceStatistics'
import RivalSelect from './components/RivalSelect'
import PlayerAvatar from './components/PlayerAvatar'
import AvatarSettings from './components/AvatarSettings'
import { useLocalPlayer } from './components/LocalPlayerProvider'
import { isValidPlayerName, normalizePlayerName, PLAYER_NAME_MAX_LENGTH } from './lib/localPlayer'
import VsIntro from './components/VsIntro'
import LevelUpCelebration from './components/LevelUpCelebration'
import { getRival } from './lib/rivals'
import { earnedLevel } from './lib/levelUp'
import type { LevelUpMilestone } from './lib/levelUp'
import GhostRace from './components/GhostRace'
import SoloTimer from './components/SoloTimer'
import Academy from './components/Academy'
import HeroJourney from './components/HeroJourney'
import type { JourneyTab } from './components/HeroJourney'
import { JOURNEY_STORAGE_KEY, JOURNEY_UPDATED_EVENT, parseJourney, blankJourney, syncJourney, startTournament as startJourneyTournament, recordTournamentRound, activeTournament, tournamentStandings, levelInfo, journeyMetrics } from './lib/heroJourney'
import type { JourneyState, TournamentSeries } from './lib/heroJourney'
import { parseGhostData, GHOST_STORAGE_KEY, emptyGhostData } from './lib/ghost'
import { ACADEMY_STORAGE_KEY, parseAcademyProgress, initialAcademyProgress } from './lib/academy'
import RaceMechanicsModal from './components/RaceMechanicsModal'
import { hasSeenMechanics, markMechanicsSeen } from './lib/mechanicsVisit'
import { aiPrefetch } from './lib/aiPrefetch'
import { getAiCount, MAX_AI_OPPONENTS, newId, RACE_COUNT, isRaceRecord, aiExpectedMeanMs, formatTime, getAiPersonality, PERSONALITY_DESCRIPTIONS, isDifficulty } from './lib/racing'
import type { RaceRecord, RaceSession, RaceSettings, Difficulty, RaceLength, AiPersonality } from './lib/racing'
import { canRequestOrientationLock, orientationPreference, requestOrientationPreference } from './lib/orientation'
import type { OrientationPreference, OrientationLockFeedback } from './lib/orientation'
import { configureGameAudio, playGameSound, unlockGameAudio } from './lib/gameAudio'

type Page='home'|'race'|'room'|'results'|'practice'|'solo'|'statistics'|'learn'|'journey'|'settings'
type Preferences={sound:boolean;soundVolume:number;cinematicSounds:boolean;timerSounds:boolean;reducedMotion:boolean;compact:boolean;precision:'2'|'3';orientation:OrientationPreference}
const ROUTES:Page[]=['home','race','room','results','practice','solo','statistics','learn','journey','settings']
const PERSONALITIES:{id:AiPersonality;label:string;hint:string;art:string}[]=[
  {id:'casual',label:'Casual',hint:'More mistakes & variation',art:'/ai-personalities/casual.png'},
  {id:'balanced',label:'Balanced',hint:'Realistic mix · recommended',art:'/ai-personalities/balanced.png'},
  {id:'competitive',label:'Competitive',hint:'Steady, fewer slow rounds',art:'/ai-personalities/competitive.png'},
]
const NAV:{page:Page;label:string;icon:LucideIcon}[]=[
  {page:'home',label:'Home',icon:Home},
  {page:'race',label:'Race AI',icon:Flag},
  {page:'practice',label:'Ghost Race',icon:Ghost},
  {page:'solo',label:'Solo Timer',icon:Timer},
  {page:'statistics',label:'Statistics',icon:BarChart3},
  {page:'learn',label:'Learn',icon:BookOpen},
  {page:'journey',label:'Hero Journey',icon:Award},
]
const initialRace:RaceSettings={difficulty:'15',personality:'balanced',aiCount:1,raceLength:'single',inspection:true,showCube:true,breakdown:true,puzzle:'333'}
const initialPreferences:Preferences={sound:false,soundVolume:55,cinematicSounds:true,timerSounds:true,reducedMotion:false,compact:false,precision:'2',orientation:'auto'}
const PATH_LABELS:Record<Page,string>={home:'Overview',race:'Set up your race',room:'Live race arena',results:'Race results',practice:'YOU vs YOU · Ghost Race',solo:'Solo practice timer',statistics:'Your statistics',learn:'Learn speedcubing',journey:'Achievements & progression',settings:'Settings'}

function readSaved<T extends object>(key:string,fallback:T):T {
  try { const value=window.localStorage.getItem(key);return value?{...fallback,...JSON.parse(value)}:fallback }catch{return fallback}
}
function useSavedState<T extends object>(key:string,fallback:T):[T,(value:T)=>void] {
  const [value,setValue]=useState<T>(()=>readSaved(key,fallback))
  useEffect(()=>{try{window.localStorage.setItem(key,JSON.stringify(value))}catch{/* private browsing */}},[key,value])
  return [value,setValue]
}
function loadJourney():JourneyState {
  try{return parseJourney(JSON.parse(localStorage.getItem(JOURNEY_STORAGE_KEY)||'null'))}
  catch{return blankJourney()}
}
function loadJourneySources(){
  let ghost=emptyGhostData(),academy=initialAcademyProgress()
  try{ghost=parseGhostData(JSON.parse(localStorage.getItem(GHOST_STORAGE_KEY)||'null'))}catch{/* storage optional */}
  try{academy=parseAcademyProgress(JSON.parse(localStorage.getItem(ACADEMY_STORAGE_KEY)||'null'))}catch{/* storage optional */}
  return {ghost,academy}
}
function getCurrentPage():Page {
  const route=window.location.hash.replace('#/','') as Page
  return ROUTES.includes(route)?route:'home'
}
function Logo({small=false}:{small?:boolean}) {
  return <div className="brand-logo" aria-label="Cube Hero">
    <span className="brand-mascot-wrap" aria-hidden="true">
      <img className="brand-mascot" src="/cube-hero-mascot-384.png" width="60" height="60" alt="" decoding="async" />
    </span>
    {!small&&<span>Cube <strong>Hero</strong></span>}
  </div>
}
function LabelBadge({children,subtle=false}:{children:ReactNode;subtle?:boolean}){return <span className={`label-badge${subtle?' badge-muted':''}`}>{children}</span>}
function SectionHead({eyebrow,title,description,right}:{eyebrow?:string;title:string;description?:string;right?:ReactNode}){
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow||'CUBE HERO ARENA'}</div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{right&&<div className="heading-right">{right}</div>}</div>
}
function Surface({children,className=''}:{children:ReactNode;className?:string}){return <section className={`surface ${className}`}>{children}</section>}
function InfoCard({icon:Icon,title,description,tone='purple',number,category,action,onClick}:{
  icon:LucideIcon;title:string;description:string;tone?:'purple'|'blue'|'green'|'pink';number:string;category:string;action:string;onClick:()=>void
}){
  return <button type="button" className={`feature-card ch-home-feature-card ch-home-tone-${tone}`} onClick={onClick} aria-label={`${title} — ${action}`}>
    <span className="ch-home-feature-head"><span className={`feature-icon tone-${tone}`}><Icon size={23} strokeWidth={2}/></span><span className="ch-home-feature-index">{number} <span>/ 04</span></span></span>
    <span className="ch-home-feature-content"><span className="ch-home-feature-category">{category}</span><span className="ch-home-feature-title">{title}</span><span className="ch-home-feature-desc">{description}</span></span>
    <span className="ch-home-feature-foot"><span>{action}</span><span className="ch-home-feature-arrow"><ArrowUpRight size={17}/></span></span>
  </button>
}
function Switch({checked,onChange,label}:{checked:boolean;onChange:(value:boolean)=>void;label:string}){
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} className={`switch ${checked?'on':''}`} onClick={()=>onChange(!checked)}><span/></button>
}

function HomePage({goTo,journey}:{goTo:(page:Page)=>void;journey:JourneyState}){
  const progress=levelInfo(journeyMetrics(journey).xp)
  return <div className="page-stack">
    <section className="hero">
      <div className="hero-content"><div className="hero-kicker"><Sparkles size={15}/> YOUR SPEEDCUBING ARENA</div>
        <h1>Race the AI.<br/><span>Improve Your Solves.</span></h1>
        <p>Meet your next cubing rival. Choose your level, train against a realistic AI speedcuber, and push your personal best — one scramble at a time.</p>
        <div className="hero-actions"><button className="btn btn-primary btn-lg" onClick={()=>goTo('race')}><Flag size={18}/> Set Up a Race <ArrowRight size={17}/></button><button className="btn btn-outline btn-lg" onClick={()=>goTo('solo')}><Timer size={18}/> Solo Timer</button><button className="btn btn-outline btn-lg" onClick={()=>goTo('practice')}><Ghost size={18}/> Race Your Ghost</button></div>
        <div className="hero-trust"><span className="hero-trust-dot"/> Designed for speedcubers, by speedcubing enthusiasts</div>
      </div>
      <div className="hero-cube"><div className="cube-backdrop"/><CubeArt/><div className="floating-note note-top"><Zap size={16}/> Level up your speed</div><div className="floating-note note-bottom"><span className="purple-dot"/> YOUR CUBE. YOUR PACE.</div></div>
    </section>
    <div className="section-row ch-home-section-head"><div><span className="ch-home-section-kicker"><Sparkles size={13}/> BUILT FOR BETTER SOLVES</span><h2>Everything you need to <span>level up.</span></h2><p>One training hub. Every way to improve your speed.</p></div><LabelBadge subtle>BUILT FOR THE CUBING COMMUNITY</LabelBadge></div>
    <div className="feature-grid ch-home-feature-grid">
      <InfoCard number="01" icon={BrainCircuit} category="RACE THE AI" title="Human-like AI Rivals" description="Take on opponents at your own pace, from casual cubers to elite speedsters." action="Choose a rival" onClick={()=>goTo('race')}/>
      <InfoCard number="02" icon={Gauge} category="FIND YOUR PACE" title="Choose Your Level" description="Pick from Sub-6 through Sub-60 and make every race a new challenge." action="Set your level" tone="blue" onClick={()=>goTo('race')}/>
      <InfoCard number="03" icon={Shuffle} category="FAIR PLAY" title="Shared Scrambles" description="You and your AI rivals face the exact same 3×3 scramble." action="Enter the arena" tone="green" onClick={()=>goTo('race')}/>
      <InfoCard number="04" icon={ChartNoAxesCombined} category="YOUR PERSONAL BEST" title="Track Your Progress" description="Watch your times, averages, and milestones turn into real progress." action="View your stats" tone="pink" onClick={()=>goTo('statistics')}/>
    </div>
    <section className="journey-home-banner ch-home-journey" aria-label="Your Hero Journey progress">
      <div className="ch-home-journey-emblem" aria-hidden="true"><span className="ch-home-emblem-ring"/><Award size={50} strokeWidth={1.5}/><span className="ch-home-emblem-spark ch-home-emblem-spark-one"/><span className="ch-home-emblem-spark ch-home-emblem-spark-two"/></div>
      <div className="ch-home-journey-copy">
        <div className="ch-home-journey-kicker"><Sparkles size={14}/> YOUR HERO JOURNEY <span className="ch-home-journey-level">LEVEL {progress.level}</span></div>
        <h3>Level {progress.level} <span>· {progress.title}</span></h3>
        <p>Keep the momentum. Earn XP with every race, lesson, and challenge on your way to Cube Master.</p>
        <div className="ch-home-xp-details"><span>PROGRESS TO LEVEL {Math.min(100,progress.level+1)}</span><strong>{progress.into.toLocaleString()} <span>/ {progress.next.toLocaleString()} XP</span></strong></div>
        <div className="ch-home-xp-track" role="progressbar" aria-label="XP toward your next level" aria-valuemin={0} aria-valuemax={progress.next} aria-valuenow={progress.into}><span style={{width:`${progress.progress}%`}}/></div>
      </div>
      <div className="ch-home-journey-cta"><span><Trophy size={14}/> KEEP CLIMBING</span><button type="button" className="btn btn-primary" onClick={()=>goTo('journey')}>Open Hero Journey <ArrowRight size={17}/></button></div>
    </section>
    <Surface className="onboarding-banner ch-home-challenge">
      <div className="ch-home-challenge-emblem" aria-hidden="true"><Flag size={35} strokeWidth={1.7}/></div>
      <div className="ch-home-challenge-copy"><div className="ch-home-challenge-kicker"><span/> THE ARENA IS OPEN</div><h3>Ready to <span>face your next rival?</span></h3><p>One scramble. One opponent. Your chance to beat the clock.</p></div>
      <div className="ch-home-challenge-cta"><span><Zap size={14}/> YOUR NEXT CHALLENGE AWAITS</span><button type="button" className="btn btn-primary" onClick={()=>goTo('race')}>Start Racing <ArrowRight size={17}/></button></div>
    </Surface>
  </div>
}

function RacePage({settings,update,startRace}:{settings:RaceSettings;update:(v:RaceSettings)=>void;startRace:()=>void}) {
  const [mechanicsOpen,setMechanicsOpen]=useState(()=>!hasSeenMechanics('ai'))
  const closeMechanics=()=>{markMechanicsSeen('ai');setMechanicsOpen(false)}
  // The next AI scramble is solved while the player chooses their opponent.
  useEffect(()=>{aiPrefetch.prewarm()},[])
  const validDifficulty=isDifficulty(settings.difficulty)?settings.difficulty:'15'
  const chosenRival=getRival(validDifficulty)
  const personality=getAiPersonality(settings.personality)
  const change=<K extends keyof RaceSettings>(key:K,v:RaceSettings[K])=>update({...settings,[key]:v})
  return <div className="page-stack narrow-stack">
    <RaceMechanicsModal mode="ai" open={mechanicsOpen} onClose={closeMechanics}/>
    <section className="ch-mode-hero ch-ai-mode-hero" aria-labelledby="ch-ai-hero-title">
      <div className="ch-mode-hero-copy">
        <div className="ch-mode-hero-eyebrow"><span className="ch-mode-hero-spark"><Sparkles size={15}/></span> THE AI RACING ARENA <span className="ch-mode-hero-separator">/</span> RACE MODE</div>
        <h1 id="ch-ai-hero-title">Choose your rivals.<br/><span>Race your limits.</span></h1>
        <p>Pick the speed, personality, and number of AI opponents. Everyone starts with the same scramble — the fastest solve wins.</p>
        <div className="ch-mode-hero-pills"><span><BrainCircuit size={15}/>{getAiCount(settings.aiCount)} AI {getAiCount(settings.aiCount)===1?'rival':'rivals'}</span><span><Gauge size={15}/>Sub-{validDifficulty}</span><span><ShieldCheck size={15}/>Verified CFOP</span></div>
        <div className="ch-mode-hero-actions"><button type="button" className="btn btn-primary ch-mode-hero-button" onClick={()=>document.querySelector('.race-setup')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}><SlidersHorizontal size={17}/> Customize race <ArrowRight size={17}/></button></div>
      </div>
      <div className="ch-ai-hero-art" aria-hidden="true"><div className="ch-ai-hero-orbit"/><img src={aiHeroCore} alt="" className="ch-ai-hero-illustration ch-ai-hero-core" width={1122} height={1402} loading="eager" decoding="async" draggable={false}/><div className="ch-ai-hero-level"><span>YOUR OPPONENTS</span><strong>{getAiCount(settings.aiCount)} <small>AI {getAiCount(settings.aiCount)===1?'rival':'rivals'}</small></strong></div><div className="ch-ai-hero-float"><Zap size={14}/> LET THE RACE BEGIN</div></div>
    </section>
    <section className="ch-mechanics-spotlight" aria-label="Race AI mechanics help">
      <span className="ch-mechanics-spotlight-icon" aria-hidden="true"><CircleHelp size={28}/></span>
      <div className="ch-mechanics-spotlight-copy"><span>RACE AI GUIDE · 5 SIMPLE STEPS</span><h2>New to racing against AI?</h2><p>Learn how scrambles, inspection, the timer, and winning work.</p></div>
      <button type="button" className="ch-mechanics-spotlight-button" onClick={()=>setMechanicsOpen(true)}><CircleHelp size={19}/><span><small>MECHANICS</small>How Race AI Works</span><ArrowRight size={20}/></button>
    </section>
    <SectionHead eyebrow="YOUR RACE SETTINGS" title="Build Your Race" description="Tune the challenge before you enter the arena." right={<LabelBadge><Flag size={13}/> RACE MODE</LabelBadge>}/>
    <Surface className="race-setup">
      <div className="select-grid"><label className="field-group"><span className="field-label"><Layers3 size={17}/> Puzzle</span><div className="select-wrap"><select value={settings.puzzle} onChange={e=>change('puzzle',e.target.value as '333')}><option value="333">3×3×3 — Standard</option></select><ChevronDown size={17}/></div></label>
        <label className="field-group"><span className="field-label"><Flag size={17}/> Race length</span><div className="select-wrap"><select value={settings.raceLength} onChange={e=>change('raceLength',e.target.value as RaceLength)}><option value="single">Single Solve</option><option value="ao5">5-Round Session</option><option value="ao12">12-Round Session</option></select><ChevronDown size={17}/></div></label></div>
      <div className="setup-divider"/>
      <RivalSelect value={validDifficulty} personality={personality} onChange={v=>change('difficulty',v)}/>
      <div className="settings-label personality-heading"><h3>AI Personality <span className="hint-icon" title="Choose how consistently your AI rival solves. Every style works with every Sub level."><CircleHelp size={16}/></span></h3><p>Give your opponent a racing style. Balanced is recommended for regular practice.</p></div>
      <div className="personality-grid" role="group" aria-label="AI opponent personality">{PERSONALITIES.map(({id,label,hint,art})=><button key={id} type="button" className={`personality-option ch-personality-card ch-personality-${id} ${personality===id?'selected':''}`} onClick={()=>change('personality',id)} aria-pressed={personality===id}><span className="ch-personality-portrait" aria-hidden="true"><img src={art} alt="" width="512" height="512" loading="lazy" decoding="async" draggable={false}/></span><span className="personality-copy"><strong>{label}{id==='balanced'&&<em>DEFAULT</em>}</strong><small>{hint}</small></span>{personality===id&&<span className="personality-check"><Check size={14}/></span>}</button>)}</div>
      <section className="multi-ai-picker" aria-label="Number of AI opponents">
        <div className="multi-ai-picker-heading"><div className="multi-ai-icon"><BrainCircuit size={22}/></div><div><span className="multi-ai-eyebrow">RACE LOBBY · NEW</span><h3>How many AIs will race you?</h3><p>Every rival gets the <strong>same scramble</strong>, with their own human-like solve time. All use Sub-{validDifficulty} · {PERSONALITIES.find(x=>x.id===personality)!.label}.</p></div><span className="multi-ai-count"><b>{getAiCount(settings.aiCount)}</b> / {MAX_AI_OPPONENTS} AIs</span></div>
        <div className="multi-ai-choices" role="group" aria-label="Choose between one and ten AI opponents">{Array.from({length:MAX_AI_OPPONENTS},(_,i)=>i+1).map(count=><button key={count} type="button" aria-label={`${count} AI opponent${count===1?'':'s'}`} aria-pressed={getAiCount(settings.aiCount)===count} onClick={()=>change('aiCount',count)} className={`multi-ai-choice ${getAiCount(settings.aiCount)===count?'active':''}`}><span>{count}</span>{getAiCount(settings.aiCount)===count&&<Check size={13}/>}</button>)}</div>
        <div className="multi-ai-picker-foot"><span>{getAiCount(settings.aiCount)===1?'Classic head-to-head race':`${getAiCount(settings.aiCount)+1}-cuber tournament • 1 player + ${getAiCount(settings.aiCount)} AI rivals`}</span><span>Choose 1 for the original race layout</span></div>
      </section>
      <div className="opponent-summary"><div className="opponent-symbol"><BrainCircuit size={20}/></div><div><div className="opponent-title">{chosenRival.name} (Sub-{validDifficulty}) · {PERSONALITIES.find(x=>x.id===personality)!.label} {getAiCount(settings.aiCount)===1?'AI Rival':`${getAiCount(settings.aiCount)} AI Rivals`} <span className="ai-dot"/></div><p>{chosenRival.title} · Typical average <strong>~{formatTime(aiExpectedMeanMs(validDifficulty,personality))}s</strong><span className="personality-summary-description"> · {PERSONALITY_DESCRIPTIONS[personality]}</span></p></div><LabelBadge subtle>SELECTED</LabelBadge></div>
      <div className="setup-divider"/>
      <div className="settings-label"><h3>Race Options</h3><p>Fine-tune how your racing room will look and feel.</p></div>
      <div className="option-grid"><div className="option-card"><div className="option-icon"><Clock3 size={18}/></div><div className="option-info"><strong>15s Inspection</strong><span>Competition-style preparation</span></div><Switch checked={settings.inspection} onChange={v=>change('inspection',v)} label="15 second inspection"/></div>
        <div className="option-card"><div className="option-icon"><Layers3 size={18}/></div><div className="option-info"><strong>Show AI Cube</strong><span>Watch scramble-specific 3D turns</span></div><Switch checked={settings.showCube} onChange={v=>change('showCube',v)} label="Show AI cube"/></div>
        <div className="option-card"><div className="option-icon"><BarChart3 size={18}/></div><div className="option-info"><strong>Solve Breakdown</strong><span>Actual solve move timeline</span></div><Switch checked={settings.breakdown} onChange={v=>change('breakdown',v)} label="Show solve breakdown"/></div></div>
      <div className="setup-divider"/>
      <div className="setup-footnote"><ShieldCheck size={17}/><span>The AI now computes a verified CFOP solution (Cross → 4 F2L pairs → OLL → PLL). Moves are genuine; your rival’s timing and pauses are simulated.</span></div>
      <button className="btn btn-primary btn-lg btn-full" onClick={startRace}><Flag size={18}/> Start Race <ArrowRight size={18}/></button>
    </Surface>
    <div className="small-center-note"><Sparkles size={14}/> Your preferences are saved in this browser.</div>
  </div>
}

function SettingsPage({preferences,update,reset,playerName,onPlayerNameChange}:{preferences:Preferences;update:(p:Preferences)=>void;reset:()=>void;playerName:string;onPlayerNameChange:(name:string)=>void}){
  const [draftName,setDraftName]=useState(playerName)
  const [nameSaved,setNameSaved]=useState(false)
  const [orientationFeedback,setOrientationFeedback]=useState<OrientationLockFeedback|null>(null)
  const [physicalOrientation,setPhysicalOrientation]=useState<'portrait'|'landscape'>(()=>window.matchMedia('(orientation: landscape)').matches?'landscape':'portrait')
  useEffect(()=>{
    const query=window.matchMedia('(orientation: landscape)')
    const updateOrientation=()=>setPhysicalOrientation(query.matches?'landscape':'portrait')
    query.addEventListener?.('change',updateOrientation)
    window.addEventListener('resize',updateOrientation)
    return()=>{query.removeEventListener?.('change',updateOrientation);window.removeEventListener('resize',updateOrientation)}
  },[])
  useEffect(()=>{setDraftName(playerName)},[playerName])
  const saveName=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();if(!isValidPlayerName(draftName))return;onPlayerNameChange(normalizePlayerName(draftName));setNameSaved(true)}
  const change=<K extends keyof Preferences>(key:K,v:Preferences[K])=>{
    const next={...preferences,[key]:v}
    update(next)
    if(key==='sound'||key==='soundVolume'||key==='timerSounds'||key==='cinematicSounds'){
      configureGameAudio({enabled:next.sound,volume:next.soundVolume,timer:next.timerSounds,cinematic:next.cinematicSounds})
      if(next.sound)unlockGameAudio()
    }
  }
  const selectedOrientation=orientationPreference(preferences.orientation)
  const chooseOrientation=(choice:OrientationPreference)=>{
    change('orientation',choice)
    setOrientationFeedback(null)
    // Keep the API call inside the click gesture: installed mobile apps may permit it.
    void requestOrientationPreference(choice).then(setOrientationFeedback)
  }
  return <div className="page-stack narrow-stack"><SectionHead eyebrow="MAKE IT YOURS" title="Settings & Preferences" description="Personalize the Cube Hero interface. Your changes save automatically to this browser."/>
    <Surface className="settings-surface cube-profile-settings"><div className="settings-section-head"><span className="settings-header-icon"><PlayerAvatar decorative/></span><div><h3>Local Player Profile</h3><p>Choose a Hero avatar or upload your own cropped photo. Your name and picture appear across races, VS matchups, and Hero Journey.</p></div></div>
      <AvatarSettings/>
      <form className="cube-profile-edit" onSubmit={saveName}>
        <label htmlFor="cube-settings-name">Your cuber name</label>
        <div className="cube-profile-edit-row"><input id="cube-settings-name" autoComplete="nickname" maxLength={PLAYER_NAME_MAX_LENGTH} value={draftName} onChange={e=>{setDraftName(e.target.value);setNameSaved(false)}} aria-describedby="cube-settings-name-help"/><button type="submit" className="btn btn-primary btn-sm" disabled={!isValidPlayerName(draftName)||normalizePlayerName(draftName)===playerName}><Check size={16}/> Save name</button></div>
        <small id="cube-settings-name-help" role="status">{nameSaved?'Name saved on this device.':`2–${PLAYER_NAME_MAX_LENGTH} characters. Your saved races and XP are not affected.`}</small>
      </form>
    </Surface>
    <Surface className="settings-surface"><div className="settings-section-head"><span className="settings-header-icon"><SlidersHorizontal size={20}/></span><div><h3>Experience</h3><p>Adjust how your arena behaves.</p></div></div>
      <div className="settings-row"><div><strong>Interface animations</strong><p>Reduce decorative movement for accessibility.</p></div><Switch checked={preferences.reducedMotion} onChange={v=>change('reducedMotion',v)} label="Reduce animations"/></div>
      <div className="settings-row"><div><strong>Compact layout</strong><p>Fit more cards into the available screen space.</p></div><Switch checked={preferences.compact} onChange={v=>change('compact',v)} label="Compact layout"/></div>
      <div className="settings-row"><div><strong>Game sound effects</strong><p>Sounds for inspection, racing, and personal bests. VS intros stay silent.</p></div><Switch checked={preferences.sound} onChange={v=>change('sound',v)} label="Enable game sound effects"/></div>
      <div className="ch-audio-settings" aria-label="Game sound configuration">
        <div className="ch-audio-volume-control">
          <div className="ch-audio-volume-row"><label htmlFor="cube-audio-volume"><Volume2 size={17} aria-hidden="true"/> <span>Sound volume</span></label><output htmlFor="cube-audio-volume">{preferences.soundVolume}%</output></div>
          <input className="ch-audio-volume-slider" id="cube-audio-volume" type="range" min="0" max="100" step="5" value={preferences.soundVolume} disabled={!preferences.sound} onChange={event=>change('soundVolume',Number(event.target.value))} aria-label="Game sound volume" aria-valuetext={`${preferences.soundVolume} percent`}/>
          <div className="ch-audio-volume-ends" aria-hidden="true"><span>Quiet</span><span>Loud</span></div>
        </div>
        <div className="ch-audio-control-row"><div><strong>Timer and inspection sounds</strong><p>Hold ready, start, stop, and countdown beeps.</p></div><Switch checked={preferences.timerSounds} onChange={v=>change('timerSounds',v)} label="Timer and inspection sound effects"/></div>
        <button type="button" className="btn btn-outline btn-sm ch-audio-test" disabled={!preferences.sound||!preferences.soundVolume} onClick={()=>{unlockGameAudio();playGameSound('preview')}}><Volume2 size={16}/> Test sound</button>
        <p className="ch-audio-hint">Sounds are generated on your device—no downloads or accounts. Mobile browsers play sound after the first interaction.</p>
      </div>
    </Surface>
    <Surface className="settings-surface ch-orientation-settings" aria-label="Mobile orientation preferences">
      <div className="settings-section-head"><span className="settings-header-icon"><TabletSmartphone size={20}/></span><div><h3>Mobile Orientation</h3><p>Choose how CubeHero fits your phone or installed mobile app.</p></div></div>
      <div className="ch-orientation-grid" role="group" aria-label="Preferred mobile app orientation">
        {([
          {id:'auto',label:'Auto rotate',detail:'Follow the device',icon:RefreshCw},
          {id:'portrait',label:'Portrait',detail:'Vertical practice',icon:Smartphone},
          {id:'landscape',label:'Landscape',detail:'Wider race arena',icon:TabletSmartphone},
        ] as const).map(({id,label,detail,icon:Icon})=><button type="button" key={id} className={`ch-orientation-option${selectedOrientation===id?' selected':''}`} onClick={()=>chooseOrientation(id)} aria-pressed={selectedOrientation===id}><Icon size={22} aria-hidden="true"/><span><strong>{label}</strong><small>{detail}</small></span>{selectedOrientation===id&&<Check size={15} className="ch-orientation-check" aria-hidden="true"/>}</button>)}
      </div>
      <div className="ch-orientation-status" role="status">
        <RotateCw size={16} aria-hidden="true"/>
        <span>{selectedOrientation==='auto'?'Auto follows your phone as it turns.':selectedOrientation===physicalOrientation?`Your screen is currently ${physicalOrientation}. The compact ${physicalOrientation} layout is active on mobile.`:orientationFeedback==='locked'?'Orientation request accepted. Your screen should rotate.':`Turn your phone ${selectedOrientation==='landscape'?'sideways':'upright'} to use ${selectedOrientation} mode.`} {selectedOrientation!=='auto'&&orientationFeedback==='manual'?'Automatic rotation is restricted in this browser; installed apps may support it.':''}</span>
        {selectedOrientation!=='auto'&&orientationFeedback==='manual'&&canRequestOrientationLock()&&<button type="button" className="ch-orientation-retry" onClick={()=>{void requestOrientationPreference(selectedOrientation).then(setOrientationFeedback)}}>Try lock</button>}
      </div>
      <p className="ch-orientation-note">Your preference is saved locally. Some browsers—especially iPhone Safari—cannot force screen rotation. Landscape mode uses a compact, touch-friendly layout when your device is horizontal.</p>
    </Surface>
    <Surface className="settings-surface"><div className="settings-section-head"><span className="settings-header-icon"><Timer size={20}/></span><div><h3>Timer Preferences</h3><p>Choose how precisely race times are displayed.</p></div></div><div className="settings-row"><div><strong>Timer precision</strong><p>Number of decimal places displayed.</p></div><div className="select-wrap setting-select"><select value={preferences.precision} onChange={e=>change('precision',e.target.value as Preferences['precision'])}><option value="2">2 decimals</option><option value="3">3 decimals</option></select><ChevronDown size={16}/></div></div></Surface>
    <Surface className="settings-surface"><div className="settings-section-head"><span className="settings-header-icon"><ShieldCheck size={20}/></span><div><h3>Local Data</h3><p>No account is necessary for this prototype.</p></div></div><div className="settings-row"><div><strong>Reset interface preferences</strong><p>Return experience, timer, and race preferences to their defaults.</p></div><button className="btn btn-outline btn-sm" onClick={reset}><RotateCcw size={16}/> Reset</button></div></Surface>
    <div className="small-center-note"><LockKeyhole size={15}/> Settings are stored in this browser only. No personal data is uploaded.</div>
  </div>
}

export default function App(){
  const {name:playerName,setName:setPlayerName}=useLocalPlayer()
  const [page,setPage]=useState<Page>(getCurrentPage)
  const [menuOpen,setMenuOpen]=useState(false)
  // Landscape-only compact desktop rail. Portrait drawers and full desktop navigation are separate.
  const [landscapeRailOpen,setLandscapeRailOpen]=useState(true)
  const [compactLandscape,setCompactLandscape]=useState(()=>window.matchMedia('(orientation: landscape) and (max-height: 620px) and (max-width: 1180px)').matches)
  useEffect(()=>{
    const query=window.matchMedia('(orientation: landscape) and (max-height: 620px) and (max-width: 1180px)')
    const onChange=()=>setCompactLandscape(query.matches)
    query.addEventListener('change',onChange)
    onChange()
    return()=>query.removeEventListener('change',onChange)
  },[])
  const landscapeRailCollapsed=compactLandscape&&!landscapeRailOpen
  // Prepared locally; RaceRoom is mounted only after the VS intro finishes.
  const [vsPendingSession,setVsPendingSession]=useState<RaceSession|null>(null)
  const [journey,setJourney]=useState<JourneyState>(loadJourney)
  const [journeyTab,setJourneyTab]=useState<JourneyTab>('overview')
  const [raceSettings,setRaceSettings]=useSavedState('cube-hero-race-settings-v1',initialRace)
  const [preferences,setPreferences]=useSavedState('cube-hero-preferences-v1',initialPreferences)
  const [history,setHistory]=useState<RaceRecord[]>(()=>{
    try{const raw=JSON.parse(localStorage.getItem('cube-hero-history-v2')||'[]');return Array.isArray(raw)?raw.filter(isRaceRecord).slice(-2000):[]}
    catch{return []}
  })
  const [session,setSession]=useState<RaceSession|null>(()=>{
    try{const raw=JSON.parse(localStorage.getItem('cube-hero-session-v2')||'null');return raw&&typeof raw.id==='string'&&raw.settings&&Array.isArray(raw.records)?{...raw,settings:{...initialRace,...raw.settings,personality:getAiPersonality(raw.settings.personality),aiCount:getAiCount(raw.settings.aiCount)},records:raw.records.filter(isRaceRecord)}:null}
    catch{return null}
  })
  const [toastMessage,setToastMessage]=useState('')
  // Seed the XP watcher with previously saved activity AND historical events.
  // Existing XP imported on first load must not trigger an old level celebration.
  const [initialLevel] = useState(() => {
    const {ghost,academy}=loadJourneySources()
    return levelInfo(journeyMetrics(syncJourney(journey,history,ghost,academy)).xp).level
  })
  const lastLevelRef=useRef(initialLevel)
  const [levelUp,setLevelUp]=useState<LevelUpMilestone|null>(null)
  const activeRaceRef=useRef(false)
  const trackRaceActive=useCallback((value:boolean)=>{activeRaceRef.current=value},[])
  useEffect(()=>{try{localStorage.setItem('cube-hero-history-v2',JSON.stringify(history.slice(-2000)))}catch{/* storage unavailable */}},[history])
  useEffect(()=>{try{localStorage.setItem(JOURNEY_STORAGE_KEY,JSON.stringify(journey))}catch{/* local-only optional */}},[journey])
  // Import stable, unique activity IDs when records or learning progress change.
  // Do not resync the whole Hero Journey just because a navigation button was
  // tapped: Academy and Ghost Race already dispatch JOURNEY_UPDATED_EVENT
  // after saving their progress. This avoids synchronous work on every route.
  useEffect(()=>{
    const sync=()=>{const {ghost,academy}=loadJourneySources();setJourney(prev=>syncJourney(prev,history,ghost,academy))}
    sync()
    window.addEventListener(JOURNEY_UPDATED_EVENT,sync)
    const onStorage=(event:StorageEvent)=>{if([GHOST_STORAGE_KEY,ACADEMY_STORAGE_KEY,JOURNEY_STORAGE_KEY].includes(event.key??''))sync()}
    window.addEventListener('storage',onStorage)
    return()=>{window.removeEventListener(JOURNEY_UPDATED_EVENT,sync);window.removeEventListener('storage',onStorage)}
  },[history])

  // XP may come from completed AI races, Ghost Race, Academy or tournament rewards.
  // Watch the real persisted Hero Journey level, never page visits or button presses.
  useEffect(()=>{
    const milestone=earnedLevel(lastLevelRef.current,journeyMetrics(journey).xp)
    if(milestone){
      setLevelUp(milestone)
      lastLevelRef.current=milestone.level
    }
  },[journey])
  useEffect(()=>{try{if(session)localStorage.setItem('cube-hero-session-v2',JSON.stringify(session));else localStorage.removeItem('cube-hero-session-v2')}catch{/* storage unavailable */}},[session])
  useEffect(()=>{const handleHash=()=>{setVsPendingSession(null);setPage(getCurrentPage());setMenuOpen(false)};window.addEventListener('hashchange',handleHash);return()=>window.removeEventListener('hashchange',handleHash)},[])
  useEffect(()=>{if(page==='journey')aiPrefetch.prewarm()},[page])
  useEffect(()=>{document.documentElement.classList.toggle('reduce-motion',preferences.reducedMotion);document.documentElement.classList.toggle('compact-mode',preferences.compact);return()=>{document.documentElement.classList.remove('reduce-motion','compact-mode')}},[preferences.reducedMotion,preferences.compact])
  useEffect(()=>{
    configureGameAudio({enabled:preferences.sound,volume:preferences.soundVolume,cinematic:preferences.cinematicSounds,timer:preferences.timerSounds})
  },[preferences.sound,preferences.soundVolume,preferences.cinematicSounds,preferences.timerSounds])
  useEffect(()=>{
    // Unlock using actual user gestures so iOS/Android can play the later race cues.
    const activate=()=>unlockGameAudio()
    const keyboard=(event:KeyboardEvent)=>{if(event.code==='Space'||event.code==='Enter')activate()}
    document.addEventListener('pointerdown',activate,{capture:true})
    document.addEventListener('keydown',keyboard,{capture:true})
    return()=>{document.removeEventListener('pointerdown',activate,true);document.removeEventListener('keydown',keyboard,true)}
  },[])
  useEffect(()=>{if(!toastMessage)return;const id=window.setTimeout(()=>setToastMessage(''),3000);return()=>window.clearTimeout(id)},[toastMessage])
  useEffect(()=>{
    if(!menuOpen)return
    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenuOpen(false)}
    window.addEventListener('keydown',onKeyDown)
    return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',onKeyDown)}
  },[menuOpen])
  const goTo=(to:Page)=>{if(((page==='room'&&to!=='room'&&to!=='results')||(page==='practice'&&to!=='practice')||(page==='solo'&&to!=='solo'))&&activeRaceRef.current){if(!window.confirm('Leave the running race? This unfinished round will not be saved.'))return;activeRaceRef.current=false}setVsPendingSession(null);setPage(to);setMenuOpen(false);window.location.hash=`/${to}`;window.scrollTo({top:0,behavior:'instant'})}
  const startRace=()=>{
    if(vsPendingSession)return
    unlockGameAudio()
    const prepared:RaceSession={id:newId(),settings:{...raceSettings,aiCount:getAiCount(raceSettings.aiCount),difficulty:isDifficulty(raceSettings.difficulty)?raceSettings.difficulty:'15'},records:[]}
    // No session is saved, no CFOP work starts, and no inspection timer runs during VS.
    setVsPendingSession(prepared)
  }
  const enterVsRace=()=>{
    if(!vsPendingSession)return
    const prepared=vsPendingSession
    setVsPendingSession(null)
    setSession(prepared)
    goTo('room')
  }
  const completeRound=(record:RaceRecord)=>{
    setSession(prev=>prev&&prev.id===record.sessionId&&!prev.records.some(x=>x.id===record.id)?{...prev,records:[...prev.records,record]}:prev)
    setHistory(prev=>prev.some(x=>x.id===record.id)?prev:[...prev,record].slice(-2000))
    setJourney(prev=>recordTournamentRound(prev,record))
    goTo('results')
  }
  const nextRound=()=>{
    if(session&&session.records.length<RACE_COUNT[session.settings.raceLength])goTo('room')
    else if(session&&journey.tournaments.some(t=>t.sessionId===session.id&&t.status==='finished')){setJourneyTab('tournaments');goTo('journey')}
    else goTo('race')
  }
  const startTournament=(selection:{difficulty:Difficulty;personality:AiPersonality;aiCount:number})=>{
    unlockGameAudio()
    const active=activeTournament(journey)
    if(active&&!window.confirm('Start a new tournament? Your unfinished championship will be marked as abandoned.'))return
    const raceSession:RaceSession={id:newId(),settings:{...raceSettings,difficulty:selection.difficulty,personality:selection.personality,aiCount:getAiCount(selection.aiCount),raceLength:'ao5',inspection:true,showCube:true,puzzle:'333'},records:[]}
    const event:TournamentSeries={id:newId(),sessionId:raceSession.id,createdAt:new Date().toISOString(),status:'active',difficulty:selection.difficulty,personality:selection.personality,aiCount:raceSession.settings.aiCount,roundsTarget:5,records:[]}
    setJourney(prev=>startJourneyTournament(prev,event))
    setSession(raceSession)
    setJourneyTab('tournaments')
    goTo('room')
  }
  const resumeTournament=(event:TournamentSeries)=>{
    if(event.status!=='active')return
    setSession(previous=>previous?.id===event.sessionId?previous:{id:event.sessionId,settings:{...raceSettings,difficulty:event.difficulty,personality:event.personality,aiCount:event.aiCount,raceLength:'ao5',inspection:true,showCube:true},records:[...event.records]})
    goTo('room')
  }
  const reset=()=>{void requestOrientationPreference('auto');setPreferences(initialPreferences);setRaceSettings(initialRace);setToastMessage('Your interface preferences have been reset.')}
  const clearHistory=()=>{if(window.confirm('Delete ALL locally saved race history? This cannot be undone.')){setHistory([]);setSession(null);setToastMessage('Race history cleared from this browser.')}}
  const dismissLevelUp=useCallback(()=>setLevelUp(null),[])
  const precision=Number(preferences.precision) as 2|3
  const currentTournament=journey.tournaments.find(t=>t.sessionId===session?.id)
  const tournamentLeaders=currentTournament?tournamentStandings(currentTournament):[]
  const tournamentPlayer=tournamentLeaders.find(row=>row.id==='YOU')
  return <div className={`app-shell${landscapeRailCollapsed?' landscape-nav-collapsed':''}`}>
    {menuOpen&&<button className="mobile-overlay" aria-label="Close navigation" onClick={()=>setMenuOpen(false)}/>}
    <aside id="site-sidebar" className={`sidebar ${menuOpen?'open':''}`} aria-label="Cube Hero sidebar" aria-hidden={landscapeRailCollapsed} inert={landscapeRailCollapsed}>
      <div className="sidebar-brand-row"><button className="brand-link" onClick={()=>goTo('home')}><Logo/></button><button className="sidebar-close" aria-label="Close navigation menu" onClick={()=>setMenuOpen(false)}><X size={21}/></button></div>
      <div className="sidebar-label">YOUR ARENA</div>
      <nav className="main-nav" aria-label="Main navigation">{NAV.map(({page:p,label,icon:Icon})=><button key={p} className={`nav-item ${page===p||(p==='race'&&['room','results'].includes(page))?'active':''}`} onClick={()=>goTo(p)}><Icon size={20} strokeWidth={1.8}/><span>{label}</span>{p==='race'&&<span className="nav-flare"/>}</button>)}</nav>
      <div className="sidebar-bottom"><button className={`nav-item settings-nav ${page==='settings'?'active':''}`} onClick={()=>goTo('settings')}><Settings2 size={20}/><span>Settings</span></button><div className="guest-profile"><PlayerAvatar className="guest-avatar"/><div><strong title={playerName}>{playerName}</strong><small>Welcome to Cube Hero</small></div><span className="online-dot"/></div></div>
    </aside>
    <div className="main-wrap"><header className="topbar"><div className="topbar-left"><button type="button" className="landscape-nav-toggle" aria-label={landscapeRailOpen?'Collapse landscape navigation':'Expand landscape navigation'} title={landscapeRailOpen?'Collapse sidebar':'Expand sidebar'} aria-controls="site-sidebar" aria-expanded={!landscapeRailCollapsed} onClick={()=>setLandscapeRailOpen(open=>!open)}>{landscapeRailOpen?<PanelLeftClose size={17} aria-hidden="true"/>:<PanelLeftOpen size={17} aria-hidden="true"/>}<span>{landscapeRailOpen?'Hide menu':'Show menu'}</span></button><button className="mobile-menu" aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls="site-sidebar" onClick={()=>setMenuOpen(true)}><Menu size={23}/></button><div className="topbar-page"><span>Cube Hero</span><ChevronRight size={14}/><strong>{PATH_LABELS[page]}</strong></div></div><div className="topbar-right"><div className="build-status"><span/> LOCAL RACING <small>· HERO JOURNEY</small></div><span className="topbar-rule"/><span className="cube-topbar-player" title={`Playing as ${playerName}`}><span>{playerName}</span><PlayerAvatar className="topbar-avatar"/></span></div></header>
      <main className="main-content" id="main-content">{page==='home'&&<HomePage goTo={goTo} journey={journey}/>} {page==='race'&&<RacePage settings={raceSettings} update={setRaceSettings} startRace={startRace}/>} {page==='room'&&(session?<RaceRoom key={`${session.id}:${session.records.length}`} session={session} goTo={goTo} onActiveChange={trackRaceActive} onComplete={completeRound} toast={setToastMessage} precision={precision} sound={preferences.sound} reducedMotion={preferences.reducedMotion}/>:<RacePage settings={raceSettings} update={setRaceSettings} startRace={startRace}/>)} {page==='results'&&<>
        {currentTournament&&<section className="journey-results-summary"><div><span className="journey-eyebrow"><Trophy size={15}/> HERO JOURNEY · CHAMPIONSHIP</span><h3>Round {currentTournament.records.length} / 5 · You are #{tournamentPlayer?.place??'—'}</h3><p>{tournamentPlayer?.points??0} points · {currentTournament.records.length===5?'Championship complete!':'Your next race uses a new scramble.'}</p></div><button className="btn btn-primary btn-sm" onClick={()=>{setJourneyTab('tournaments');goTo('journey')}}><Award size={16}/> View standings <ArrowRight size={16}/></button></section>}
        <RaceResults playerName={playerName} session={session} goTo={goTo} nextRound={nextRound} raceAgain={startRace} precision={precision}/></>} {page==='practice'&&<GhostRace precision={precision} sound={preferences.sound} reducedMotion={preferences.reducedMotion} onActiveChange={trackRaceActive}/>} {page==='solo'&&<SoloTimer precision={precision} reducedMotion={preferences.reducedMotion} onActiveChange={trackRaceActive} onRaceClick={()=>goTo('race')}/>} {page==='statistics'&&<RaceStatistics history={history} goTo={goTo} clearHistory={clearHistory} precision={precision}/>} {page==='learn'&&<Academy reducedMotion={preferences.reducedMotion} goToRace={()=>goTo('race')}/>} {page==='journey'&&<HeroJourney playerName={playerName} state={journey} tab={journeyTab} onTabChange={setJourneyTab} initialDifficulty={raceSettings.difficulty} initialPersonality={raceSettings.personality} onStartTournament={startTournament} onResumeTournament={resumeTournament} onGo={goTo} precision={precision}/>} {page==='settings'&&<SettingsPage preferences={preferences} update={setPreferences} reset={reset} playerName={playerName} onPlayerNameChange={value=>{if(setPlayerName(value))setToastMessage(`Player name updated to ${normalizePlayerName(value)}.`)}}/>}</main>
      <footer className="app-footer"><span>© 2026 Cube Hero. Built for the love of cubing. <a href="/" className="app-site-link">Visit website ↗</a></span><span>Challenge the AI. Outrace your Ghost. Break your limits. <span className="footer-spark">✦</span></span></footer></div>
    {/* The HIC-style dock is phone-only; keep the original desktop sidebar and full mobile drawer. */}
    <nav className="cube-mobile-dock" aria-label="Mobile quick navigation">
      {NAV.filter(item=>['home','race','solo','practice','learn'].includes(item.page)).map(({page:p,label,icon:Icon})=>{
        const active=page===p||(p==='race'&&(page==='room'||page==='results'))
        return <button type="button" key={p}
          className={`cube-dock-link${active?' active':''}`} onClick={()=>goTo(p)}
          aria-current={active?'page':undefined}
          aria-label={label==='Ghost Race'?'Ghost Race':label}>
          <Icon size={20} strokeWidth={1.85} aria-hidden="true"/>
          <span>{label==='Ghost Race'?'Ghost':label}</span>
        </button>
      })}
      <button type="button"
        className={`cube-dock-link${menuOpen||page==='statistics'||page==='journey'||page==='settings'?' active':''}`}
        onClick={()=>setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="site-sidebar"
        aria-current={page==='statistics'||page==='journey'||page==='settings'?'page':undefined}
        aria-label="More pages: Statistics, Hero Journey and Settings">
        <Menu size={20} strokeWidth={1.85} aria-hidden="true"/><span>More</span>
      </button>
    </nav>
    {toastMessage&&<div className="toast" role="status"><CheckCircle2 size={17}/>{toastMessage}</div>}
    {levelUp&&<LevelUpCelebration key={levelUp.level} {...levelUp} reducedMotion={preferences.reducedMotion} onContinue={dismissLevelUp}/>}
    {vsPendingSession&&<VsIntro
      playerName={playerName}
      key={vsPendingSession.id}
      settings={vsPendingSession.settings}
      reducedMotion={preferences.reducedMotion}
      onEnterArena={enterVsRace}
      onBack={()=>setVsPendingSession(null)}
    />}
  </div>
}
