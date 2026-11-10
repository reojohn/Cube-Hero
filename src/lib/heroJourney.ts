import type { RaceRecord, Difficulty, AiPersonality } from './racing'
import { rankedFinishers, isRaceRecord, isDifficulty } from './racing'
import type { GhostData } from './ghost'
import type { AcademyProgress } from './academy'

/** The Journey is local-only and intentionally not a certified competition ranking.
 * A stable event ID grants XP once, even after a re-render or page refresh.
 */
export const JOURNEY_STORAGE_KEY = 'cube-hero-hero-journey-v1'
export const JOURNEY_UPDATED_EVENT = 'cubehero-learning-progress-changed'
export type ActivityKind = 'ai'|'ghost'|'lesson'|'case'|'tournament'|'mission'
export type JourneyEvent = {
  id: string; kind: ActivityKind; date: string; xp: number
  valid?: boolean; win?: boolean; ms?: number; category?: string
}
export type TournamentStatus = 'active' | 'finished' | 'abandoned'
export type TournamentSeries = {
  id: string; sessionId: string; createdAt: string; status: TournamentStatus
  difficulty: Difficulty; personality: AiPersonality; aiCount: number
  roundsTarget: number; records: RaceRecord[]
}
export type JourneyState = { events: JourneyEvent[]; tournaments: TournamentSeries[] }
export type JourneyRank = { name: string; minAverage: number|null; color: string; description: string }
export type TournamentStanding = { id: string; points: number; totalMs: number; roundWins: number; rounds: number; place: number }
export type MissionCategory = 'solves'|'wins'|'ai'|'ghost'|'speed'|'academy'|'tournament'|'variety'|'consistency'
export type Mission = { id: string; title: string; detail: string; target: number; progress: number; reward: number; completed: boolean; period: 'daily'|'weekly'; key: string; category: MissionCategory }
export type AchievementCategory = 'solves'|'speed'|'ai'|'ghost'|'academy'|'practice'|'tournament'
export type Achievement = { id: string; title: string; description: string; icon: string; category: AchievementCategory; unlocked: boolean; progress: number; target: number }

