import { tokenizeCubeMoves } from './cubeMoves'
import type { AiPlan } from './aiPlan'
import { FULL_CFOP_CASES } from './academyFullCases'

/**
 * Independent, deterministic learning examples. Each demonstration begins in
 * the inverse of its own algorithm so the displayed physical cube and move
 * sequence always agree. This is a worked example, not a universal CFOP solve.
 */
export type AcademyCategory = 'cross' | 'f2l' | 'oll' | 'pll' | 'fundamentals'
export type AcademyModule = 'notation' | 'cross' | 'f2l' | 'oll' | 'pll' | 'finger'
export type AcademyAlgorithm = {
  id: string; name: string; category: AcademyCategory; level: string;
  sequence: string; purpose: string; tip: string; group?: string; recognition?: string
}
export type AcademyLesson = {
  id: AcademyModule; title: string; label: string; level: string; description: string;
  intro: string; steps: readonly string[]; why: string; practiceAlgorithm: string;
}
export type AcademyDrill = {
  id: string; name: string; label: string; sequence: string; objective: string;
  cues: readonly string[]; tip: string
}
export type AcademyProgress = {
  completed: AcademyModule[]; favorites: string[]; masteredCases: string[]; notationTurns: number; lastModule: AcademyModule
}

export const ACADEMY_STORAGE_KEY = 'cube-hero-academy-progress-v1'
export const ACADEMY_MODULES: readonly AcademyModule[] = ['notation','cross','f2l','oll','pll','finger']

export const ACADEMY_LESSONS: readonly AcademyLesson[] = [
  { id:'notation', title:'Cube notation', label:'01 · BEGINNER', level:'Beginner', description:'Learn the six faces, primes, and half-turns.',
    intro:'Every letter tells you which face to turn. Look directly at that face to decide clockwise or counterclockwise.',
    steps:['Hold the cube with one color on top and one facing you. Keep that orientation while reading a sequence.','R, L, U, D, F, and B name the Right, Left, Up, Down, Front, and Back faces.','A plain letter is a clockwise quarter turn as viewed directly at that face.','A prime (′) is counterclockwise. A 2 means turn the face halfway (180°).'],
    why:'Try the notation lab and tap a face to make the 3D cube turn.', practiceAlgorithm:'sexy' },
  { id:'cross', title:'Build your Cross', label:'02 · FOUNDATION', level:'Foundation', description:'Place four matching edge pieces around your first center.',
    intro:'Start with the cross on one face. All four cross edges must match their side centers, not only the cross color.',
    steps:['Find the four edges that contain your cross color.','During inspection, choose a short route for those edges.','Solve edges one by one while keeping the side colors lined up.','Practice making the cross without pausing between each move.'],
    why:'The cube shows a simplified cross-edge example. Full cross solutions depend on the scramble.', practiceAlgorithm:'cross-edge' },
  { id:'f2l', title:'First Two Layers (F2L)', label:'03 · INTERMEDIATE', level:'Intermediate', description:'Pair corner and edge pieces, then insert them.',
    intro:'F2L solves the bottom two layers by pairing each corner with its matching edge, then inserting that pair.',
    steps:['Locate a corner and its matching middle-layer edge.','Move the two pieces to the top layer where you can see them.','Pair them using small R/U or L/U triggers.','Insert the pair into its slot, then look ahead to the next pair.'],
    why:'The example teaches an R/U trigger; real F2L cases can require different setups.', practiceAlgorithm:'f2l-1' },
  { id:'oll', title:'Orient the Last Layer (OLL)', label:'04 · RECOGNITION', level:'Intermediate', description:'Make the whole top face one color.',
    intro:'OLL stands for Orientation of the Last Layer. It turns top stickers upward without undoing the first two layers.',
    steps:['Finish Cross and all four F2L pairs before doing OLL.','Look at which top stickers already face upward.','Recognize a pattern, then choose the matching OLL algorithm.','Practice one case at a time with smooth, accurate turns.'],
    why:'The Sune example demonstrates a real OLL algorithm on a prepared training case.', practiceAlgorithm:'oll-27' },
  { id:'pll', title:'Permute the Last Layer (PLL)', label:'05 · ADVANCED', level:'Advanced', description:'Move last-layer pieces to their final positions.',
    intro:'PLL stands for Permutation of the Last Layer. After OLL, the top is one color; PLL puts those top-layer pieces in the correct places.',
    steps:['Complete OLL so the top is fully oriented.','Match side stickers with the centers to recognize the case.','Perform the matching permutation algorithm.','Use a final U move if needed to align the finished top layer.'],
    why:'The T-perm example demonstrates a real PLL algorithm using an inverse-generated setup.', practiceAlgorithm:'pll-t' },
  { id:'finger', title:'Finger tricks & lookahead', label:'06 · EXECUTION', level:'Advanced', description:'Turn smoothly, reduce regrips, and keep looking ahead.',
    intro:'Fast solving is about controlled movements and spotting the next pieces, not just turning as quickly as possible.',
    steps:['Use a light grip and practice U turns with your index finger.','Make R turns smoothly, with fewer full-hand regrips.','During F2L, slow down enough to spot the next corner-edge pair.','Repeat short triggers until your movements feel comfortable and accurate.'],
    why:'Use the drills to practice timing and accuracy; they are not a replacement for personalized finger placement.', practiceAlgorithm:'sexy' }
]

