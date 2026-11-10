/** Validates that every CSS slice rotation lands on the *same* 54-sticker
 * cube state as the verified face-turn engine. Run: node scripts/test-turning-cube.mjs
 */
import assert from 'node:assert/strict'
import { loadTestModules } from './ts-test-loader.mjs'
const load = loadTestModules()
const { cubeFacesAt } = await load('cubeState')
const { cubiesFromFaces, turnAt, inTurningLayer } = await load('cubeTurning')
const FACE_NORMALS = { U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1] }
function face(normal) {
  const found = Object.entries(FACE_NORMALS).find(([,n])=>n.every((v,i)=>v===normal[i]))
  assert.ok(found,'must have valid face normal')
  return found[0]
}
function indexOf(f,p) {
  const [x,y,z]=p
  if(f==='F')return (1-y)*3+x+1
  if(f==='B')return (1-y)*3+1-x
  if(f==='U')return (z+1)*3+x+1
  if(f==='D')return (1-z)*3+x+1
  if(f==='R')return (1-y)*3+1-z
  return (1-y)*3+z+1
}
function rotate(v,axis,sign) {
  const [x,y,z]=v
  if(axis==='X')return sign===1?[x,-z,y]:[x,z,-y]
  if(axis==='Y')return sign===1?[z,y,-x]:[-z,y,x]
  return sign===1?[-y,x,z]:[y,-x,z]
}
function renderedAfter(scramble,move){
  const plan={moves:[move],moveEndsMs:[1000],totalMs:1000}
  const turn=turnAt(plan,999.99999)
  assert.equal(turn.move,move)
  const quarterTurns=Math.round(turn.degrees/90)
  assert.equal(Math.abs(quarterTurns),move.includes('2')?2:1)
  const signCss=quarterTurns<0?-1:1
  const signModel=turn.axis==='Y'?signCss:-signCss
  const output={U:Array(9),D:Array(9),R:Array(9),L:Array(9),F:Array(9),B:Array(9)}
  const positions=[]
  for(const cubie of cubiesFromFaces(cubeFacesAt(scramble))){
    let position=[cubie.x,cubie.y,cubie.z]
    const turning=inTurningLayer(cubie,turn.axis,turn.layers)
    if(turning){for(let i=0;i<Math.abs(quarterTurns);i++)position=rotate(position,turn.axis,signModel)}
    positions.push(position.join(','))
    for(const [localFace,color] of Object.entries(cubie.stickers)){
      let normal=FACE_NORMALS[localFace]
      if(turning){for(let i=0;i<Math.abs(quarterTurns);i++)normal=rotate(normal,turn.axis,signModel)}
      const f=face(normal)
      output[f][indexOf(f,position)]=color
    }
  }
  assert.equal(new Set(positions).size,26,'pieces cannot intersect after a complete turn')
  return output
}
const scrambles=[
  "R U R' U'",
  "F2 R F R2 F R U B R' B' L2 D2 R2 F L U' R' U2",
  "U2 B2 R2 F' D' B L R' F U' B2",
]
let seed=12343213
const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed}
for(let i=0;i<18;i++) scrambles.push(Array.from({length:25},()=>`${'URFDLB'[next()%6]}${['',"'",'2'][next()%3]}`).join(' '))
let checked=0
for(const scramble of scrambles) for(const f of 'URFDLB') for(const suffix of ['',"'",'2']){
  const move=f+suffix
  assert.deepEqual(renderedAfter(scramble,move),cubeFacesAt(scramble,[move],1),`slice rotation does not match sticker model for ${move}`)
  checked++
}
for(const time of [0,250,500,750,999,1000]){
  const pose=turnAt({moves:['R'],moveEndsMs:[1000],totalMs:1000},time)
  assert.equal(pose.completed,time===1000?1:0)
  if(time===500) assert.equal(pose.degrees,45)
}
console.log(`PASS: ${checked} physical slice rotations (all 18 move forms), piece positions, sticker orientations and replay timestamps.`)

// The CFOP engine emits rotations, slice turns, and wide turns; all physically
// selected cubelets must match the exact 54-sticker state after these moves.
const extraBases = ['M','E','S','x','y','z','r','l','u','d','f','b','Rw','Uw']
let extra = 0
for (const scramble of scrambles.slice(0,5)) for(const base of extraBases) for(const suffix of ['',"'",'2']) {
  const move=base+suffix
  assert.deepEqual(renderedAfter(scramble,move),cubeFacesAt(scramble,[move],1),`CFOP animation state mismatch for ${move}`)
  extra++
}
console.log(`PASS: ${extra} extra wide/slice/rotation animation cases.`)
