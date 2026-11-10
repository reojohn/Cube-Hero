import { useId } from 'react'

type Point = [number, number]
type Corners = [Point, Point, Point, Point] // top-left, top-right, bottom-right, bottom-left

type CubeArtProps = {
  variant?: 'hero' | 'scrambled'
  className?: string
  ariaLabel?: string
}

const top: Corners = [[234, 42], [382, 116], [248, 190], [101, 117]]
const left: Corners = [[101, 117], [248, 190], [248, 353], [101, 278]]
const right: Corners = [[248, 190], [382, 116], [382, 279], [248, 353]]
const faceColors = {
  yellow: ['#ffe26a', '#ffce24', '#f4bc14', '#ffea86', '#ffd83b', '#f9bb12', '#ffdf59', '#ffd52d', '#f6bf16'],
  blue: ['#3688ff', '#2f69f4', '#2564ec', '#407dff', '#276cf9', '#1d53da', '#317cff', '#1e64ee', '#1647c2'],
  red: ['#f95b61', '#fb404c', '#d91d32', '#fe626a', '#fa3346', '#d7283a', '#ed424d', '#d92033', '#b5162b'],
}
const scrambleColors = ['#f9d33e', '#40aa78', '#287bfe', '#f05b4c', '#ffffff', '#f7ae2c', '#4fcd91', '#f8d33e', '#d8e1ff']

function at(c: Corners, u: number, v: number): Point {
  const x = (1-u)*(1-v)*c[0][0] + u*(1-v)*c[1][0] + u*v*c[2][0] + (1-u)*v*c[3][0]
  const y = (1-u)*(1-v)*c[0][1] + u*(1-v)*c[1][1] + u*v*c[2][1] + (1-u)*v*c[3][1]
  return [x,y]
}
function tile(c: Corners, row: number, col: number, gap = .012) {
  const u0 = col/3 + gap, u1=(col+1)/3-gap, v0=row/3+gap, v1=(row+1)/3-gap
  return [at(c,u0,v0),at(c,u1,v0),at(c,u1,v1),at(c,u0,v1)].map(p=>p.join(',')).join(' ')
}

export default function CubeArt({ variant='hero', className='', ariaLabel='3D illustrated Rubik’s Cube' }: CubeArtProps) {
  const id=useId().replace(/:/g,'')
  const faces = [
    { corners: top, colors: variant==='hero'?faceColors.yellow:scrambleColors },
    { corners: left, colors: variant==='hero'?faceColors.blue:[scrambleColors[2],scrambleColors[6],scrambleColors[1],scrambleColors[8],scrambleColors[3],scrambleColors[4],scrambleColors[0],scrambleColors[1],scrambleColors[2]] },
    { corners: right, colors: variant==='hero'?faceColors.red:[scrambleColors[5],scrambleColors[0],scrambleColors[3],scrambleColors[4],scrambleColors[7],scrambleColors[2],scrambleColors[1],scrambleColors[3],scrambleColors[8]] },
  ]
  return <svg viewBox="0 0 485 405" className={`cube-art ${className}`} role="img" aria-label={ariaLabel}>
    <defs>
      <radialGradient id={`${id}glow`}><stop offset="0" stopColor="#8c42ff" stopOpacity=".7"/><stop offset="1" stopColor="#7a35ff" stopOpacity="0"/></radialGradient>
      <filter id={`${id}shadow`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="17"/></filter>
      <filter id={`${id}cubeShadow`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="7" dy="19" stdDeviation="14" floodColor="#03020d" floodOpacity=".9"/></filter>
      <linearGradient id={`${id}shine`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="white" stopOpacity=".27"/><stop offset=".5" stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="#0c0721" stopOpacity=".22"/></linearGradient>
    </defs>
    <ellipse cx="240" cy="324" rx="214" ry="76" fill={`url(#${id}glow)`} />
    <ellipse cx="251" cy="353" rx="120" ry="20" fill="#060415" opacity=".8" filter={`url(#${id}shadow)`} />
    <ellipse cx="241" cy="220" rx="198" ry="76" fill="none" stroke="#a652ff" strokeWidth="2.5" transform="rotate(-19 241 220)" opacity=".35" />
    <ellipse cx="241" cy="220" rx="198" ry="76" fill="none" stroke="#aa61ff" strokeWidth="3.5" transform="rotate(-19 241 220)" strokeDasharray="475 760" strokeLinecap="round" opacity=".75" />
    <g className="floating-cube" filter={`url(#${id}cubeShadow)`}>
      {faces.map((face,faceIndex)=><g key={faceIndex}>
        <polygon points={face.corners.map(p=>p.join(',')).join(' ')} fill="#080a15" stroke="#050714" strokeWidth="12" strokeLinejoin="round" />
        {Array.from({length:9},(_,i)=><polygon key={i} points={tile(face.corners,Math.floor(i/3),i%3)} fill={face.colors[i]} stroke="#131522" strokeWidth="2" strokeLinejoin="round" />)}
        <polygon points={face.corners.map(p=>p.join(',')).join(' ')} fill={`url(#${id}shine)`} opacity={faceIndex===1?.25:.3} pointerEvents="none" />
      </g>)}
      <path d="M101 117 234 42 382 116 382 279 248 353 101 278Z" fill="none" stroke="#0b0d1d" strokeWidth="6" strokeLinejoin="round" />
      <path d="M101 117 248 190 382 116 M248 190V353" stroke="#0b0d1d" strokeWidth="7" fill="none" />
    </g>
    <circle cx="413" cy="71" r="3" fill="#af79ff" opacity=".8" />
    <circle cx="58" cy="238" r="2.7" fill="#7b57fd" opacity=".7" />
    <circle cx="391" cy="347" r="2" fill="#c69bff" opacity=".8" />
  </svg>
}