// The Cross is scramble-specific: these are guided move drills, not a "complete Cross algorithm list".
export const ACADEMY_CROSS_DRILLS: readonly AcademyAlgorithm[] = [
  {id:'cross-edge',name:'Front edge half-turn',category:'cross',level:'Beginner',sequence:'F2',purpose:'Watch the front face bring a cross-color edge around.',tip:'Always check the side center after placing the edge.',group:'Single-edge practice'},
  {id:'cross-r2',name:'Right edge half-turn',category:'cross',level:'Beginner',sequence:'R2',purpose:'Practice placing an edge with a right-face half-turn.',tip:'Try the same idea with the other three sides.',group:'Single-edge practice'},
  {id:'cross-l2',name:'Left edge half-turn',category:'cross',level:'Beginner',sequence:'L2',purpose:'Practice how a left half-turn moves two edges.',tip:'Keep white on the bottom and notice the side colors.',group:'Single-edge practice'},
  {id:'cross-b2',name:'Back edge half-turn',category:'cross',level:'Beginner',sequence:'B2',purpose:'See the back edge move while holding the cube orientation steady.',tip:'Learn to find the back edge without rotating constantly.',group:'Single-edge practice'},
  {id:'cross-u-f2',name:'Top-layer setup and front',category:'cross',level:'Foundation',sequence:'U F2',purpose:'Use U to line up a top edge before bringing it down.',tip:'A setup move can save extra face turns.',group:'Top-layer setup'},
  {id:'cross-u-r2',name:'Top-layer setup and right',category:'cross',level:'Foundation',sequence:"U' R2",purpose:'Practice aligning a top edge before a right half-turn.',tip:'Look at the matching side center first.',group:'Top-layer setup'},
  {id:'cross-u2-b2',name:'Across the top',category:'cross',level:'Foundation',sequence:'U2 B2',purpose:'Move an edge around the top, then into its side.',tip:'Plan the U2 during inspection.',group:'Top-layer setup'},
  {id:'cross-u-l2',name:'Left setup',category:'cross',level:'Foundation',sequence:'U L2',purpose:'Practice a setup for the left side.',tip:'Keep the already-solved cross edges protected.',group:'Top-layer setup'},
  {id:'cross-fd',name:'Cross edge with D setup',category:'cross',level:'Intermediate',sequence:"D F2 D'",purpose:'Watch how a D setup changes which slot receives the edge.',tip:'D turns can reposition the cross while you protect other edges.',group:'Planning drills'},
  {id:'cross-rd',name:'Two-side cross flow',category:'cross',level:'Intermediate',sequence:"R2 D F2 D'",purpose:'Practice linking two face turns without a long pause.',tip:'These are prepared examples; actual cross solutions vary by scramble.',group:'Planning drills'},
  {id:'cross-ld',name:'Left/back cross flow',category:'cross',level:'Intermediate',sequence:"L2 D' B2 D",purpose:'Watch two edges move with a D-layer reposition.',tip:'Predict the D move before you begin.',group:'Planning drills'},
  {id:'cross-combine',name:'Cross planning combination',category:'cross',level:'Intermediate',sequence:"U F2 D R2 D'",purpose:'Study a short chain of setup, placement and D correction.',tip:'Try tracing each white edge before hitting Play.',group:'Planning drills'},
]

