import PlayerAvatar from './PlayerAvatar'
import './HeroJourney.css'
import JourneySelect from './JourneySelect'
import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, Award, BarChart3, BookOpen, BrainCircuit, CalendarDays, Check, CheckCircle2, ChevronRight, CircleHelp, Crown, Flame, Flag, Ghost, Gem, GraduationCap, LockKeyhole, Medal, Rocket, RotateCw, Shield, ShieldCheck, Sparkles, Star, Swords, Target, Timer, Trophy, Users, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ALL_DIFFICULTIES, formatTime } from '../lib/racing'
import type { Difficulty, AiPersonality } from '../lib/racing'
import { achievements, activeTournament, journeyMetrics, levelInfo, makeMissions, RANKS, streakInfo, tournamentStandings } from '../lib/heroJourney'
import type { JourneyState, TournamentSeries, MissionCategory, AchievementCategory } from '../lib/heroJourney'

export type JourneyTab = 'overview'|'achievements'|'challenges'|'tournaments'
type Props = {
  state: JourneyState
  tab: JourneyTab
  onTabChange:(value:JourneyTab)=>void
  initialDifficulty:Difficulty
  initialPersonality:AiPersonality
  onStartTournament:(settings:{difficulty:Difficulty;personality:AiPersonality;aiCount:number})=>void
  onResumeTournament:(tournament:TournamentSeries)=>void
  onGo:(page:'race'|'practice'|'learn')=>void
  precision:2|3
  playerName?:string
}
const TABS:{id:JourneyTab;label:string;mobileLabel:string;icon:LucideIcon}[]=[
  {id:'overview',label:'Overview',mobileLabel:'Overview',icon:Activity},
  {id:'achievements',label:'Achievements',mobileLabel:'Badges',icon:Award},
  {id:'challenges',label:'Challenges',mobileLabel:'Missions',icon:Target},
  {id:'tournaments',label:'Ranked & Tournaments',mobileLabel:'Ranked',icon:Trophy},
]
const BADGE_ICONS:Record<string,LucideIcon>={
  timer:Timer,trophy:Trophy,zap:Zap,sparkles:Sparkles,rocket:Rocket,ghost:Ghost,medal:Medal,swords:Swords,layers:ShieldCheck,graduation:GraduationCap,book:BookOpen,flag:Flag,crown:Crown,star:Star,flame:Flame,
}
const BADGE_CATEGORIES:{id:AchievementCategory|'all';label:string}[]=[
  {id:'all',label:'All badges'},{id:'solves',label:'Solves'},{id:'speed',label:'Speed'},
  {id:'ai',label:'AI Race'},{id:'ghost',label:'Ghost Race'},{id:'academy',label:'Academy'},
  {id:'practice',label:'Consistency'},{id:'tournament',label:'Tournaments'},
]
const MISSION_ICONS:Record<MissionCategory,LucideIcon>={
  solves:Timer,wins:Trophy,ai:BrainCircuit,ghost:Ghost,speed:Zap,academy:BookOpen,
  tournament:Crown,variety:Sparkles,consistency:Flame,
}
const timeOrDash=(ms:number|null,precision:2|3)=>ms===null?'—':`${formatTime(ms,precision)}s`
const pretty=(value:number)=>new Intl.NumberFormat('en-US').format(value)

