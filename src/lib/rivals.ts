import { ALL_DIFFICULTIES, aiExpectedMeanMs, isDifficulty } from './racing'
import type { Difficulty } from './racing'

/** Cube Hero canonical rival identities. Approved portraits are independent
 * of AI timing, solver implementation and race mechanics. */
export type RivalDivision = 'Legend' | 'Master' | 'Expert' | 'Challenger' | 'Rising'
export interface RivalProfile {
  difficulty: Difficulty
  name: string
  title: string
  division: RivalDivision
  blurb: string
  motto: string
  accent: string
  glow: string
  variant: number
  expectedMs: number
}
const IDENTITIES: ReadonlyArray<readonly [number,string,string,string]> = [
  [6,'Zenith','The Apex','Every move is an answer.'],
  [7,'Astra','Starbreaker','The clock belongs to the fearless.'],
  [8,'Nyx','The Phantom','You only see the finishing move.'],
  [9,'Orion','The Comet','Light-speed instincts. Unshakable focus.'],
  [10,'Kairo','The Blitz','Speed is a decision.'],
  [11,'Veyra','The Oracle','I see the next turn before it happens.'],
  [12,'Reo','The Technician','Precision beats panic.'],
  [13,'Soren','The Blade','One clean sequence at a time.'],
  [14,'Kaela','The Falcon','Find the opening. Take the win.'],
  [15,'Ryuu','The Disciplined Solver','Control the cube. Control the race.'],
  [16,'Rei','The Spark','One more turn. One more breakthrough.'],
  [17,'Zara','The Tempest','Let your hands find their rhythm.'],
  [18,'Jett','The Runner','I never stop at almost.'],
  [19,'Lyra','The Pathfinder','There is always a faster path.'],
  [20,'Jake','The Apprentice','Every record begins with practice.'],
  [21,'Mika','The Catalyst','Stay curious. Stay quick.'],
  [22,'Arden','The Striker','Small steps build great speed.'],
  [23,'Nova','The Rising Star','One day the stars will chase me.'],
  [24,'Talon','The Scout','Read the case. Own the move.'],
  [25,'Suki','The Dynamo','Keep your fingers moving.'],
  [26,'Bex','The Trailblazer','New scrambles are new chances.'],
  [27,'Niko','The Navigator','Know your route before you turn.'],
  [28,'Aiko','The Tempo','Consistency makes champions.'],
  [29,'Zane','The Charger','The next attempt is the one.'],
  [30,'Riven','The Rising Force','Better than yesterday is enough.'],
  [31,'Iris','The Prism','Every side tells a story.'],
  [32,'Kai','The Switch','No scramble scares me.'],
  [33,'Sable','The Shadowstep','Think twice. Turn once.'],
  [34,'Dax','The Challenger','I came here to improve.'],
  [35,'Lumi','The Beacon','Keep your focus on the finish.'],
  [36,'Ezra','The Tactician','Plan the next move.'],
  [37,'Mara','The Voyager','The journey is in every solve.'],
  [38,'Kian','The Inventor','Try a better way.'],
  [39,'Tessa','The Quickstep','Steady hands, brighter times.'],
  [40,'Axel','The Trail Runner','The timer is a starting line.'],
  [41,'Nia','The Explorer','Learn something new each race.'],
  [42,'Finn','The Optimist','Tomorrow has a faster solve.'],
  [43,'Yuna','The Focus','Start strong. Finish clean.'],
  [44,'Milo','The Dreamer','Big goals begin small.'],
  [45,'Juno','The Rookie Ace','Every attempt is progress.'],
  [46,'Remy','The Steady Hand','Breathe. Look. Turn.'],
  [47,'Skye','The Wanderer','Find your flow.'],
  [48,'Theo','The Learner','The best way forward is practice.'],
  [49,'Piper','The Brightspark','One move closer.'],
  [50,'Koa','The Newcomer','Give every scramble a chance.'],
  [51,'Lina','The First Step','The journey is just beginning.'],
  [52,'Ollie','The Hopeful','Better solves start here.'],
  [53,'Hana','The Starter','Start with what you know.'],
  [54,'Felix','The Builder','Build a foundation worth racing on.'],
  [55,'Rina','The Courageous','Trying again is a victory.'],
  [56,'Leo','The Eager','A fresh scramble awaits.'],
  [57,'Pax','The Patient','Slow is smooth. Smooth becomes fast.'],
  [58,'Tori','The Explorer-in-Training','Discover a new way to solve.'],
  [59,'Ember','The Beginner Flame','Every champion started somewhere.'],
  [60,'Cody','The First Challenger','Your first rival is your first step.'],
]
const DIVISION_INFO:Record<RivalDivision,{primary:string;secondary:string;blurb:string}> = {
  Legend:{primary:'#f1bf66',secondary:'#fa7672',blurb:'Elite speedcubers who live for a razor-thin finish.'},
  Master:{primary:'#c79eff',secondary:'#7b66ff',blurb:'Technical experts with disciplined execution.'},
  Expert:{primary:'#76ccfa',secondary:'#6484ff',blurb:'Experienced rivals who push your next breakthrough.'},
  Challenger:{primary:'#5ee4c8',secondary:'#3d99c9',blurb:'Ambitious speedcubers working toward consistency.'},
  Rising:{primary:'#f2a3d5',secondary:'#f39178',blurb:'Friendly rivals for finding confidence and building habits.'},
}
export const RIVAL_DIVISIONS:readonly RivalDivision[]=['Legend','Master','Expert','Challenger','Rising']
export function rivalDivision(difficulty:Difficulty):RivalDivision {
  const n=Number(difficulty)
  return n<=10?'Legend':n<=15?'Master':n<=20?'Expert':n<=39?'Challenger':'Rising'
}
export const AI_RIVALS:ReadonlyArray<RivalProfile>=IDENTITIES.map(([n,name,title,motto],i)=>{
  const difficulty=String(n) as Difficulty
  const division=rivalDivision(difficulty)
  const theme=DIVISION_INFO[division]
  return {difficulty,name,title,division,motto,blurb:theme.blurb,
    accent:theme.primary,glow:theme.secondary,variant:i%5,expectedMs:aiExpectedMeanMs(difficulty)}
})
const BY_DIFFICULTY=new Map(AI_RIVALS.map(rival=>[rival.difficulty,rival]))
export function getRival(difficulty:Difficulty):RivalProfile {
  return BY_DIFFICULTY.get(difficulty)??BY_DIFFICULTY.get('15')!
}
export function searchRivals(query:string,division:RivalDivision|'All'='All'):RivalProfile[] {
  const keyword=query.trim().toLowerCase().replace(/\s+/g,' ')
  const exactTier=keyword.match(/^(?:sub[\s-]*)?(\d{1,2})$/)
  return AI_RIVALS.filter(r=>division==='All'||r.division===division).filter(r=>
    exactTier ? r.difficulty===String(Number(exactTier[1])) :
      !keyword || [r.name,r.title,r.division,`sub-${r.difficulty}`,`sub ${r.difficulty}`].some(text=>text.toLowerCase().includes(keyword)),
  )
}
// Data-integrity assertions live in scripts/test-rivals.mjs; every number remains
// mapped one-to-one to the existing ALL_DIFFICULTIES list.
export const RIVAL_COUNT=ALL_DIFFICULTIES.length
export function hasRival(difficulty:unknown):boolean{return isDifficulty(difficulty)&&BY_DIFFICULTY.has(difficulty)}
