import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import AiCube3D from './AiCube3D'
import { replayAiPlan } from '../lib/aiPlan'
import { formatTime } from '../lib/racing'
import type { RaceRecord } from '../lib/racing'
import { CFOP_LABELS, currentCfopStage } from '../lib/cfop'
import { moveIndexAt } from '../lib/aiPlan'

/** Inspect or replay the verified solution after the real race has finished. */
export default function AiSolveReplay({ record }: { record: RaceRecord & { aiSolution: string } }) {
  const plan=useMemo(()=>replayAiPlan({
    scramble:record.scramble,aiSolution:record.aiSolution,aiMs:record.aiMs,
    difficulty:record.difficulty,personality:record.personality,aiMethod:record.aiMethod,aiCfopStages:record.aiCfopStages,
  }),[record.aiMs,record.aiSolution,record.difficulty,record.personality,record.scramble])
  const [elapsed,setElapsed]=useState(0)
  const [playing,setPlaying]=useState(false)
  const [playbackSpeed,setPlaybackSpeed]=useState(0.5)
  const cursorRef=useRef(0)
  cursorRef.current=elapsed
  useEffect(()=>{
    if(!playing)return
    const from=performance.now()-cursorRef.current/playbackSpeed
    let frameId=0
    const frame=()=>{
      const next=Math.min(plan.totalMs,(performance.now()-from)*playbackSpeed)
      setElapsed(next)
      if(next>=plan.totalMs)setPlaying(false)
      else frameId=requestAnimationFrame(frame)
    }
    frameId=requestAnimationFrame(frame)
    return()=>cancelAnimationFrame(frameId)
  },[playing,plan.totalMs,playbackSpeed])
  function play(){
    if(elapsed>=plan.totalMs)setElapsed(0)
    setPlaying(true)
  }
  const activeStage=plan.cfopMarkers?.length ? CFOP_LABELS[currentCfopStage(plan.cfopMarkers,moveIndexAt(plan,elapsed))] : null
  return <div className="ai-replay-panel">
    <div className="ai-replay-player"><AiCube3D scramble={record.scramble} plan={plan} elapsedMs={elapsed}/></div>
    <div className="ai-replay-controls"><div className="row-between"><strong>3D Solution Replay {activeStage && <span className="replay-cfop-stage">· {elapsed>=plan.totalMs?'Solved':activeStage}</span>}</strong><span>{formatTime(elapsed,2)}s / {formatTime(plan.totalMs,2)}s</span></div>
      <input type="range" aria-label="Replay position" min={0} max={plan.totalMs} step={15} value={elapsed} onChange={event=>{setPlaying(false);setElapsed(Number(event.target.value))}} />
      <div className="ai-replay-speed"><span>Replay speed</span><div role="group" aria-label="Replay speed">{[0.25,0.5,1,2].map(speed=><button key={speed} type="button" className={`ai-speed-btn ${playbackSpeed===speed?'selected':''}`} aria-pressed={playbackSpeed===speed} onClick={()=>setPlaybackSpeed(speed)}>{speed}×</button>)}</div></div>
      <div className="ai-replay-actions"><button className="btn btn-primary btn-sm" onClick={()=>playing?setPlaying(false):play()}>{playing?<><Pause size={15}/> Pause</>:<><Play size={15}/> {elapsed>=plan.totalMs?'Replay':'Play Solution'}</>}</button><button className="btn btn-outline btn-sm" onClick={()=>{setPlaying(false);setElapsed(0)}}><RotateCcw size={15}/> Reset</button><small>Physical layer turns from the verified solution</small></div>
    </div>
  </div>
}
