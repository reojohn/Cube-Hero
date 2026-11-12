import { memo } from 'react'
import type { GraphicsQuality } from '../lib/graphicsQuality'

const swatches: Record<string, string> = {
  y:'#ffda47', w:'#f5f5ff', b:'#3185fd', r:'#f1435b', g:'#19cf86', o:'#ff9447',
}
const cubeColors: Record<'top'|'left'|'right', readonly string[]> = {
  top: ['y','y','b','y','b','y','o','y','w'],
  left: ['r','b','b','b','o','b','b','b','w'],
  right: ['g','r','r','r','r','g','r','o','r'],
}
type Point = readonly [number,number]
function between(a: Point,b:Point,t:number):Point{return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
function spot(corners: readonly [Point,Point,Point,Point],u:number,v:number):Point{
  return between(between(corners[0],corners[1],u),between(corners[3],corners[2],u),v)
}
function pointsFor(corners:readonly [Point,Point,Point,Point],x:number,y:number):string{
  return [spot(corners,x/3,y/3),spot(corners,(x+1)/3,y/3),spot(corners,(x+1)/3,(y+1)/3),spot(corners,x/3,(y+1)/3)]
    .map(point=>point.map(n=>n.toFixed(2)).join(',')).join(' ')
}
const faces:readonly {name:'top'|'left'|'right';vertices:readonly [Point,Point,Point,Point]}[] = [
  {name:'top',vertices:[[74,9],[132,34],[74,60],[16,34]]},
  {name:'left',vertices:[[16,34],[74,60],[74,118],[16,92]]},
  {name:'right',vertices:[[74,60],[132,34],[132,92],[74,118]]},
]
/** Static, inexpensive SVG previews: do not mount extra racing cube renderers. */
export default memo(function GraphicsCubePreview({quality}:{quality:GraphicsQuality}){
  return <span className={`ch-graphics-preview ch-graphics-preview-${quality}`} aria-hidden="true">
    <svg className="ch-graphics-preview-cube" viewBox="0 0 148 128" focusable="false">
      {faces.map(face=><g key={face.name} className={`ch-graphics-preview-face-${face.name}`}>
        {cubeColors[face.name].map((color,i)=><polygon key={i}
          points={pointsFor(face.vertices,i%3,Math.floor(i/3))}
          fill={swatches[color]} stroke="#16192d" strokeWidth={quality==='low'?1.3:quality==='medium'?1.45:1.6} strokeLinejoin="round" />)}
      </g>)}
    </svg>
    <span className="ch-graphics-preview-floor" />
  </span>
})
