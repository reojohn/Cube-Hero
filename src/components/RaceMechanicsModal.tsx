import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { BrainCircuit, Check, Clock3, Ghost, ShieldCheck, Sparkles, X } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

type Mode = 'ai' | 'ghost'
type Props = { open: boolean; mode: Mode; onClose: () => void }
type Step = { title: string; detail: string }

const guides: Record<Mode, { eyebrow:string; title:string; subtitle:string; tagline:string; tip:string; steps:Step[] }> = {
  ai: {
    eyebrow: 'RACE AI · QUICK GUIDE', title: 'How Race AI works',
    subtitle: 'Race your cube against one or more AI rivals.',
    tagline: 'Same scramble. Fastest time wins.',
    steps: [
      { title: 'Choose your rivals', detail: 'Pick a Sub level, an AI style, and 1–10 opponents.' },
      { title: 'Scramble your cube', detail: 'Follow the scramble shown. Every AI uses it too.' },
      { title: 'Start inspection', detail: 'Press “I’m Scrambled — Inspect” when you’re ready.' },
      { title: 'Hold, then release', detail: 'Look at your cube. Hold Space or the timer for 1.5 seconds, then let go.' },
      { title: 'Solve and compare', detail: 'Solve your cube. Press Space or tap to stop and see who wins.' },
    ],
    tip: 'Start within 15 seconds of inspection to avoid a time penalty.'
  },
  ghost: {
    eyebrow: 'GHOST RACE · QUICK GUIDE', title: 'How Ghost Race works',
    subtitle: 'Challenge your own fastest solve.',
    tagline: 'Your personal best becomes your rival.',
    steps: [
      { title: 'Create your ghost', detail: 'Record 3 solves. Your fastest valid time becomes your ghost.' },
      { title: 'Scramble your cube', detail: 'Follow the new scramble. Your ghost gets the same one.' },
      { title: 'Start inspection', detail: 'Press “I’m Scrambled — Inspect” when you’re ready.' },
      { title: 'Hold, then release', detail: 'Look at your cube. Hold Space or the timer for 1.5 seconds, then let go.' },
      { title: 'Beat your best', detail: 'Your ghost cube turns as you race. Finish faster to set a new best.' },
    ],
    tip: 'Beat your best time, and your ghost automatically gets faster next round.'
  }
}

const stepIcons: ReactNode[] = [
  <BrainCircuit size={17}/>, <Sparkles size={17}/>, <Clock3 size={17}/>,
  <ShieldCheck size={17}/>, <Check size={17}/>
]

