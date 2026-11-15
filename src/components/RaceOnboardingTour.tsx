import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react'
import './RaceOnboardingTour.css'

/** Distinct from race preferences: skipping or finishing never changes saved gameplay data. */
export const RACE_TOUR_STORAGE_KEY = 'cube-hero-race-ai-tour-v1'
export type RaceTourStep = 0 | 1 | 2 | 3 | 4 | 5 | 6

type Guide = {
  page: 'home' | 'race' | 'room'
  target: string
  title: string
  description: string
  prompt: string
}
const GUIDE: readonly Guide[] = [
  {page:'home', target:'home', title:'Your first AI challenge', description:'Start here to build your first race against an AI speedcuber.', prompt:'Tap Set Up a Race'},
  {page:'race', target:'customize', title:'Make it your race', description:'Choose the AI speed, racing style, and number of opponents. We’ll guide you through each choice.', prompt:'Tap Customize race'},
  {page:'race', target:'rival', title:'Choose your challenger', description:'Pick any of the 55 rivals. Their Sub number sets the speed you’ll race against.', prompt:'Tap a rival portrait'},
  {page:'race', target:'personality', title:'Pick an AI personality', description:'Casual varies more, Balanced is realistic, and Competitive solves more consistently.', prompt:'Choose any personality'},
  {page:'race', target:'count', title:'One rival or ten?', description:'Choose how many AIs you want to race. Everyone gets the same scramble.', prompt:'Select an opponent count'},
  {page:'race', target:'start', title:'Your race is ready!', description:'The next screen introduces your opponent before you enter the live arena.', prompt:'Tap Start Race'},
  {page:'room', target:'inspect', title:'Scramble, then inspect', description:'Apply the displayed moves to your physical 3×3. When ready, start inspection. Hold the timer for 1.5 seconds and release to begin solving.', prompt:'Tap I’m Scrambled — Inspect'},
]

type TargetRect = { left:number; top:number; right:number; bottom:number; width:number; height:number;vw:number;vh:number;disabled:boolean }
const PAD = 7
const clamp=(n:number,min:number,max:number)=>Math.min(Math.max(n,min),max)

export default function RaceOnboardingTour({step,page,onSkip,reducedMotion}:{step:RaceTourStep;page:string;onSkip:()=>void;reducedMotion:boolean}){
  const guide=GUIDE[step]
  const [rect,setRect]=useState<TargetRect|null>(null)
  // Never cover unrelated pages, VS animation, or loading/transition states.
  const visible=guide.page===page

  useEffect(()=>{
    if(!visible){setRect(null);return}
    let active=true
    let frame=0
    let delay=0
    let observer:ResizeObserver|null=null
    let attributesObserver:MutationObserver|null=null
    const selector=`[data-race-tour="${guide.target}"]`
    const element=document.querySelector<HTMLElement>(selector)
    if(!element){setRect(null);return}

    const measure=()=>{
      if(!active)return
      const bounds=element.getBoundingClientRect()
      const vw=document.documentElement.clientWidth
      const vh=window.innerHeight
      if(bounds.width<=0||bounds.height<=0){setRect(null);return}
      const left=clamp(bounds.left-PAD,0,vw)
      const top=clamp(bounds.top-PAD,0,vh)
      const right=clamp(bounds.right+PAD,0,vw)
      const bottom=clamp(bounds.bottom+PAD,0,vh)
      setRect({left,top,right,bottom,width:right-left,height:bottom-top,vw,vh,disabled:element.matches(':disabled')})
    }
    const schedule=()=>{window.cancelAnimationFrame(frame);frame=window.requestAnimationFrame(measure)}
    // Large roster scroll areas should start below the sticky navigation.
    const block=guide.target==='rival'?'start':'center'
    element.scrollIntoView({behavior:reducedMotion||window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block,inline:'nearest'})
    schedule()
    delay=window.setTimeout(schedule,reducedMotion?25:450)
    if(typeof ResizeObserver!=='undefined'){
      observer=new ResizeObserver(schedule)
      observer.observe(element)
    }
    // The inspect button becomes enabled asynchronously when the CFOP solution is ready.
    if(typeof MutationObserver!=='undefined'){
      attributesObserver=new MutationObserver(schedule)
      attributesObserver.observe(element,{attributes:true,attributeFilter:['disabled']})
    }
    window.addEventListener('scroll',schedule,true)
    window.addEventListener('resize',schedule)
    window.visualViewport?.addEventListener('resize',schedule)
    return()=>{
      active=false
      window.cancelAnimationFrame(frame)
      window.clearTimeout(delay)
      observer?.disconnect()
      attributesObserver?.disconnect()
      window.removeEventListener('scroll',schedule,true)
      window.removeEventListener('resize',schedule)
      window.visualViewport?.removeEventListener('resize',schedule)
    }
  },[guide.target,visible,reducedMotion])

  useEffect(()=>{
    if(!visible)return
    const handleEscape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();onSkip()}
    }
    window.addEventListener('keydown',handleEscape)
    return()=>window.removeEventListener('keydown',handleEscape)
  },[onSkip,visible])

  if(!visible||!rect||rect.width===0||rect.height===0)return null
  const top={top:0,left:0,width:rect.vw,height:rect.top}
  const bottom={top:rect.bottom,left:0,width:rect.vw,height:rect.vh-rect.bottom}
  const left={top:rect.top,left:0,width:rect.left,height:rect.height}
  const right={top:rect.top,left:rect.right,width:rect.vw-rect.right,height:rect.height}
  const bubbleWidth=Math.min(342,rect.vw-24)
  const bubbleHeight=190
  const bubbleLeft=clamp(rect.left,12,Math.max(12,rect.vw-bubbleWidth-12))
  const bubbleTop=rect.vh-rect.bottom>=bubbleHeight+17
    ? rect.bottom+12
    : rect.top>=bubbleHeight+17
      ? rect.top-bubbleHeight-12
      : Math.max(12,rect.vh-bubbleHeight-12)

  return createPortal(<div className="ch-tour-root" aria-label="Interactive Race AI tutorial">
    {[top,bottom,left,right].map((area,index)=><div key={index} className="ch-tour-shade" style={area} aria-hidden="true"/>) }
    <div className="ch-tour-outline" aria-hidden="true" style={{top:rect.top,left:rect.left,width:rect.width,height:rect.height}}/>
    <section className="ch-tour-bubble" role="dialog" aria-modal="false" aria-labelledby="ch-tour-title" aria-describedby="ch-tour-description" style={{top:bubbleTop,left:bubbleLeft,width:bubbleWidth}}>
      <div className="ch-tour-bubble-top"><span><Sparkles size={13}/> CUBEHERO QUICK START</span><span>STEP {step+1} / 7</span></div>
      <h2 id="ch-tour-title">{guide.title}</h2>
      <p id="ch-tour-description">{guide.description}</p>
      <div className="ch-tour-bubble-actions"><span className="ch-tour-action-hint">{rect.disabled?'Preparing your AI solution…':<><ArrowRight size={14}/> {guide.prompt}</>}</span><button type="button" onClick={onSkip} aria-label="Skip the Race AI tutorial"><X size={14}/> Skip tour</button></div>
      <div className="ch-tour-progress" aria-label={`Tutorial progress ${step+1} of 7`}>{GUIDE.map((_,i)=><span key={i} className={i<=step?'active':''}/>)}</div>
    </section>
    <span className="ch-tour-sr-only"><CheckCircle2 size={12}/> Follow the highlighted control to continue. Press Escape to skip.</span>
  </div>,document.body)
}