export const ACADEMY_FUNDAMENTALS: readonly AcademyAlgorithm[] = [
  {id:'sexy',name:'Sexy move',category:'fundamentals',level:'Beginner',sequence:"R U R' U'",purpose:'The classic right-hand trigger used in many algorithms.',tip:'Keep a steady rhythm, turning each face fully.',group:'Finger tricks'},
  {id:'left-trigger',name:'Left-hand trigger',category:'fundamentals',level:'Beginner',sequence:"L' U' L U",purpose:'The mirrored left-hand trigger.',tip:'Try it slowly using your left index finger.',group:'Finger tricks'},
  {id:'sledgehammer',name:'Sledgehammer',category:'fundamentals',level:'Intermediate',sequence:"R' F R F'",purpose:'A useful short four-move trigger for solving F2L pairs.',tip:'Compare this grip and motion with the sexy move.',group:'Finger tricks'},
  {id:'two-look-line',name:'2-Look OLL · Edge Line',category:'fundamentals',level:'Beginner',sequence:"F R U R' U' F'",purpose:'One basic top-edge orientation trigger. Used before orienting corners.',tip:'Keep yellow on top. Turn the cube to recognize a line pattern before doing the sequence.',group:'2-Look OLL'},
  {id:'two-look-l',name:'2-Look OLL · Edge L',category:'fundamentals',level:'Beginner',sequence:"f R U R' U' f'",purpose:'The wide-front version often used for an L-shaped edge pattern.',tip:'A lowercase f turns the front two layers together.',group:'2-Look OLL'},
  {id:'two-look-dot',name:'2-Look OLL · Edge Dot',category:'fundamentals',level:'Beginner',sequence:"F R U R' U' F' f R U R' U' f'",purpose:'A paired edge-orientation drill for a dot pattern.',tip:'Practice line and L first; this is a combined example for the dot.',group:'2-Look OLL'},
]

// 41 numbered F2L cases + 57 numbered OLL cases + 21 named PLL cases.
export const ACADEMY_ALGORITHMS: readonly AcademyAlgorithm[] = [
  ...ACADEMY_FUNDAMENTALS, ...ACADEMY_CROSS_DRILLS, ...FULL_CFOP_CASES
]

export const CFOP_CASE_COUNTS = {f2l:41, oll:57, pll:21, total:119} as const
export const TWO_LOOK_OLL_CASES = ['two-look-line','two-look-l','two-look-dot','oll-21','oll-22','oll-23','oll-24','oll-25','oll-26','oll-27'] as const
export const TWO_LOOK_PLL_CASES = ['pll-aa','pll-ab','pll-ua','pll-ub','pll-h','pll-z'] as const

