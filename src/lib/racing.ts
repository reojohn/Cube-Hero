import type { CfopStage } from './cfop'
/** Cube Hero racing utilities. Phase 3 applies scramble-specific solver complexity
 * and animates a verified solution; selected opponent tier still determines baseline speed.
 * Generated 25-turn scrambles are valid moves but not WCA random-state scrambles.
 */
export type Difficulty = `${number}`
export const MIN_DIFFICULTY = 6
export const MAX_DIFFICULTY = 60
/** Difficulty labels are whole-number Sub levels between 6 and 60 inclusive. */
export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && /^(?:[1-9]\d?)$/.test(value) &&
    Number(value) >= MIN_DIFFICULTY && Number(value) <= MAX_DIFFICULTY
}
export const ALL_DIFFICULTIES: Difficulty[] = Array.from(
  {length: MAX_DIFFICULTY-MIN_DIFFICULTY+1}, (_,i) => String(MIN_DIFFICULTY+i) as Difficulty,
)
export type AiPersonality = 'casual'|'balanced'|'competitive'
export const AI_PERSONALITIES:AiPersonality[]=['casual','balanced','competitive']
export function getAiPersonality(value:unknown):AiPersonality {
  return typeof value==='string'&&AI_PERSONALITIES.some(p=>p===value)?value as AiPersonality:'balanced'
}
export type RaceLength = 'single'|'ao5'|'ao12'
export const MAX_AI_OPPONENTS = 10
export function getAiCount(value:unknown):number {
  const n=typeof value==='number'?value:typeof value==='string'&&value.trim()?Number(value):NaN
  return Number.isInteger(n)&&n>=1&&n<=MAX_AI_OPPONENTS?n:1
}
export interface AiOpponentResult { id:string; ms:number }
export function rankedFinishers(playerMs:number|null,opponents:AiOpponentResult[]) {
  const finishers=[{id:'YOU',ms:playerMs},...opponents].sort((a,b)=> (a.ms??Infinity)-(b.ms??Infinity) || (a.id==='YOU'?1:b.id==='YOU'?-1:a.id.localeCompare(b.id)))
  return finishers.map((f,i)=>({...f,place:i+1}))
}
export function playerPlacement(playerMs:number|null,opponents:AiOpponentResult[]):number {
  return rankedFinishers(playerMs,opponents).find(x=>x.id==='YOU')?.place??opponents.length+1
}