function AchievementCard({item}:{item:ReturnType<typeof achievements>[number]}){
  const Icon=BADGE_ICONS[item.icon]??Award
  return <div className={`journey-achievement ${item.unlocked?'unlocked':'locked'}`} title={item.description}>
    <div className="journey-achievement-icon"><Icon size={25}/>{item.unlocked&&<span className="journey-achievement-check"><Check size={11}/></span>}</div>
    <div className="journey-achievement-copy"><strong>{item.title}</strong><p>{item.description}</p><span>{item.unlocked?'UNLOCKED':`${item.progress}/${item.target} progress`}</span>
      {!item.unlocked&&<div className="journey-achievement-progress" role="progressbar" aria-label={`${item.title} progress`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={item.target}><span style={{width:`${100*item.progress/item.target}%`}}/></div>}
    </div>
  </div>
}
function MissionCard({mission}:{mission:ReturnType<typeof makeMissions>[number]}){
  const percent=100*mission.progress/mission.target
  const Icon=mission.completed?CheckCircle2:MISSION_ICONS[mission.category]
  return <div className={`journey-mission ${mission.completed?'done':''} journey-mission-${mission.category}`}>
    <div className="journey-mission-top">
      <span className="journey-mission-icon"><Icon size={19}/></span>
      <div className="journey-mission-copy"><span className="journey-mission-category">{mission.category==='ai'?'AI RACE':mission.category==='ghost'?'GHOST RACE':mission.category.toUpperCase()}</span><strong>{mission.title}</strong><p>{mission.detail}</p></div>
      <span className="journey-mission-reward">+{mission.reward} XP</span>
    </div>
    <div className="journey-progress-track" role="progressbar" aria-label={`${mission.title} progress`} aria-valuenow={mission.progress} aria-valuemin={0} aria-valuemax={mission.target}><span style={{width:`${percent}%`}}/></div>
    <div className="journey-mission-bottom"><span>{mission.completed?'Completed · Reward earned':`${mission.progress} of ${mission.target}`}</span><span>{Math.round(percent)}%</span></div>
  </div>
}
function MissionSummary({missions}:{missions:ReturnType<typeof makeMissions>}){
  const done=missions.filter(m=>m.completed).length
  const earned=missions.filter(m=>m.completed).reduce((sum,m)=>sum+m.reward,0)
  const total=missions.reduce((sum,m)=>sum+m.reward,0)
  return <div className="journey-missions-summary">
    <div className="journey-missions-summary-label"><strong>{done}<span> / {missions.length} completed</span></strong><small>{earned} / {total} bonus XP</small></div>
    <div className="journey-progress-track" role="progressbar" aria-label={`${done} of ${missions.length} missions completed`} aria-valuenow={done} aria-valuemin={0} aria-valuemax={missions.length}><span style={{width:`${100*done/missions.length}%`}}/></div>
  </div>
}
function Leaderboard({tournament,precision,playerName}:{tournament:TournamentSeries;precision:2|3;playerName:string}){
  const standings=tournamentStandings(tournament)
  return <div className="journey-leaderboard">
    <div className="journey-section-title"><div><span className="journey-eyebrow">LIVE CHAMPIONSHIP</span><h3><Trophy size={20}/> Tournament leaderboard</h3><p>Points earned across {tournament.records.length} of {tournament.roundsTarget} rounds. Each round has a fresh shared scramble.</p></div><span className="journey-tag">Sub-{tournament.difficulty}</span></div>
    <div className="journey-board-head"><span>POS</span><span>RACER</span><span>POINTS</span><span>ROUND WINS</span></div>
    {standings.map(row=><div className={`journey-board-row ${row.id==='YOU'?'player':''}`} key={row.id}>
      <span className="journey-position">{row.place===1?<Crown size={18}/>:String(row.place).padStart(2,'0')}</span>
      <span className="journey-board-name">{row.id==='YOU'?<PlayerAvatar className="cube-player-avatar--compact" decorative/>:<BrainCircuit size={17}/>} <strong>{row.id==='YOU'?`YOU · ${playerName}`:row.id}</strong></span>
      <strong>{row.points} <small>PTS</small></strong>
      <span>{row.roundWins} <small>W</small></span>
    </div>)}
    {tournament.status==='finished'&&<div className="journey-leaderboard-result"><Crown size={19}/>{standings[0]?.id==='YOU'?'CHAMPION! You won the tournament.':`Tournament finished — ${standings[0]?.id} won.`} <span>Your points are saved locally.</span></div>}
    <div className="journey-board-footer">Scoring: 1st gets {tournament.aiCount+1} points, 2nd gets {tournament.aiCount}, and so on. A player DNF earns 0 points. Ties in total points use lower combined solve time.</div>
    <div className="journey-board-meta">AI 3D turns follow the verified scramble; AI solve speeds are simulated. Your physical solves aren't independently verified. <span>Player times use your configured precision: {precision} decimals.</span></div>
  </div>
}
export default function HeroJourney({state,tab,onTabChange,initialDifficulty,initialPersonality,onStartTournament,onResumeTournament,onGo,precision,playerName='Guest Cuber'}:Props){
  const metrics=useMemo(()=>journeyMetrics(state),[state])
  const xp=levelInfo(metrics.xp)
  const allBadges=useMemo(()=>achievements(state),[state])
  const completedBadges=allBadges.filter(a=>a.unlocked)
  // Refresh the displayed lineup after midnight even if Hero Journey stays open.
  const [clockNow,setClockNow]=useState(()=>new Date())
  useEffect(()=>{const tick=()=>setClockNow(new Date());const timer=window.setInterval(tick,30_000);window.addEventListener('focus',tick);document.addEventListener('visibilitychange',tick);return()=>{window.clearInterval(timer);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick)}},[])
  const missions=makeMissions(state,clockNow)
  const daily=missions.filter(m=>m.period==='daily')
  const weekly=missions.filter(m=>m.period==='weekly')
  const streak=streakInfo(state,clockNow)
  const active=activeTournament(state)
  const last=state.tournaments.at(-1)
  const [difficulty,setDifficulty]=useState<Difficulty>(initialDifficulty)
  const [personality,setPersonality]=useState<AiPersonality>(initialPersonality)
  const [aiCount,setAiCount]=useState(5)
  const [badgeFilter,setBadgeFilter]=useState<'all'|'unlocked'|'locked'>('all')
  const [badgeCategory,setBadgeCategory]=useState<AchievementCategory|'all'>('all')
  const [missionFilter,setMissionFilter]=useState<'all'|'open'|'done'>('all')
  const filteredMissions=(list:typeof missions)=>list.filter(m=>missionFilter==='all'||(missionFilter==='done'?m.completed:!m.completed))
  const nextDailyReset=new Date(clockNow.getFullYear(),clockNow.getMonth(),clockNow.getDate()+1)
  const nextWeeklyReset=new Date(clockNow.getFullYear(),clockNow.getMonth(),clockNow.getDate()+((8-clockNow.getDay())%7||7))
  const resetLabel=(date:Date)=>date.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})
  const shownBadges=allBadges.filter(a=>(badgeFilter==='all'||(badgeFilter==='unlocked'?a.unlocked:!a.unlocked))&&(badgeCategory==='all'||a.category===badgeCategory))
  const rankIndex=RANKS.findIndex(rank=>rank.name===metrics.rank.name)
  const nextRank=RANKS[rankIndex+1]
  const rankMetric=metrics.avg12===null?'Complete 12 valid solves to unlock performance ranks.':nextRank?`Reach an average under ${(nextRank.minAverage!/1000).toFixed(0)}s over your last 12 valid solves.`:'You have reached the highest personal performance rank.'

  return <div className="page-stack journey-page">
    <section className="journey-hero">
      <div className="journey-hero-copy"><div className="journey-eyebrow"><Sparkles size={15}/> YOUR PERSONAL CUBING ADVENTURE</div>
        <h1>Every solve counts.<br/><em>Become a Cube Hero.</em></h1>
        <p>Win races, master new moves, earn rewards and climb your personal ranks. Your journey is powered by the solves and lessons you actually complete.</p>
        <div className="journey-hero-actions"><button className="btn btn-primary" onClick={()=>onTabChange('challenges')}><Target size={17}/> View challenges <ArrowRight size={16}/></button><button className="btn btn-outline" onClick={()=>onTabChange('tournaments')}><Trophy size={17}/> Enter tournament</button></div>
      </div>
      <div className="journey-hero-emblem" aria-hidden="true"><div className="journey-orbit orbit-one"/><div className="journey-orbit orbit-two"/><div className="journey-crown"><Crown size={66} strokeWidth={1.45}/></div><span>LEVEL {xp.level}</span></div>
    </section>
    <div className="journey-stats-grid">
      <div className="journey-stat-card xp"><span className="journey-stat-label"><Zap size={17}/> PLAYER LEVEL</span><strong>Level {xp.level}</strong><small>{xp.title} · {pretty(metrics.xp)} XP total</small><div className="journey-progress-track"><span style={{width:`${xp.progress}%`}}/></div><div className="journey-stat-foot">{xp.into} / {xp.next} XP to next level</div></div>
      <div className="journey-stat-card rank"><span className="journey-stat-label"><Medal size={17}/> PERFORMANCE RANK</span><strong style={{color:metrics.rank.color}}>{metrics.rank.name}</strong><small>{metrics.avg12===null?'Need 12 valid solves':`Last 12 average · ${timeOrDash(metrics.avg12,precision)}`}</small><div className="journey-stat-foot">{metrics.rank.description}</div></div>
      <div className="journey-stat-card streak"><span className="journey-stat-label"><Flame size={17}/> PRACTICE STREAK</span><strong>{streak.streak} <i>day{streak.streak===1?'':'s'}</i></strong><small>{streak.practicedToday?'You practiced today!':'Practice today to build your streak'}</small><div className="journey-stat-foot">No penalty for missing a day</div></div>
      <div className="journey-stat-card achievements"><span className="journey-stat-label"><Award size={17}/> ACHIEVEMENTS</span><strong>{completedBadges.length} <i>/ {allBadges.length}</i></strong><small>Badges unlocked</small><div className="journey-stat-foot">{metrics.tournaments.length} tournaments finished</div></div>
    </div>
    <div className="journey-tab-bar" role="tablist" aria-label="Hero Journey sections">{TABS.map(({id,label,mobileLabel,icon:Icon})=><button type="button" key={id} role="tab" aria-label={label} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>onTabChange(id)}><Icon size={17} aria-hidden="true"/><span className="journey-tab-label-full">{label}</span><span className="journey-tab-label-mobile" aria-hidden="true">{mobileLabel}</span></button>)}</div>
    {tab==='overview'&&<>
      <div className="journey-columns">
        <section className="journey-surface"><div className="journey-section-title"><div><span className="journey-eyebrow">NEXT MILESTONES</span><h3><Sparkles size={20}/> Keep growing</h3><p>Earn XP and collect badges by improving your cubing.</p></div><button className="journey-link" onClick={()=>onTabChange('achievements')}>All badges <ChevronRight size={16}/></button></div><div className="journey-overview-badges">{allBadges.filter(a=>!a.unlocked).slice(0,3).map(a=><AchievementCard item={a} key={a.id}/>)}</div>{allBadges.every(a=>a.unlocked)&&<p className="journey-empty">Every badge unlocked. You're a Cube Hero legend!</p>}</section>
        <section className="journey-surface"><div className="journey-section-title"><div><span className="journey-eyebrow">TODAY'S MISSIONS</span><h3><Target size={20}/> Daily challenges</h3><p>{daily.filter(m=>m.completed).length} of 10 completed · New set tomorrow.</p></div><button className="journey-link" onClick={()=>onTabChange('challenges')}>See all 10 <ChevronRight size={16}/></button></div><div className="journey-mission-stack">{[...daily.filter(m=>!m.completed),...daily.filter(m=>m.completed)].slice(0,3).map(m=><MissionCard key={m.id} mission={m}/>)}</div></section>
      </div>
      <section className="journey-surface journey-overview-rank"><div className="journey-rank-emblem"><Shield size={38}/></div><div><span className="journey-eyebrow">PERSONAL PERFORMANCE</span><h3>Next rank: {nextRank?.name??'Cube Master'}</h3><p>{rankMetric} Ranks measure recorded speed, not XP or number of clicks.</p></div><button className="btn btn-outline" onClick={()=>onTabChange('tournaments')}>See rankings <ArrowRight size={16}/></button></section>
      <div className="journey-shortcuts"><button onClick={()=>onGo('race')}><Flag size={22}/><strong>Race the AI</strong><span>Earn XP for real rounds</span><ArrowRight size={16}/></button><button onClick={()=>onGo('practice')}><Ghost size={22}/><strong>Ghost Race</strong><span>Beat your personal best</span><ArrowRight size={16}/></button><button onClick={()=>onGo('learn')}><GraduationCap size={22}/><strong>Learn CFOP</strong><span>Unlock lesson and case XP</span><ArrowRight size={16}/></button></div>
    </>}
    {tab==='achievements'&&<section className="journey-surface"><div className="journey-section-title"><div><span className="journey-eyebrow">TROPHY COLLECTION</span><h3><Award size={20}/> Achievements & badges</h3><p>Rewards unlock automatically from your saved solves, lessons, and tournaments.</p></div><span className="journey-tag">{completedBadges.length} / {allBadges.length} UNLOCKED</span></div><div className="journey-filter-bar" role="group" aria-label="Filter achievements">{(['all','unlocked','locked'] as const).map(filter=><button type="button" aria-pressed={badgeFilter===filter} className={badgeFilter===filter?'active':''} key={filter} onClick={()=>setBadgeFilter(filter)}>{filter==='all'?'All badges':filter==='unlocked'?'Unlocked':'Locked'}</button>)}</div>
      <div className="journey-badge-categories" role="group" aria-label="Achievement categories">{BADGE_CATEGORIES.map(category=><button type="button" key={category.id} className={badgeCategory===category.id?'active':''} aria-pressed={badgeCategory===category.id} onClick={()=>setBadgeCategory(category.id)}>{category.label}<span>{category.id==='all'?allBadges.length:allBadges.filter(a=>a.category===category.id).length}</span></button>)}</div>
      <div className="journey-badge-grid">{shownBadges.map(a=><AchievementCard key={a.id} item={a}/>)}</div>
      {shownBadges.length===0&&<div className="journey-badges-empty"><Award size={24}/><strong>No badges in this view</strong><p>Try another category or switch to All badges.</p><button type="button" onClick={()=>{setBadgeFilter('all');setBadgeCategory('all')}}>Show all 30 achievements</button></div>}</section>}
    {tab==='challenges'&&<>
      <section className="journey-challenges-intro">
        <div className="journey-challenge-headline"><span className="journey-eyebrow"><Sparkles size={15}/> YOUR ROTATING MISSION BOARD</span><h2>New goals. Every day. Every week.</h2><p>Complete optional challenges through actual races and Academy practice. The selection stays the same during each period and changes automatically at the next reset.</p></div>
        <div className="journey-challenge-filters" role="group" aria-label="Filter daily and weekly challenges">{(['all','open','done'] as const).map(filter=><button type="button" key={filter} aria-pressed={missionFilter===filter} className={missionFilter===filter?'active':''} onClick={()=>setMissionFilter(filter)}>{filter==='all'?'All 20':filter==='open'?'To do':'Completed'}</button>)}</div>
      </section>
      <div className="journey-columns journey-challenge-columns">
        <section className="journey-surface journey-challenge-panel">
          <div className="journey-section-title"><div><span className="journey-eyebrow"><RotateCw size={13}/> CHANGES EACH DAY</span><h3><CalendarDays size={20}/> Daily challenges <span className="journey-challenge-count">10</span></h3><p>Fresh set at local midnight · Next: {resetLabel(nextDailyReset)}</p></div><span className="journey-tag">+{daily.reduce((v,m)=>v+m.reward,0)} XP POSSIBLE</span></div>
          <MissionSummary missions={daily}/>
          <div className="journey-mission-stack">{filteredMissions(daily).map(m=><MissionCard key={m.id} mission={m}/>)}</div>
          {filteredMissions(daily).length===0&&<div className="journey-challenge-empty"><CheckCircle2 size={21}/>{missionFilter==='open'?'All 10 daily challenges completed!':'No completed daily challenges yet.'}</div>}
        </section>
        <section className="journey-surface journey-challenge-panel">
          <div className="journey-section-title"><div><span className="journey-eyebrow"><RotateCw size={13}/> CHANGES EACH MONDAY</span><h3><Star size={20}/> Weekly challenges <span className="journey-challenge-count">10</span></h3><p>Fresh set Monday at local midnight · Next: {resetLabel(nextWeeklyReset)}</p></div><span className="journey-tag">+{weekly.reduce((v,m)=>v+m.reward,0)} XP POSSIBLE</span></div>
          <MissionSummary missions={weekly}/>
          <div className="journey-mission-stack">{filteredMissions(weekly).map(m=><MissionCard key={m.id} mission={m}/>)}</div>
          {filteredMissions(weekly).length===0&&<div className="journey-challenge-empty"><CheckCircle2 size={21}/>{missionFilter==='open'?'All 10 weekly challenges completed!':'No completed weekly challenges yet.'}</div>}
        </section>
      </div>
    </>}
    {tab==='tournaments'&&<>
      <div className="journey-columns journey-tourney-columns">
        <section className="journey-surface"><div className="journey-section-title"><div><span className="journey-eyebrow">AI CHAMPIONSHIP</span><h3><Trophy size={20}/> Build your tournament</h3><p>Five rounds. Same scramble for everyone in each round; a fresh scramble next round.</p></div><span className="journey-tag">LOCAL · SOLO</span></div>
          <div className="journey-tourney-form">
            <JourneySelect label="AI difficulty" variant="difficulty" value={String(difficulty)} onChange={value=>setDifficulty(value as Difficulty)} options={ALL_DIFFICULTIES.map(value=>({value:String(value),label:`Sub-${value}`,description:`AI difficulty · target under ${value} seconds`}))}/>
            <JourneySelect label="AI racing style" variant="personality" value={personality} onChange={value=>setPersonality(value as AiPersonality)} options={[{value:'casual',label:'Casual',description:'Relaxed pace · more variation and mistakes'},{value:'balanced',label:'Balanced',description:'Natural performance · recommended'},{value:'competitive',label:'Competitive',description:'Steady pressure · fewer slow rounds'}]}/>
            <div><span className="journey-input-label">AI rivals</span><div className="journey-rival-options">{Array.from({length:10},(_,i)=>i+1).map(n=><button className={aiCount===n?'selected':''} type="button" key={n} aria-label={`${n} AI opponent${n===1?'':'s'}`} aria-pressed={aiCount===n} onClick={()=>setAiCount(n)}>{n}</button>)}</div></div>
            <div className="journey-tourney-summary"><div><Users size={18}/> {aiCount+1} racers</div><div><Flag size={18}/> 5 rounds</div><div><ShieldCheck size={18}/> CFOP verified</div></div>
            {active&&<p className="journey-tourney-warning"><CircleHelp size={16}/> Starting a new tournament will abandon your unfinished one. You can resume it below instead.</p>}
            <button className="btn btn-primary journey-launch" onClick={()=>onStartTournament({difficulty,personality,aiCount})}><Flag size={18}/> {active?'Start another tournament':'Start 5-round tournament'} <ArrowRight size={17}/></button>
          </div>
        </section>
        <section className="journey-surface journey-personal-ranks"><div className="journey-section-title"><div><span className="journey-eyebrow">EARNED BY SOLVE TIME</span><h3><Gem size={20}/> Personal ranks</h3><p>Your average across the most recent 12 valid AI and Ghost solves.</p></div></div>
          <div className="journey-rank-list">{RANKS.map((r,i)=><div key={r.name} className={`journey-rank-row ${metrics.rank.name===r.name?'current':''}`}><span style={{color:r.color}}><Shield size={20}/></span><div><strong>{r.name}</strong><small>{r.minAverage===null?'Starting rank':`Under ${(r.minAverage/1000).toFixed(0)}s average`}</small></div>{metrics.rank.name===r.name?<span className="journey-rank-current">CURRENT</span>:i>RANKS.findIndex(x=>x.name===metrics.rank.name)?<LockKeyhole size={16}/>:<CheckCircle2 size={16}/>}</div>)}</div>
          <div className="journey-rank-note"><BarChart3 size={19}/><div><strong>Current 12-solve average</strong><p>{timeOrDash(metrics.avg12,precision)} · {Math.min(metrics.times.length,12)} / 12 valid solves available</p></div></div>
        </section>
      </div>
      {active&&<section className="journey-surface journey-live-tourney"><Leaderboard tournament={active} precision={precision} playerName={playerName}/><button className="btn btn-primary" onClick={()=>onResumeTournament(active)}><Flag size={18}/> Continue Tournament · Round {active.records.length+1} / 5 <ArrowRight size={17}/></button></section>}
      {!active&&last&&<section className="journey-surface journey-live-tourney"><Leaderboard tournament={last} precision={precision} playerName={playerName}/></section>}
      {state.tournaments.length>0&&<section className="journey-surface"><div className="journey-section-title"><div><span className="journey-eyebrow">YOUR JOURNEY</span><h3><Medal size={20}/> Tournament history</h3><p>Completed, unfinished, and abandoned championships.</p></div><span className="journey-tag">{state.tournaments.length} SAVED</span></div><div className="journey-tournament-history">{[...state.tournaments].reverse().slice(0,8).map(t=><div key={t.id}><span>{new Date(t.createdAt).toLocaleDateString()}</span><strong>Sub-{t.difficulty} · {t.aiCount} AI{t.aiCount===1?'':'s'}</strong><span>{t.records.length}/5 rounds</span><b className={t.status}>{t.status==='finished'?tournamentStandings(t)[0]?.id==='YOU'?'CHAMPION':'FINISHED':t.status.toUpperCase()}</b></div>)}</div></section>}
    </>}
    <p className="journey-footer-note"><LockKeyhole size={15}/> All XP, badges, streaks, and personal rankings are stored in this browser. Without a smart cube, solves are self-timed and are not official WCA results.</p>
  </div>
}