/** Progressive teaching notes; Cross uses intuition, not one fixed case table. */
export const ACADEMY_TEACHING_NOTES: Record<'cross'|'f2l'|'oll'|'pll',{
  goal:string; recognition:string[]; beginnerSteps:string[]; mistakes:string[]; practice:string
}> = {
  cross: {
    goal:'Make a white plus on the bottom. The white edges must also match the colored side centers.',
    recognition:['Find white on an edge (two stickers, not a corner).','Check the second edge color against its side center.','Look for edges in the top, middle, and bottom layers.'],
    beginnerSteps:['Choose white for your Cross and keep white on the bottom.','Find a white edge and move it to the top without disrupting solved pieces.','Align its other color with the matching side center.','Turn that face 180° (for example F2) to bring it down. Repeat with the other three edges.','Once comfortable, plan at least two edges before turning and try solving the Cross without pauses.'],
    mistakes:['A white plus is not enough if the four side colors do not match.','Do not scramble a solved edge by inserting the next one without planning.','Cross is intuitive; there is no fixed 119-case-style algorithm list for it.'],
    practice:'Try the twelve prepared Cross exercises. Then use random 3×3 scrambles and plan the Cross yourself.'
  },
  f2l: {
    goal:'Match one white corner with its matching edge, then insert them together. Repeat for four slots.',
    recognition:['Locate the white corner with the other two slot colors.','Find the edge with those same two side colors.','Are both pieces on the top, or is one trapped in a slot?','Choose the front-right slot as the learning reference; mirror later for other slots.'],
    beginnerSteps:['Finish the Cross first, then find a corner and its matching edge.','If one piece is trapped, lift it to the top without breaking the Cross.','Separate or join them using simple R, U, and F moves.','Insert the joined pair into the correct slot and keep the other pairs intact.','Start with the free-pair cases, then disconnected, connected, and slot cases. Learn the logic before memorizing all 41.'],
    mistakes:['Do not insert a corner and an edge separately if you can pair them first.','Always match the two side colors of the pair, not just white.','The examples are for a front-right slot; the real cube may need a U setup or a mirror.'],
    practice:'Explore all 41 standard F2L patterns, grouped by the starting position of the corner and edge.'
  },
  oll: {
    goal:'Make all nine stickers on the top face yellow while keeping both bottom layers solved.',
    recognition:['Hold yellow on top and white on the bottom.','Look at the yellow shape: dot, line, L, fish, or other patterns.','Also check yellow stickers on the side of top-layer corners to distinguish similar cases.'],
    beginnerSteps:['Complete the Cross and all four F2L pairs.','Learn 2-look OLL first: orient top edges, then top corners.','Practice the common Sune and Anti-Sune corner shapes.','Use the top-and-side pattern diagram to identify each full OLL case.','Expand gradually until you know the full 57-case set.'],
    mistakes:['OLL orients pieces; it does not necessarily solve their final positions.','One yellow top pattern can look different after a U turn; inspect the side stickers too.','If your bottom two layers break, check your move notation or cube grip.'],
    practice:'Begin with the 2-look OLL subset. The library includes all 57 numbered OLL cases.'
  },
  pll: {
    goal:'After OLL, move the top-layer pieces into their final spots and solve the cube.',
    recognition:['The entire top should already be yellow.','Find headlights (two same-color corner stickers) and matching blocks on the sides.','Check which corners or edges need to swap before choosing a PLL.'],
    beginnerSteps:['Learn the six common 2-look PLL algorithms first.','Practice Ua, Ub, H and Z edge-permutation patterns.','Recognize a T-perm and compare it with other adjacent swaps.','Use the side-color diagram to choose among the 21 complete PLL cases.','Finish with a U, U2, or U′ alignment move when needed.'],
    mistakes:['Do not choose a PLL from the top face alone; it is already yellow.','A final U adjustment may still be required after a correct algorithm.','Whole-cube rotations and slice moves must be followed precisely.'],
    practice:'All 21 PLL permutations are included with numbered moves and animated 3D cases.'
  }
}