export type InspectionPenalty = 'none'|'plus2'|'dnf'
export interface RaceSettings {difficulty:Difficulty;personality:AiPersonality;aiCount:number;raceLength:RaceLength;inspection:boolean;showCube:boolean;breakdown:boolean;puzzle:'333'}
export interface RaceRecord {
  id:string; sessionId:string; round:number; date:string; difficulty:Difficulty;personality?:AiPersonality; // optional for pre-update history
  scramble:string; playerMs:number; penalty:InspectionPenalty;
  officialMs:number|null; aiMs:number; win:boolean;
  /** Present for multi-AI races; legacy single-AI history omits it. */
  aiOpponents?:AiOpponentResult[]; playerRank?:number;
  aiSolution?:string; aiMoveCount?:number; aiQtm?:number; aiSegmentsMs?:number[]; // existing saved history
  aiMethod?:'cfop'|'two-phase'; aiCfopStages?:CfopStage[]; aiVariantKey?:string; // genuinely stage-verified new races
}
export interface RaceSession {id:string;settings:RaceSettings;records:RaceRecord[]}
export const RACE_COUNT:Record<RaceLength,number>={single:1,ao5:5,ao12:12}
// Target LONG-RUN means of the Balanced AI profile, in milliseconds.
// Each round is sampled independently. These are not exact completion times,
// not guarantees that every solve is below the tier label, and not tied to a scramble.
// Keep the exact means of the original six presets. New Sub-7..19 are
// interpolated smoothly; Sub-21..60 extend the same human-style profile.
export const AI_MEANS:Record<string,number>={'20':18000,'15':14100,'12':10800,'10':9000,'8':7000,'6':5500}
const AI_ANCHORS = [6,8,10,12,15,20] as const
export function aiBaseMeanMs(difficulty: Difficulty): number {
  if (!isDifficulty(difficulty)) throw new RangeError('AI difficulty must be between Sub-6 and Sub-60.')
  const tier=Number(difficulty)
  const preset=AI_MEANS[difficulty]
  if (preset!==undefined) return preset
  if (tier>20) return (tier-2)*1000 // Sub-30 ~28s, Sub-60 ~58s
  for (let i=1;i<AI_ANCHORS.length;i++) {
    const low=AI_ANCHORS[i-1], high=AI_ANCHORS[i]
    if (tier<high) {
      const lowMean=AI_MEANS[String(low)], highMean=AI_MEANS[String(high)]
      return Math.round(lowMean + (highMean-lowMean)*(tier-low)/(high-low))
    }
  }
  return AI_MEANS['20']
}
// Human-inspired timing styles, not a trained model or a scramble-specific solve.
// Competitive is a little quicker and much steadier; Casual has more lockups and
// a wider spread. Balanced preserves the previously calibrated AI distribution.
const TIMING_PROFILES:Record<AiPersonality,{
  meanScale:number;spread:number;fastChance:number;fastMin:number;fastRange:number;
  slowChance:number;slowMin:number;slowRange:number;minScale:number;maxScale:number
}>={
  casual: {meanScale:1.04,spread:.083,fastChance:.055,fastMin:.04,fastRange:.08,slowChance:.30,slowMin:.09,slowRange:.19,minScale:.65,maxScale:1.70},
  balanced:{meanScale:1,spread:.06,fastChance:.07,fastMin:.055,fastRange:.07,slowChance:.17,slowMin:.075,slowRange:.15,minScale:.69,maxScale:1.48},
  competitive:{meanScale:.99,spread:.034,fastChance:.05,fastMin:.03,fastRange:.055,slowChance:.045,slowMin:.03,slowRange:.065,minScale:.78,maxScale:1.30}
}
export function aiExpectedMeanMs(difficulty:Difficulty,personality:AiPersonality='balanced'):number {
  return Math.round(aiBaseMeanMs(difficulty)*TIMING_PROFILES[getAiPersonality(personality)].meanScale)
}
export const PERSONALITY_DESCRIPTIONS:Record<AiPersonality,string>={
  casual:'More mistakes, recognition pauses, and varied solve times.',
  balanced:'Natural variation, with both fast and slower rounds.',
  competitive:'Steadier execution, fewer slow rounds, and a slightly quicker pace.'
}
const FACES=['R','L','U','D','F','B'] as const
const AXIS:Record<string,number>={R:0,L:0,U:1,D:1,F:2,B:2}
const MODIFIERS=['',"'",'2'] as const
function randomInt(n:number):number {
  if(typeof crypto !== 'undefined' && crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n}
  return Math.floor(Math.random()*n)
}
function uniform():number{return (randomInt(1_000_000)+.5)/1_000_000}
export function newId():string{return typeof crypto!=='undefined' && crypto.randomUUID ? crypto.randomUUID():`${Date.now()}-${randomInt(1_000_000)}`}
export function generateScramble():string {
  const moves:string[]=[]
  let previousAxis=-1
  let previousFace=''
  for(let i=0;i<25;i++){
    // Avoid same-axis adjacent turns and repetitions. Each token is valid 3x3 face-turn notation.
    const choices=FACES.filter(face=>AXIS[face]!==previousAxis&&face!==previousFace)
    const face=choices[randomInt(choices.length)]
    moves.push(face+MODIFIERS[randomInt(MODIFIERS.length)])
    previousFace=face;previousAxis=AXIS[face]
  }
  return moves.join(' ')
}
export function generateAiTimeMs(difficulty:Difficulty,personality:AiPersonality='balanced'):number {
  const profile=TIMING_PROFILES[getAiPersonality(personality)]
  const mean=aiExpectedMeanMs(difficulty,personality)
  const normal=Math.sqrt(-2*Math.log(uniform()))*Math.cos(2*Math.PI*uniform())
  const kind=uniform()
  let eventAdjustment=0
  if(kind<profile.fastChance){
    eventAdjustment=-(profile.fastMin+profile.fastRange*uniform())
  }else if(kind<profile.fastChance+profile.slowChance){
    eventAdjustment=profile.slowMin+profile.slowRange*uniform()
  }
  // Center the distribution on this personality's target despite good/bad solves.
  const eventMean=-(profile.fastChance*(profile.fastMin+profile.fastRange/2))+
    profile.slowChance*(profile.slowMin+profile.slowRange/2)
  const relative=1+normal*profile.spread+eventAdjustment-eventMean
  // Plausibility guard for rare outliers; styles keep their different variances.
  return Math.round(Math.max(mean*profile.minScale,Math.min(mean*profile.maxScale,mean*relative)))
}
export function formatTime(ms:number|null|undefined,precision:2|3=2):string {
  if(ms===null||ms===undefined||!Number.isFinite(ms))return 'DNF'
  const seconds=Math.max(0,ms)/1000
  const mins=Math.floor(seconds/60)
  const remainder=seconds-mins*60
  const body=remainder.toFixed(precision).padStart(precision===2?5:6,'0')
  return mins>0?`${mins}:${body}`:body
}
export function formatResult(r:RaceRecord,precision:2|3=2):string {
  return r.officialMs===null?'DNF':`${formatTime(r.officialMs,precision)}${r.penalty==='plus2'?' (+2)':''}`
}
export function inspectionPenalty(elapsedMs:number):InspectionPenalty {
  return elapsedMs>=17000?'dnf':elapsedMs>=15000?'plus2':'none'
}
export function calculateAverage(records:RaceRecord[]):number|null|undefined {
  if(records.length<5)return undefined
  const values=records.map(r=>r.officialMs===null?Infinity:r.officialMs)
  values.sort((a,b)=>a-b)
  const kept=values.slice(1,-1)
  return kept.some(x=>!Number.isFinite(x))?null:Math.round(kept.reduce((a,b)=>a+b,0)/kept.length)
}
export function lastAverage(history:RaceRecord[],count:5|12):number|null|undefined {
  return history.length>=count?calculateAverage(history.slice(-count)):undefined
}
export function personalBest(history:RaceRecord[]):number|null {
  const valid=history.map(r=>r.officialMs).filter((x):x is number=>x!==null)
  return valid.length?Math.min(...valid):null
}
export function createRecord(session:RaceSession,scramble:string,playerMs:number,penalty:InspectionPenalty,aiMs:number,details?:{solution:string;moveCount:number;qtm:number;segmentsMs:number[];method?:'cfop'|'two-phase';cfopStages?:CfopStage[];opponents?:AiOpponentResult[];variantKey?:string}):RaceRecord {
  const officialMs=penalty==='dnf'?null:Math.round(playerMs)+(penalty==='plus2'?2000:0)
  const opponents=details?.opponents?.length?details.opponents:[{id:'AI 1',ms:aiMs}]
  const fastest=Math.min(...opponents.map(o=>o.ms))
  const rank=playerPlacement(officialMs,opponents)
  return {id:newId(),sessionId:session.id,round:session.records.length+1,date:new Date().toISOString(),difficulty:session.settings.difficulty,personality:getAiPersonality(session.settings.personality),
    scramble,playerMs:Math.round(playerMs),penalty,officialMs,aiMs:fastest,win:officialMs!==null&&officialMs<fastest,
    ...(opponents.length>1?{aiOpponents:opponents.map(o=>({...o})),playerRank:rank}:{}),
    ...(details?{aiSolution:details.solution,aiMoveCount:details.moveCount,aiQtm:details.qtm,aiSegmentsMs:details.segmentsMs,aiMethod:details.method,aiCfopStages:details.cfopStages,...(details.variantKey?{aiVariantKey:details.variantKey}:{})}: {})}
}
export function isRaceRecord(x:unknown):x is RaceRecord {
  if(!x||typeof x!=='object')return false
  const r=x as Partial<RaceRecord>
  if(r.aiOpponents!==undefined && (!Array.isArray(r.aiOpponents)||r.aiOpponents.length<1||r.aiOpponents.length>MAX_AI_OPPONENTS||!r.aiOpponents.every(o=>o&&typeof o.id==='string'&&Number.isFinite(o.ms)&&o.ms>0)))return false
  return typeof r.id==='string' && typeof r.date==='string' && typeof r.scramble==='string' &&
    typeof r.aiMs==='number' && typeof r.playerMs==='number' && (r.officialMs===null||typeof r.officialMs==='number') &&
    typeof r.win==='boolean' && isDifficulty(r.difficulty) && (r.personality===undefined||AI_PERSONALITIES.some(p=>p===r.personality)) && ['none','plus2','dnf'].includes(r.penalty||'')
}
