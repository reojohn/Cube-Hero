import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, MouseEvent } from 'react'
import { AlertTriangle, Ghost, RotateCcw, ShieldCheck, X } from 'lucide-react'

type Props = {
  open: boolean
  qualifyingSolves: number
  duels: number
  onCancel: () => void
  onConfirm: () => void
}

/** Self-contained premium confirmation to avoid native window.confirm() and stale global CSS. */
export default function GhostResetModal({ open, qualifyingSolves, duels, onCancel, onConfirm }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const cancelRefCallback = useRef(onCancel)
  cancelRefCallback.current = onCancel

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus({preventScroll:true})

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancelRefCallback.current()
      }
      // Keep keyboard focus inside the confirmation.
      if (event.key === 'Tab' && dialogRef.current) {
        const elements = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
        if (!elements.length) return
        const first = elements[0], last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();first.focus()
        }
      }
    }
    document.addEventListener('keydown',handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown',handleKey)
      if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true})
    }
  }, [open])

  if (!open) return null

  const backdrop: CSSProperties = {
    position:'fixed',inset:0,zIndex:2147482500,boxSizing:'border-box',
    display:'flex',alignItems:'center',justifyContent:'center',
    padding:'clamp(12px, 3vw, 24px)',background:'rgba(4,6,18,.88)',
    backdropFilter:'blur(13px)',WebkitBackdropFilter:'blur(13px)',
    overflowY:'auto',overscrollBehavior:'contain',
  }
  const panel: CSSProperties = {
    position:'relative',boxSizing:'border-box',isolation:'isolate',
    width:'100%',maxWidth:'500px',maxHeight:'calc(100dvh - 30px)',
    margin:'auto',overflowY:'auto',border:'1px solid rgba(188,141,255,.55)',
    borderRadius:'23px',padding:'clamp(19px, 4vw, 28px)',
    background:'linear-gradient(150deg,#24203d 0%,#17192e 54%,#111729 100%)',
    boxShadow:'0 34px 100px rgba(0,0,0,.70),0 0 80px rgba(133,76,250,.22)',
    color:'#f8f6ff',fontFamily:'inherit',
  }
  const buttonBase: CSSProperties = {
    minHeight:'47px',borderRadius:'12px',font:'inherit',fontSize:'13px',
    fontWeight:800,cursor:'pointer',display:'inline-flex',gap:'8px',
    alignItems:'center',justifyContent:'center',padding:'12px 15px',
    flex:'1 1 170px',
  }
  const closeOutside = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onCancel()
  }

  return createPortal(
    <div style={backdrop} onClick={closeOutside} data-cubehero-ghost-reset-modal="1">
      <section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="ghost-reset-title" aria-describedby="ghost-reset-description" style={panel}>
        <div aria-hidden="true" style={{position:'absolute',pointerEvents:'none',zIndex:0,inset:'0 0 auto',height:'145px',borderRadius:'inherit',background:'radial-gradient(ellipse at 50% 0%,rgba(184,96,255,.25),transparent 73%)'}} />
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',marginBottom:'16px'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'7px',color:'#c5a2ff',fontWeight:850,letterSpacing:'1.2px',fontSize:'11px'}}><Ghost size={17}/> GHOST RACE · RESET</span>
            <button type="button" onClick={onCancel} aria-label="Close reset confirmation" style={{width:'37px',height:'37px',flexShrink:0,border:'1px solid #655981',borderRadius:'11px',display:'grid',placeItems:'center',color:'#e8deff',background:'#ffffff0a',cursor:'pointer'}}><X size={19}/></button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'13px',marginBottom:'11px'}}>
            <div style={{width:'48px',height:'48px',display:'grid',placeItems:'center',border:'1px solid #b66589',borderRadius:'14px',background:'linear-gradient(150deg,#6e2d50,#41203d)',color:'#ffb4ce',flexShrink:0}}><AlertTriangle size={25}/></div>
            <div><h2 id="ghost-reset-title" style={{margin:0,lineHeight:1.2,fontSize:'clamp(20px,4.5vw,25px)',letterSpacing:'-.6px',fontWeight:850}}>Reset your Ghost Race?</h2></div>
          </div>
          <p id="ghost-reset-description" style={{color:'#c3cce1',fontSize:'13px',lineHeight:1.65,margin:'0 0 17px'}}>
            You will lose your three qualifying solves, personal best, and Ghost Race history saved in this browser. <strong style={{color:'#ffb9ca'}}>This cannot be undone.</strong>
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'10px',marginBottom:'14px'}}>
            <div style={{padding:'13px',background:'#181e35',border:'1px solid #45445f',borderRadius:'12px',textAlign:'center'}}><div style={{fontSize:'24px',fontWeight:850,lineHeight:1.1,fontVariantNumeric:'tabular-nums'}}>{qualifyingSolves}</div><div style={{color:'#aeb9d1',fontSize:'10px',marginTop:'5px'}}>QUALIFYING SOLVES</div></div>
            <div style={{padding:'13px',background:'#181e35',border:'1px solid #45445f',borderRadius:'12px',textAlign:'center'}}><div style={{fontSize:'24px',fontWeight:850,lineHeight:1.1,fontVariantNumeric:'tabular-nums'}}>{duels}</div><div style={{color:'#aeb9d1',fontSize:'10px',marginTop:'5px'}}>GHOST RACES</div></div>
          </div>
          <div style={{display:'flex',gap:'9px',alignItems:'flex-start',padding:'11px 12px',background:'rgba(15,78,64,.28)',border:'1px solid rgba(68,197,158,.34)',borderRadius:'11px',color:'#a4f3d3',fontSize:'12px',lineHeight:1.55}}><ShieldCheck size={18} style={{flexShrink:0,marginTop:'1px'}}/> Your AI Race results and statistics will not be affected.</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginTop:'20px'}}>
            <button ref={cancelRef} type="button" onClick={onCancel} style={{...buttonBase,border:'1px solid #6c6388',background:'#24213d',color:'#f5efff'}}>Cancel · Keep Progress</button>
            <button type="button" onClick={onConfirm} style={{...buttonBase,border:'1px solid #ff9eb9',background:'linear-gradient(115deg,#ab3d6e,#df4771)',boxShadow:'0 10px 25px rgba(209,65,109,.22)',color:'#fff'}}><RotateCcw size={17}/> Yes, Reset Progress</button>
          </div>
        </div>
      </section>
    </div>,document.body,
  )
}