export const ACADEMY_DRILLS: readonly AcademyDrill[] = [
  {id:'right-flick',name:'U-flick rhythm',label:'BEGINNER',sequence:"R U R' U'",objective:'Learn an easy rhythm with a controlled U flick.',cues:['Keep your wrists relaxed.','Use a gentle index-finger flick on U when comfortable.','Do not force a grip that hurts.'],tip:'Aim for accurate, even turns instead of a high TPS number.'},
  {id:'left-flick',name:'Left-hand mirror',label:'FOUNDATION',sequence:"L' U' L U",objective:'Build the same control with your other hand.',cues:['Try to minimize hand repositioning.','Practice the same pace as your right-hand trigger.','Stop if your fingers feel strained.'],tip:'Symmetry makes left-side F2L easier.'},
  {id:'double-turn',name:'Half-turn accuracy',label:'EXECUTION',sequence:'U2 R2 U2 R2',objective:'Practice 180-degree turns without overshooting.',cues:['Turn to a clean, aligned face.','Feel where the layer stops.','Do not squeeze the cube too tightly.'],tip:'Clean alignment helps more than uncontrolled speed.'},
  {id:'lookahead',name:'Lookahead drill',label:'INTERMEDIATE',sequence:"R U R' U' R U R' U'",objective:'Keep your eyes moving toward the next pair.',cues:['Use 0.5× playback and mimic the rhythm.','Do not stare only at the piece you are turning.','Slow and continuous beats fast-and-stop.'],tip:'A smooth solve can be faster than a series of rushed bursts.'}
]

export function inverseAcademySequence(sequence: string): string {
  return tokenizeCubeMoves(sequence).reverse().map(move => move.endsWith('2') ? move : move.endsWith("'") ? move.slice(0,-1) : `${move}'`).join(' ')
}

export function academyPlan(sequence: string, msPerMove = 620): AiPlan {
  const moves = tokenizeCubeMoves(sequence)
  const duration = Math.max(180, Math.min(2000, msPerMove))
  const moveEndsMs = moves.map((_,i)=>(i+1)*duration)
  return {
    method:'two-phase', solution:moves.join(' '), moves,
    moveEndsMs, animationEndsMs: moves.map((_,i)=>(i+1)*1000),
    totalMs:moveEndsMs.at(-1) ?? 0, qtm:moves.reduce((total,m)=>total+(m.endsWith('2')?2:1),0), segmentsMs:[0,0,0,0]
  }
}

const validModule = (x: unknown): x is AcademyModule => typeof x === 'string' && ACADEMY_MODULES.includes(x as AcademyModule)
export function initialAcademyProgress(): AcademyProgress {
  return {completed:[],favorites:[],masteredCases:[],notationTurns:0,lastModule:'notation'}
}
export function parseAcademyProgress(input: unknown): AcademyProgress {
  const blank = initialAcademyProgress()
  if(!input || typeof input !== 'object') return blank
  const data = input as Record<string, unknown>
  const ids = new Set(ACADEMY_ALGORITHMS.map(x=>x.id))
  // Preserve favorites saved by the first Academy release.
  const legacy:Record<string,string> = {'f2l-trigger':'f2l-1','f2l-left':'f2l-2','f2l-regrip':'f2l-5',
    'oll-cross':'oll-45','sune':'oll-27','antisune':'oll-26','t-perm':'pll-t','ua-perm':'pll-ua','h-perm':'pll-h'}
  const cleanIds=(items:unknown)=>Array.isArray(items)?Array.from(new Set(items.filter((v):v is string=>typeof v==='string').map(v=>legacy[v]??v).filter(v=>ids.has(v)))):[]
  return {
    completed: Array.isArray(data.completed) ? Array.from(new Set(data.completed.filter(validModule))) : [],
    favorites: cleanIds(data.favorites),
    masteredCases: cleanIds(data.masteredCases),
    notationTurns: typeof data.notationTurns==='number'&&Number.isFinite(data.notationTurns)?Math.min(999999,Math.max(0,Math.floor(data.notationTurns))):0,
    lastModule: validModule(data.lastModule)?data.lastModule:'notation'
  }
}
export function academyProgressPercent(completed:readonly AcademyModule[]): number {
  return Math.round(100 * ACADEMY_MODULES.filter(module=>completed.includes(module)).length/ACADEMY_MODULES.length)
}