export default function RaceMechanicsModal({open, mode, onClose}:Props){
  const closeRef = useRef(onClose)
  const okRef = useRef<HTMLButtonElement>(null)
  closeRef.current = onClose
  useEffect(()=>{
    if(!open)return
    const previouslyFocused=document.activeElement instanceof HTMLElement?document.activeElement:null
    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    okRef.current?.focus({preventScroll:true})
    const handleKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();closeRef.current()}
    }
    window.addEventListener('keydown',handleKey)
    return()=>{
      window.removeEventListener('keydown',handleKey)
      document.body.style.overflow=previousOverflow
      if(previouslyFocused?.isConnected)previouslyFocused.focus({preventScroll:true})
    }
  },[open])

  if(!open)return null
  const guide=guides[mode]
  const tint=mode==='ghost'?'#c99bff':'#b6a3ff'
  const icon=mode==='ghost'?<Ghost size={19}/>:<BrainCircuit size={19}/>
  const overlay:CSSProperties={
    position:'fixed',inset:0,zIndex:2147482000,
    boxSizing:'border-box',display:'flex',alignItems:'center',justifyContent:'center',
    padding:'12px',overflowY:'auto',
    background:'rgba(4,6,19,.88)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'
  }
  const panel:CSSProperties={
    width:'min(610px,100%)',maxHeight:'calc(100dvh - 24px)',
    margin:'auto',overflowY:'auto',boxSizing:'border-box',
    borderRadius:'22px',border:'1px solid rgba(184,143,254,.61)',
    background:'linear-gradient(150deg,#241d42 0%,#18182f 50%,#111729 100%)',
    boxShadow:'0 28px 75px rgba(0,0,0,.68),0 0 55px rgba(121,71,255,.22)',
    color:'#f8f5ff',position:'relative',isolation:'isolate',fontFamily:'inherit'
  }
  return createPortal(<div style={overlay} data-race-mechanics-overlay onPointerDown={event=>{
    if(event.target===event.currentTarget)closeRef.current()
  }}>
    <section role="dialog" aria-modal="true" aria-labelledby="race-mechanics-title" aria-describedby="race-mechanics-description" style={panel} className="cubehero-mechanics-panel">
      <div aria-hidden="true" style={{position:'absolute',inset:'0 0 auto',height:'135px',borderRadius:'inherit',pointerEvents:'none',background:'radial-gradient(ellipse at 48% 0,rgba(160,99,255,.28),transparent 75%)'}}/>
      <div style={{position:'relative',padding:'clamp(15px, 2.3vw, 22px)',display:'flex',flexDirection:'column',gap:'11px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'14px'}}>
          <div style={{minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'10px',fontWeight:850,letterSpacing:'1.2px',color:tint}}>{icon}{guide.eyebrow}</div>
            <h2 id="race-mechanics-title" style={{margin:'7px 0 3px',fontSize:'clamp(23px,3.7vw,29px)',fontWeight:850,lineHeight:1.14,letterSpacing:'-.75px'}}>{guide.title}</h2>
            <p id="race-mechanics-description" style={{margin:0,color:'#c2cce5',fontSize:'12.5px',lineHeight:1.45}}>{guide.subtitle}</p>
          </div>
          <button type="button" aria-label="Close guide" onClick={()=>closeRef.current()} style={{flexShrink:0,width:'34px',height:'34px',display:'grid',placeItems:'center',borderRadius:'11px',border:'1px solid #62517f',background:'rgba(255,255,255,.06)',color:'#eee5ff',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'9px',padding:'9px 11px',background:'linear-gradient(110deg,rgba(107,69,186,.3),rgba(124,61,168,.14))',border:'1px solid #63508e',borderRadius:'12px'}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:'8px',fontWeight:750,fontSize:'12px',lineHeight:1.3}}>{icon}{guide.tagline}</span>
          <span style={{flexShrink:0,fontSize:'10px',fontWeight:800,borderRadius:'99px',border:'1px solid #7855a8',background:'rgba(141,80,216,.3)',padding:'5px 8px',color:'#e8d8ff'}}>{mode==='ai'?'YOU vs AI':'YOU vs YOU'}</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
          {guide.steps.map((step,i)=><div key={step.title} style={{display:'flex',alignItems:'center',gap:'10px',minHeight:'48px',boxSizing:'border-box',padding:'8px 10px',borderRadius:'11px',border:'1px solid #41395f',background:'rgba(23,25,47,.8)'}}>
            <span aria-hidden="true" style={{width:'32px',height:'32px',flex:'0 0 32px',display:'grid',placeItems:'center',borderRadius:'10px',background:'linear-gradient(135deg,#52338c,#392953)',color:'#d8bbff',border:'1px solid #694b9d'}}>{stepIcons[i]}</span>
            <div style={{minWidth:0}}><div style={{fontWeight:800,color:'#f9f5ff',fontSize:'13px',lineHeight:1.2}}>{i+1}. {step.title}</div><p style={{margin:'3px 0 0',color:'#c1cae2',fontSize:'12px',lineHeight:1.4}}>{step.detail}</p></div>
          </div>)}
        </div>
        <p style={{margin:0,padding:'9px 11px',display:'flex',alignItems:'flex-start',gap:'8px',background:'rgba(14,66,50,.37)',border:'1px solid #2b7662',borderRadius:'10px',color:'#b7f5dc',fontSize:'11.5px',lineHeight:1.4}}><ShieldCheck size={16} style={{flexShrink:0}}/><span>{guide.tip}</span></p>
        <button ref={okRef} type="button" onClick={()=>closeRef.current()} style={{width:'100%',minHeight:'43px',border:'1px solid #c79cfc',borderRadius:'12px',background:'linear-gradient(100deg,#6654f7,#a13aed)',color:'#fff',fontSize:'13px',fontWeight:850,boxShadow:'0 10px 25px rgba(130,69,234,.3)',cursor:'pointer'}}>OK, I understand</button>
      </div>
    </section>
  </div>,document.body)
}
