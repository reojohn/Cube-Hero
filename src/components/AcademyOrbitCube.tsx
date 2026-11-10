import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { Hand, RotateCcw } from 'lucide-react'
import AiCube3D from './AiCube3D'
import type { AiPlan } from '../lib/aiPlan'

/** Academy-only orbit camera. The cube's actual sticker state and turn animation
 * are still provided by AiCube3D; dragging changes only the viewing angle.
 * Race AI, Ghost Race, and solution replays keep their existing fixed camera.
 */
const DEFAULT_VIEW = { x: -25, y: -35 }
const PITCH_LIMIT = 85
const DRAG_SENSITIVITY = 0.52
const KEYBOARD_STEP = 15
const clamp = (value:number,min:number,max:number) => Math.max(min,Math.min(max,value))
// Keeping yaw within one revolution avoids runaway angles after long drags.
const wrap = (value:number) => ((value + 180) % 360 + 360) % 360 - 180

type Props = {
  scramble: string
  plan: AiPlan
  elapsedMs: number
  reducedMotion?: boolean
}

export default function AcademyOrbitCube({ scramble, plan, elapsedMs, reducedMotion = false }: Props) {
  const [view, setView] = useState(DEFAULT_VIEW)
  const [dragging, setDragging] = useState(false)
  const pointer = useRef<{ id:number;x:number;y:number }|null>(null)
  const changed = Math.abs(view.x-DEFAULT_VIEW.x)>0.5 || Math.abs(view.y-DEFAULT_VIEW.y)>0.5

  const beginDrag = useCallback((event:ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    pointer.current = {id:event.pointerId,x:event.clientX,y:event.clientY}
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  },[])
  const moveDrag = useCallback((event:ReactPointerEvent<HTMLDivElement>) => {
    if (!pointer.current || pointer.current.id !== event.pointerId) return
    const dx=event.clientX-pointer.current.x
    const dy=event.clientY-pointer.current.y
    pointer.current={id:event.pointerId,x:event.clientX,y:event.clientY}
    setView(previous=>({
      x:clamp(previous.x-dy*DRAG_SENSITIVITY,-PITCH_LIMIT,PITCH_LIMIT),
      y:wrap(previous.y+dx*DRAG_SENSITIVITY)
    }))
  },[])
  const endDrag = useCallback((event:ReactPointerEvent<HTMLDivElement>) => {
    if (!pointer.current || pointer.current.id!==event.pointerId) return
    pointer.current=null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  },[])
  const resetView = useCallback(() => {pointer.current=null;setDragging(false);setView(DEFAULT_VIEW)},[])
  const onKeys = useCallback((event:ReactKeyboardEvent<HTMLDivElement>)=>{
    if (event.target!==event.currentTarget) return
    let update:null|{x:number;y:number}=null
    switch(event.key){
      case 'ArrowLeft':update={x:0,y:-KEYBOARD_STEP};break
      case 'ArrowRight':update={x:0,y:KEYBOARD_STEP};break
      case 'ArrowUp':update={x:-KEYBOARD_STEP,y:0};break
      case 'ArrowDown':update={x:KEYBOARD_STEP,y:0};break
      case 'Home':resetView();event.preventDefault();return
      default:return
    }
    event.preventDefault()
    const delta=update
    setView(previous=>({x:clamp(previous.x+delta.x,-PITCH_LIMIT,PITCH_LIMIT),y:wrap(previous.y+delta.y)}))
  },[resetView])

  return <div className={`academy-orbit ${dragging?'is-dragging':''} ${reducedMotion?'reduced-motion':''}`}
      role="group" tabIndex={0}
      aria-label="Interactive Rubik's Cube. Drag with the mouse or a finger to view other sides. Use arrow keys to rotate; press Home to reset."
      onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
      onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={onKeys}>
    <AiCube3D scramble={scramble} plan={plan} elapsedMs={elapsedMs} viewRotation={view}/>
    <span className="academy-orbit-hint" aria-hidden="true"><Hand size={13}/>{dragging?'Rotating cube…':'Drag to rotate · Touch to explore'}</span>
    <button className="academy-orbit-reset" type="button" title="Reset 3D view" aria-label="Reset cube view to front, right, and top"
      disabled={!changed}
      onPointerDown={event=>event.stopPropagation()}
      onPointerUp={event=>event.stopPropagation()}
      onClick={event=>{event.stopPropagation();resetView()}}>
      <RotateCcw size={14}/> Reset view
    </button>
  </div>
}