export const RANKS: readonly JourneyRank[] = [
  {name:'Bronze', minAverage:null, color:'#c98c61',description:'Begin your competitive journey'},
  {name:'Silver', minAverage:45000, color:'#bfcee0',description:'Average under 45 seconds'},
  {name:'Gold', minAverage:30000, color:'#efc76e',description:'Average under 30 seconds'},
  {name:'Platinum', minAverage:20000, color:'#76e2e7',description:'Average under 20 seconds'},
  {name:'Cube Master', minAverage:12000, color:'#c49cff',description:'Average under 12 seconds'},
]
export function blankJourney():JourneyState { return {events:[],tournaments:[]} }
function validEvent(value:unknown):value is JourneyEvent {
  if(!value||typeof value!=='object')return false
  const a=value as Partial<JourneyEvent>
  return typeof a.id==='string'&&a.id.length<256 && typeof a.date==='string'&&Number.isFinite(Date.parse(a.date))&&
    typeof a.xp==='number'&&Number.isFinite(a.xp)&&a.xp>=0&&a.xp<=500&&
    ['ai','ghost','lesson','case','tournament','mission'].includes(a.kind??'')
}
function validTournament(value:unknown):value is TournamentSeries {
  if(!value||typeof value!=='object')return false
  const t=value as Partial<TournamentSeries>
  return typeof t.id==='string'&&typeof t.sessionId==='string'&&typeof t.createdAt==='string'&&
    ['active','finished','abandoned'].includes(t.status??'')&&
    isDifficulty(t.difficulty)&&['casual','balanced','competitive'].includes(t.personality??'')&&
    Number.isInteger(t.aiCount)&&t.aiCount!>=1&&t.aiCount!<=10&&t.roundsTarget===5&&Array.isArray(t.records)
}
export function parseJourney(value:unknown):JourneyState {
  if(!value||typeof value!=='object')return blankJourney()
  const data=value as Partial<JourneyState>
  const events=Array.isArray(data.events)?data.events.filter(validEvent).slice(-10000):[]
  const ids=new Set<string>()
  return {
    events:events.filter(e=>{if(ids.has(e.id))return false;ids.add(e.id);return true}),
    tournaments:Array.isArray(data.tournaments)?data.tournaments.filter(validTournament).slice(-40).map(t=>({...t,records:t.records.filter(isRaceRecord).filter(record=>record.sessionId===t.sessionId).slice(0,t.roundsTarget)})):[],
  }
}
export function dayKey(value:Date|string):string {
  const d=typeof value==='string'?new Date(value):value
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
export function weekKey(value:Date|string):string {
  const d=new Date(typeof value==='string'?value:value.getTime())
  d.setHours(12,0,0,0)
  d.setDate(d.getDate()-(d.getDay()+6)%7)
  return dayKey(d)
}
function safeDate(date:string, fallback:string){return Number.isFinite(Date.parse(date))?date:fallback}
function capTime(ms:number|null|undefined):number|undefined{return typeof ms==='number'&&Number.isFinite(ms)&&ms>0?ms:undefined}
function caseCategory(id:string){return id.startsWith('cross-')?'cross':id.startsWith('f2l-')?'f2l':id.startsWith('oll-')?'oll':id.startsWith('pll-')?'pll':'other'}

/** Import already-recorded activity; never infer achievements from unsolved races. */
export function syncJourney(state:JourneyState, history:RaceRecord[], ghost:GhostData, academy:AcademyProgress, now=new Date()):JourneyState {
  const seen=new Set(state.events.map(e=>e.id))
  const next=[...state.events]
  const fallback=now.toISOString()
  const add=(event:JourneyEvent)=>{if(!seen.has(event.id)){next.push(event);seen.add(event.id)}}
  for(const r of history){
    if(typeof r.id!=='string')continue
    const valid=r.officialMs!==null&&capTime(r.officialMs)!==undefined
    add({id:`ai:${r.id}`,kind:'ai',date:safeDate(r.date,fallback),xp:valid?(r.win?35:22):0,valid,win:valid&&r.win,ms:valid?r.officialMs!:undefined})
  }
  for(const g of [...ghost.qualifications,...ghost.duels]){
    const valid=g.officialMs!==null&&capTime(g.officialMs)!==undefined
    const win=valid&&g.mode==='ghost'&&g.opponentMs!==null&&g.officialMs!<g.opponentMs
    add({id:`ghost:${g.id}`,kind:'ghost',date:safeDate(g.date,fallback),xp:valid?(g.mode==='qualifying'?20:win?40:24):0,valid,win,ms:valid?g.officialMs!:undefined,category:g.mode})
  }
  for(const lesson of academy.completed){add({id:`lesson:${lesson}`,kind:'lesson',date:fallback,xp:65,category:lesson})}
  for(const id of academy.masteredCases){add({id:`case:${id}`,kind:'case',date:fallback,xp:10,category:caseCategory(id)})}
  for(const tournament of state.tournaments.filter(t=>t.status==='finished'&&t.records.length>=t.roundsTarget)){
    const ranks=tournamentStandings(tournament)
    const champion=ranks[0]?.id==='YOU'
    const completionDate=tournament.records.at(-1)?.date??tournament.createdAt
    add({id:`tournament:${tournament.id}`,kind:'tournament',date:safeDate(completionDate,fallback),xp:champion?250:130,valid:true,win:champion})
  }
  // Periodic mission awards require genuine dated activity from the matching period.
  const pending:JourneyState={events:next,tournaments:state.tournaments}
  for(const mission of makeMissions(pending,now)){
    if(mission.completed)add({id:`mission:${mission.key}:${mission.id}`,kind:'mission',date:fallback,xp:mission.reward})
  }
  return next.length===state.events.length?state:{...state,events:next}
}
export function startTournament(state:JourneyState,tournament:TournamentSeries):JourneyState {
  const before=state.tournaments.map(t=>t.status==='active'?{...t,status:'abandoned' as const}:t)
  return {...state,tournaments:[...before,tournament].slice(-40)}
}
export function recordTournamentRound(state:JourneyState, record:RaceRecord):JourneyState {
  let changed=false
  const tournaments=state.tournaments.map(t=>{
    if(t.status!=='active'||t.sessionId!==record.sessionId||t.records.some(r=>r.id===record.id))return t
    const records=[...t.records,record].slice(0,t.roundsTarget)
    changed=true
    return {...t,records,status:records.length>=t.roundsTarget?'finished' as const:'active' as const}
  })
  return changed?{...state,tournaments}:state
}
export function activeTournament(state:JourneyState):TournamentSeries|undefined {
  return [...state.tournaments].reverse().find(t=>t.status==='active')
}
export function tournamentStandings(t:TournamentSeries):TournamentStanding[] {
  const table=new Map<string,Omit<TournamentStanding,'place'>>()
  for(const id of ['YOU',...Array.from({length:t.aiCount},(_,i)=>`AI ${i+1}`)])table.set(id,{id,points:0,totalMs:0,roundWins:0,rounds:0})
  for(const record of t.records){
    const opponents=record.aiOpponents?.length?record.aiOpponents:[{id:'AI 1',ms:record.aiMs}]
    const finishers=rankedFinishers(record.officialMs,opponents)
    for(const result of finishers){
      const row=table.get(result.id)
      if(!row)continue
      row.rounds++
      if(result.ms===null){row.totalMs+=1e9;continue}
      row.points+=Math.max(0,t.aiCount+2-result.place)
      row.totalMs+=result.ms
      if(result.place===1)row.roundWins++
    }
  }
  return [...table.values()].sort((a,b)=>b.points-a.points||a.totalMs-b.totalMs||a.id.localeCompare(b.id)).map((row,i)=>({...row,place:i+1}))
}
export function levelInfo(xp:number){
  let level=1,used=0,required=200
  while(level<100&&xp>=used+required){used+=required;level++;required=200+(level-1)*55}
  const title=level>=25?'Legend':level>=15?'Expert Cuber':level>=10?'Speedster':level>=5?'Developing Cuber':'Rookie'
  return {level,title,xp,into:xp-used,next:required,progress:Math.min(100,100*(xp-used)/required)}
}
export function journeyMetrics(state:JourneyState){
  const activities=state.events.filter(e=>e.kind!=='mission')
  const ai=activities.filter(e=>e.kind==='ai')
  const ghosts=activities.filter(e=>e.kind==='ghost')
  const lessons=activities.filter(e=>e.kind==='lesson')
  const cases=activities.filter(e=>e.kind==='case')
  const tournaments=activities.filter(e=>e.kind==='tournament')
  const times=activities.filter(e=>(e.kind==='ai'||e.kind==='ghost')&&e.valid&&capTime(e.ms)!==undefined).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date))
  const last=times.slice(-12)
  const avg12=last.length===12?Math.round(last.reduce((sum,x)=>sum+x.ms!,0)/12):null
  let rank=RANKS[0]
  if(avg12!==null){for(const candidate of RANKS){if(candidate.minAverage!==null&&avg12<candidate.minAverage)rank=candidate}}
  return {ai,ghosts,lessons,cases,tournaments,times,avg12,rank,xp:state.events.reduce((sum,e)=>sum+e.xp,0)}
}
export function streakInfo(state:JourneyState,now=new Date()){
  const days=new Set(state.events.filter(e=>e.kind==='lesson'||e.kind==='case'||e.kind==='tournament'||((e.kind==='ai'||e.kind==='ghost')&&e.valid)).map(e=>dayKey(e.date)))
  const today=new Date(now),yesterday=new Date(now)
  yesterday.setDate(yesterday.getDate()-1)
  let cursor=days.has(dayKey(today))?today:yesterday
  let streak=0
  while(days.has(dayKey(cursor))&&streak<36500){streak++;cursor=new Date(cursor);cursor.setDate(cursor.getDate()-1)}
  return {streak,practicedToday:days.has(dayKey(today)),days}
}
/** Rotating challenges have 10 independent slots per period, each with four options.
 * Even/odd days (and even/odd weeks) use disjoint options, so a consecutive
 * period never repeats a mission. A stable hash chooses between two options in
 * each slot; refreshing the page or earning XP cannot change the day's lineup.
 * Mission progress counts ONLY saved genuine activity from that local period.
 */
type MissionMetric = 'valid'|'ai-solves'|'ghost-solves'|'wins'|'ai-wins'|'ghost-wins'|
  'speed'|'speed-ai'|'cases'|'cross-cases'|'f2l-cases'|'oll-cases'|'pll-cases'|
  'lessons'|'tournaments'|'tournament-wins'|'variety'|'practice-days'
type MissionTemplate = {
  id: string; title: string; detail: string; target: number; reward: number
  metric: MissionMetric; category: MissionCategory; underMs?: number
}
const goal=(id:string,title:string,detail:string,target:number,reward:number,
  metric:MissionMetric,category:MissionCategory,underMs?:number):MissionTemplate=>({
  id,title,detail,target,reward,metric,category,underMs,
})
// One of four variants is selected per slot; 10 slots = 10 daily missions.
// Each pair of consecutive days has completely different challenge IDs.
const DAILY_SLOTS: readonly (readonly MissionTemplate[])[] = [
  [goal('daily-warmup','Warm-up round','Finish 2 valid AI or Ghost solves',2,40,'valid','solves'),goal('daily-first-lap','Quick start','Finish 3 valid solves',3,55,'valid','solves'),goal('daily-practice-four','Four on the board','Finish 4 valid solves',4,65,'valid','solves'),goal('daily-five-finishes','Five finishes','Finish 5 valid solves',5,80,'valid','solves')],
  [goal('daily-first-win','Victory spark','Win 1 AI or Ghost race',1,45,'wins','wins'),goal('daily-double-win','Double victory','Win 2 races today',2,65,'wins','wins'),goal('daily-three-wins','Triple triumph','Win 3 races today',3,85,'wins','wins'),goal('daily-four-wins','Winning momentum','Win 4 races today',4,100,'wins','wins')],
  [goal('daily-ai-one','Meet the rivals','Finish 1 AI Race',1,35,'ai-solves','ai'),goal('daily-ai-two','AI rematch','Finish 2 AI Races',2,50,'ai-solves','ai'),goal('daily-ai-three','AI training trio','Finish 3 AI Races',3,70,'ai-solves','ai'),goal('daily-ai-four','Arena regular','Finish 4 AI Races',4,85,'ai-solves','ai')],
  [goal('daily-ghost-one','Face your ghost','Finish 1 valid Ghost solve',1,50,'ghost-solves','ghost'),goal('daily-ghost-two','Ghost practice','Finish 2 valid Ghost solves',2,70,'ghost-solves','ghost'),goal('daily-ghost-three','Three ghost runs','Finish 3 valid Ghost solves',3,90,'ghost-solves','ghost'),goal('daily-ghost-four','Ghost marathon','Finish 4 valid Ghost solves',4,110,'ghost-solves','ghost')],
  [goal('daily-sub60','Under one minute','Record 1 solve under 60 seconds',1,55,'speed','speed',60000),goal('daily-sub45','Speed up','Record 1 solve under 45 seconds',1,65,'speed','speed',45000),goal('daily-sub60-double','Minute breaker','Record 2 solves under 60 seconds',2,75,'speed','speed',60000),goal('daily-sub30','Sub-30 challenge','Record 1 solve under 30 seconds',1,85,'speed','speed',30000)],
  [goal('daily-one-case','Learn a move','Mark 1 algorithm case as learned',1,45,'cases','academy'),goal('daily-two-cases','Case explorer','Mark 2 different cases as learned',2,65,'cases','academy'),goal('daily-cross-case','Cross builder','Learn 1 new Cross practice case',1,50,'cross-cases','academy'),goal('daily-f2l-cases','Pair practice','Learn 2 new F2L cases',2,75,'f2l-cases','academy')],
  [goal('daily-ai-win','AI challenger','Win 1 AI Race',1,50,'ai-wins','ai'),goal('daily-ai-wins-two','Beat the bots','Win 2 AI Races',2,70,'ai-wins','ai'),goal('daily-ai-wins-three','Rival takedown','Win 3 AI Races',3,95,'ai-wins','ai'),goal('daily-ai-wins-four','Arena champion','Win 4 AI Races',4,115,'ai-wins','ai')],
  [goal('daily-mix-two','Mix your practice','Practice in 2 of AI, Ghost, Academy or tournaments',2,55,'variety','variety'),goal('daily-mix-three','Skill sampler','Practice 3 different modes today',3,80,'variety','variety'),goal('daily-mix-duo','Change it up','Use 2 different training modes',2,55,'variety','variety'),goal('daily-mix-trio','All-round cuber','Use 3 different training modes',3,80,'variety','variety')],
  [goal('daily-lesson','Academy check-in','Complete 1 new Academy lesson',1,70,'lessons','academy'),goal('daily-extra-case','Algorithm discovery','Learn 1 new algorithm case',1,45,'cases','academy'),goal('daily-oll-case','OLL spotlight','Learn 1 new OLL case',1,65,'oll-cases','academy'),goal('daily-pll-case','PLL spotlight','Learn 1 new PLL case',1,65,'pll-cases','academy')],
  [goal('daily-ghost-win','Defeat your double','Win 1 Ghost Race duel',1,85,'ghost-wins','ghost'),goal('daily-tourney','Tournament day','Finish a five-round AI tournament',1,150,'tournaments','tournament'),goal('daily-ghost-comeback','Ghost breakthrough','Win 2 Ghost Race duels',2,120,'ghost-wins','ghost'),goal('daily-tourney-win','Take the crown','Win a five-round AI tournament',1,180,'tournament-wins','tournament')],
]
// Weekly selections rotate separately at LOCAL Monday 00:00.
const WEEKLY_SLOTS: readonly (readonly MissionTemplate[])[] = [
  [goal('weekly-eight-solves','Eight solid finishes','Finish 8 valid solves this week',8,110,'valid','solves'),goal('weekly-ten-solves','Ten-solve training','Finish 10 valid solves this week',10,140,'valid','solves'),goal('weekly-twelve-solves','Twelve-solve routine','Finish 12 valid solves this week',12,160,'valid','solves'),goal('weekly-fifteen-solves','Consistency builder','Finish 15 valid solves this week',15,185,'valid','solves')],
  [goal('weekly-ai-five','AI training camp','Complete 5 valid AI Races',5,105,'ai-solves','ai'),goal('weekly-ai-seven','Rival training week','Complete 7 valid AI Races',7,130,'ai-solves','ai'),goal('weekly-ai-nine','AI endurance','Complete 9 valid AI Races',9,155,'ai-solves','ai'),goal('weekly-ai-twelve','AI racing marathon','Complete 12 valid AI Races',12,180,'ai-solves','ai')],
  [goal('weekly-ghost-two','Ghost reunion','Finish 2 valid Ghost solves',2,95,'ghost-solves','ghost'),goal('weekly-ghost-three','Ghost encounters','Finish 3 valid Ghost solves',3,120,'ghost-solves','ghost'),goal('weekly-ghost-four','Ghost practice week','Finish 4 valid Ghost solves',4,145,'ghost-solves','ghost'),goal('weekly-ghost-five','Shadow training','Finish 5 valid Ghost solves',5,170,'ghost-solves','ghost')],
  [goal('weekly-wins-four','Winning ways','Win 4 AI or Ghost races',4,120,'wins','wins'),goal('weekly-wins-five','Winning week','Win 5 AI or Ghost races',5,140,'wins','wins'),goal('weekly-wins-seven','Victory streak','Win 7 AI or Ghost races',7,170,'wins','wins'),goal('weekly-wins-nine','Championship mindset','Win 9 AI or Ghost races',9,195,'wins','wins')],
  [goal('weekly-ai-wins-three','Rival slayer','Win 3 AI Races',3,110,'ai-wins','ai'),goal('weekly-ai-wins-four','AI specialist','Win 4 AI Races',4,135,'ai-wins','ai'),goal('weekly-ai-wins-five','Five AI victories','Win 5 AI Races',5,160,'ai-wins','ai'),goal('weekly-ai-wins-seven','AI win streak','Win 7 AI Races',7,195,'ai-wins','ai')],
  [goal('weekly-sub60-three','One-minute week','Record 3 solves under 60 seconds',3,115,'speed','speed',60000),goal('weekly-sub45-three','Sub-45 consistency','Record 3 solves under 45 seconds',3,145,'speed','speed',45000),goal('weekly-sub30-two','Sub-30 club','Record 2 solves under 30 seconds',2,165,'speed','speed',30000),goal('weekly-sub20-two','Sub-20 pursuit','Record 2 solves under 20 seconds',2,200,'speed','speed',20000)],
  [goal('weekly-cases-four','Algorithm explorer','Learn 4 different algorithm cases',4,130,'cases','academy'),goal('weekly-cases-five','Case collector','Learn 5 different algorithm cases',5,150,'cases','academy'),goal('weekly-cases-seven','Algorithm apprentice','Learn 7 different algorithm cases',7,175,'cases','academy'),goal('weekly-cases-nine','Algorithm deep dive','Learn 9 different algorithm cases',9,205,'cases','academy')],
  [goal('weekly-one-lesson','Academy progress','Complete 1 new Academy lesson',1,125,'lessons','academy'),goal('weekly-two-lessons','Academy explorer','Complete 2 new Academy lessons',2,160,'lessons','academy'),goal('weekly-oll-three','OLL discoveries','Learn 3 different OLL cases',3,150,'oll-cases','academy'),goal('weekly-pll-three','PLL discoveries','Learn 3 different PLL cases',3,150,'pll-cases','academy')],
  [goal('weekly-days-two','Practice on two days','Practice on 2 different days this week',2,115,'practice-days','consistency'),goal('weekly-days-three','Three-day routine','Practice on 3 different days this week',3,145,'practice-days','consistency'),goal('weekly-days-four','Four-day habit','Practice on 4 different days this week',4,170,'practice-days','consistency'),goal('weekly-days-five','Five-day commitment','Practice on 5 different days this week',5,195,'practice-days','consistency')],
  [goal('weekly-tourney-one','Tournament challenger','Finish 1 five-round AI tournament',1,180,'tournaments','tournament'),goal('weekly-tourney-champ','Tournament victor','Win 1 five-round AI tournament',1,230,'tournament-wins','tournament'),goal('weekly-tourney-two','Tournament explorer','Finish 2 five-round AI tournaments',2,260,'tournaments','tournament'),goal('weekly-tourney-two-wins','Double champion','Win 2 five-round AI tournaments',2,300,'tournament-wins','tournament')],
]
const DAY_MS=86400000
function localDayNumber(date:Date){return Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/DAY_MS)}
function localWeekNumber(date:Date){
  const monday=new Date(date.getTime());monday.setHours(12,0,0,0)
  monday.setDate(monday.getDate()-(monday.getDay()+6)%7)
  return Math.floor(localDayNumber(monday)/7)
}
function stableChoice(key:string,slot:number):number{
  // FNV-1a over period key plus slot: reproducible across refreshes and browsers.
  let hash=2166136261
  for(const char of `${key}:${slot}`){hash=Math.imul(hash^char.charCodeAt(0),16777619)}
  return (hash>>>0)%2
}
export function makeMissions(state:JourneyState,now=new Date()):Mission[] {
  const today=dayKey(now),week=weekKey(now)
  const entries=state.events.filter(e=>e.kind!=='mission')
  const day=entries.filter(e=>dayKey(e.date)===today)
  const seven=entries.filter(e=>weekKey(e.date)===week)
  const valid=(e:JourneyEvent)=>(e.kind==='ai'||e.kind==='ghost')&&e.valid===true
  const win=(e:JourneyEvent)=>valid(e)&&e.win===true
  const progress=(events:JourneyEvent[],spec:MissionTemplate):number=>{
    const metric=spec.metric
    if(metric==='practice-days')return new Set(events.filter(e=>e.kind==='lesson'||e.kind==='case'||e.kind==='tournament'||valid(e)).map(e=>dayKey(e.date))).size
    if(metric==='variety')return new Set(events.filter(e=>e.kind==='lesson'||e.kind==='case'||e.kind==='tournament'||valid(e)).map(e=>e.kind==='lesson'||e.kind==='case'?'academy':e.kind)).size
    return events.filter(e=>{
      if(metric==='valid')return valid(e)
      if(metric==='ai-solves')return e.kind==='ai'&&valid(e)
      if(metric==='ghost-solves')return e.kind==='ghost'&&valid(e)
      if(metric==='wins')return win(e)
      if(metric==='ai-wins')return e.kind==='ai'&&win(e)
      if(metric==='ghost-wins')return e.kind==='ghost'&&win(e)
      if(metric==='speed')return valid(e)&&typeof e.ms==='number'&&e.ms<spec.underMs!
      if(metric==='speed-ai')return e.kind==='ai'&&valid(e)&&typeof e.ms==='number'&&e.ms<spec.underMs!
      if(metric==='cases')return e.kind==='case'
      if(metric==='cross-cases')return e.kind==='case'&&e.category==='cross'
      if(metric==='f2l-cases')return e.kind==='case'&&e.category==='f2l'
      if(metric==='oll-cases')return e.kind==='case'&&e.category==='oll'
      if(metric==='pll-cases')return e.kind==='case'&&e.category==='pll'
      if(metric==='lessons')return e.kind==='lesson'
      if(metric==='tournaments')return e.kind==='tournament'
      if(metric==='tournament-wins')return e.kind==='tournament'&&e.win===true
      return false
    }).length
  }
  const choose=(slots:readonly (readonly MissionTemplate[])[],period:'daily'|'weekly',key:string,ordinal:number,events:JourneyEvent[]):Mission[]=>
    slots.map((slot,index)=>{
      const spec=slot[(ordinal%2)*2+stableChoice(key,index)]
      const count=Math.min(spec.target,progress(events,spec))
      return {id:spec.id,title:spec.title,detail:spec.detail,target:spec.target,
        progress:count,reward:spec.reward,completed:count>=spec.target,
        period,key,category:spec.category}
    })
  return [
    ...choose(DAILY_SLOTS,'daily',today,localDayNumber(now),day),
    ...choose(WEEKLY_SLOTS,'weekly',week,localWeekNumber(now),seven),
  ]
}
/** The highest uninterrupted practice run over all recorded activity dates.
 * Unlike the current streak, a previously earned achievement never relocks.
 */
export function longestPracticeStreak(state:JourneyState):number {
  const dates=new Set(state.events.filter(e=>e.kind==='lesson'||e.kind==='case'||e.kind==='tournament'||((e.kind==='ai'||e.kind==='ghost')&&e.valid===true)).map(e=>dayKey(e.date)))
  const ordered=[...dates].map(key=>Date.parse(`${key}T00:00:00Z`)/86400000).filter(Number.isFinite).sort((a,b)=>a-b)
  let longest=0,run=0,prior=Number.NEGATIVE_INFINITY
  for(const day of ordered){run=day===prior+1?run+1:1;longest=Math.max(longest,run);prior=day}
  return longest
}
export function achievements(state:JourneyState):Achievement[]{
  const data=journeyMetrics(state)
  const valid=data.times
  const aiWins=data.ai.filter(e=>e.valid&&e.win).length
  const ghostDuels=data.ghosts.filter(e=>e.valid&&e.category==='ghost')
  const ghostWins=ghostDuels.filter(e=>e.win).length
  const crossCases=data.cases.filter(e=>e.category==='cross').length
  const firstCross=data.lessons.some(e=>e.category==='cross')
  const categories=(category:string)=>data.cases.filter(e=>e.category===category).length
  const fasterThan=(ms:number)=>valid.filter(e=>e.ms!<ms).length
  const tournamentsWon=data.tournaments.filter(e=>e.win).length
  // Preserve every original achievement ID so existing rewards and progress migrate automatically.
  // Category is presentation metadata; no new storage fields or extra XP events are needed.
  const defs:[string,string,string,string,AchievementCategory,number,number][]=[
    ['first-solve','First Solve','Finish your first valid timed solve','timer','solves',valid.length,1],
    ['ten-solves','Getting Warmed Up','Finish 10 valid timed solves','timer','solves',valid.length,10],
    ['fifty-solves','Dedicated Cuber','Finish 50 valid timed solves','medal','solves',valid.length,50],
    ['hundred-solves','Century of Solves','Finish 100 valid timed solves','crown','solves',valid.length,100],

    ['sub60','One-Minute Breakthrough','Record a solve under 60 seconds','timer','speed',fasterThan(60000),1],
    ['sub30','Sub-30 Breakthrough','Record a solve under 30 seconds','zap','speed',fasterThan(30000),1],
    ['sub20','Sub-20 Breakthrough','Record a solve under 20 seconds','zap','speed',fasterThan(20000),1],
    ['sub15','Sub-15 Breakthrough','Record a solve under 15 seconds','sparkles','speed',fasterThan(15000),1],
    ['sub12','Sub-12 Speedster','Record a solve under 12 seconds','rocket','speed',fasterThan(12000),1],
    ['sub10','Sub-10 Rocket','Record a solve under 10 seconds','rocket','speed',fasterThan(10000),1],
    ['sub20-five','Sub-20 Consistency','Finish 5 valid solves under 20 seconds','star','speed',fasterThan(20000),5],

    ['first-victory','First Victory','Beat an AI opponent','trophy','ai',aiWins,1],
    ['five-ai-wins','AI Rival Breaker','Win 5 AI Races','swords','ai',aiWins,5],
    ['twentyfive-ai-wins','AI Arena Veteran','Win 25 AI Races','trophy','ai',aiWins,25],

    ['ghost-unlocked','Ghost Created','Finish three qualifying solves','ghost','ghost',data.ghosts.filter(e=>e.category==='qualifying'&&e.valid).length,3],
    ['first-ghost-duel','Face Your Shadow','Finish your first valid Ghost duel','ghost','ghost',ghostDuels.length,1],
    ['ghost-winner','Beat Yourself','Beat your saved Ghost time','medal','ghost',ghostWins,1],
    ['five-ghost-wins','Ghost Challenger','Win five Ghost Race duels','swords','ghost',ghostWins,5],
    ['ten-ghost-wins','Ghost Hunter','Win ten Ghost Race duels','swords','ghost',ghostWins,10],

    ['cross-master','Cross Master','Complete Cross and learn five Cross cases','layers','academy',firstCross?crossCases:0,5],
    ['academy-graduate','Academy Graduate','Complete all six Academy lessons','graduation','academy',new Set(data.lessons.map(e=>e.category)).size,6],
    ['case-collector','Algorithm Collector','Learn 25 distinct algorithm cases','book','academy',data.cases.length,25],
    ['f2l-scholar','F2L Scholar','Learn 10 different F2L cases','layers','academy',categories('f2l'),10],
    ['oll-explorer','OLL Explorer','Learn 10 different OLL cases','sparkles','academy',categories('oll'),10],
    ['pll-strategist','PLL Strategist','Learn 10 different PLL cases','book','academy',categories('pll'),10],
    ['case-veteran','Algorithm Veteran','Learn 75 distinct algorithm cases','graduation','academy',data.cases.length,75],

    ['seven-day-streak','Seven-Day Dedication','Practice on 7 consecutive calendar days','flame','practice',longestPracticeStreak(state),7],

    ['first-tournament','Tournament Finisher','Finish a five-round championship','flag','tournament',data.tournaments.length,1],
    ['three-tournaments','Championship Regular','Finish three five-round championships','flag','tournament',data.tournaments.length,3],
    ['champion','Tournament Champion','Place first in an AI tournament','crown','tournament',tournamentsWon,1],
  ]
  return defs.map(([id,title,description,icon,category,progress,target])=>({id,title,description,icon,category,progress:Math.min(progress,target),target,unlocked:progress>=target}))
}
