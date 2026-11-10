import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Clock3, Flag, Keyboard, ShieldAlert, ShieldCheck, Zap } from 'lucide-react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { InspectionPenalty } from '../lib/racing'

type Props = {
  elapsedMs: number
  penalty: InspectionPenalty
  opponentLabel: string
  round: number
  holding: boolean
  holdArmed: boolean
  holdProgress: number
  holdTooShort: boolean
  onHoldPointerDown: (event:ReactPointerEvent<HTMLElement>)=>void
  onHoldPointerUp: (event:ReactPointerEvent<HTMLElement>)=>void
  onHoldPointerCancel: (event:ReactPointerEvent<HTMLElement>)=>void
}

/**
 * Self-contained inspection UI. Every layout-critical style is intentionally
 * inline: the modal is portaled to <body>, and must remain readable even if a
 * previous version of styles.css is cached on the user's machine.
 * The source of truth for the clock and penalties remains RaceRoom.
 */
export default function InspectionModal({ elapsedMs, penalty, opponentLabel, round, holding, holdArmed, holdProgress, holdTooShort, onHoldPointerDown, onHoldPointerUp, onHoldPointerCancel }: Props) {
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const isLate = penalty === 'plus2'
  const isDnf = penalty === 'dnf'
  const remaining = Math.max(0, (isLate ? 17000 : 15000) - elapsedMs) / 1000
  const progress = Math.min(100, Math.max(0, ((15000 - elapsedMs) / 15000) * 100))
  const accent = isDnf ? '#fb7185' : isLate ? '#fbbf24' : '#ae83ff'
  const status = holding ? (isDnf ? 'PAUSED · DNF' : isLate ? 'PAUSED · +2 PENALTY' : 'INSPECTION PAUSED') : isDnf ? 'DNF — TIME EXPIRED' : isLate ? '+2 SECOND PENALTY' : 'INSPECTION ACTIVE'
  const readout = remaining.toFixed(1).padStart(4, '0')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    startButtonRef.current?.focus({ preventScroll: true })
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  const overlay: CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 2147483000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 'clamp(12px, 3vw, 28px)', boxSizing: 'border-box',
    overflowY: 'auto', overscrollBehavior: 'contain',
    background: 'rgba(4, 6, 20, 0.88)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  }
  const card: CSSProperties = {
    boxSizing: 'border-box', position: 'relative', isolation: 'isolate',
    width: '100%', maxWidth: '520px', flex: '0 1 520px',
    padding: 'clamp(18px, 4vw, 29px)', borderRadius: '24px',
    margin: 'auto', border: '1px solid rgba(169, 125, 250, 0.66)',
    background: 'linear-gradient(145deg, #201c3e 0%, #15172e 52%, #10152a 100%)',
    boxShadow: '0 32px 95px rgba(0,0,0,.72), 0 0 70px rgba(126,70,255,.24)',
    color: '#f7f3ff', fontFamily: 'inherit',
    touchAction:'pan-y', userSelect:'none', WebkitUserSelect:'none',
  }
  const content: CSSProperties = { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }
  const badge: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', border: '1px solid #5c4a8e', background: 'rgba(96,62,156,.28)',
    borderRadius: '999px', padding: '7px 10px', fontSize: '11px',
    lineHeight: 1.3, fontWeight: 700, color: '#eadbff', whiteSpace: 'nowrap',
  }

  return createPortal(
    <div style={overlay} data-cubehero-inspection-modal="v4">
      <section role="dialog" aria-modal="true" aria-labelledby="ch-modal-title" aria-describedby="ch-modal-description" style={card}
        onPointerDown={onHoldPointerDown} onPointerUp={onHoldPointerUp} onPointerCancel={onHoldPointerCancel} onLostPointerCapture={onHoldPointerCancel}>
        <div aria-hidden="true" style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 0,
          inset: '0 0 auto', height: '200px', borderRadius: '24px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(160,100,255,.23), transparent 72%)',
        }} />
        <div style={content}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#bd9bff', fontSize: '11px', fontWeight: 850, letterSpacing: '1px' }}>
              <Zap size={16} /> CUBE HERO · RACE READY
            </div>
            <span style={badge}>Round {round} · {opponentLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '22px 0 8px' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: '45px', height: '45px', flex: '0 0 45px', border: '1px solid #735da6', borderRadius: '13px', color: '#d9c3ff', background: '#352851' }}>
              <Clock3 size={23} />
            </span>
            <div style={{ textAlign: 'left' }}>
              <h2 id="ch-modal-title" style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 25px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.6px', color: '#fff' }}>Inspection Countdown</h2>
              <p id="ch-modal-description" style={{ margin: '6px 0 0', color: '#adb9d7', fontSize: '12px', lineHeight: 1.45 }}>Plan your first moves before you race.</p>
            </div>
          </div>

          <div style={{
            display: 'grid', placeItems: 'center', boxSizing: 'border-box', touchAction:'none',
            width: 'min(46vw, 218px)', height: 'min(46vw, 218px)', minWidth: '154px', minHeight: '154px',
            aspectRatio: '1', margin: '16px auto 20px', padding: '9px', borderRadius: '50%',
            background: `conic-gradient(from -90deg, ${accent} ${progress}%, #3c3157 ${progress}%)`,
            boxShadow: `0 0 42px ${isDnf ? '#fb718533' : '#9560ff55'}, 0 0 0 7px #7c61c515`,
          }} aria-label={`Inspection: ${(elapsedMs / 1000).toFixed(1)} seconds elapsed`}>
            <div style={{
              boxSizing: 'border-box', width: '100%', height: '100%', borderRadius: '50%',
              border: '1px solid rgba(180,155,250,.28)',
              background: 'radial-gradient(ellipse at 45% 28%, #2c2851 0%, #141729 80%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}>
              <span style={{ fontSize: '10px', color: '#cfc1ea', fontWeight: 800, letterSpacing: '1.6px' }}>{holding ? 'TIME FROZEN' : isDnf ? 'TIME EXPIRED' : isLate ? 'UNTIL DNF' : 'TIME LEFT'}</span>
              <span style={{ fontSize: 'clamp(37px, 8vw, 63px)', color: '#fff', fontWeight: 850, fontVariantNumeric: 'tabular-nums', letterSpacing: '-3px', lineHeight: 1.05, whiteSpace: 'nowrap' }}>
                {readout}<small style={{ fontSize: '.4em', marginLeft: '2px', color: '#d0baff', letterSpacing: 0 }}>s</small>
              </span>
              <span role="status" style={{
                maxWidth: '95%', textAlign: 'center', padding: '5px 8px',
                border: `1px solid ${isDnf ? '#9f4160' : isLate ? '#9e7138' : '#2c8267'}`,
                background: isDnf ? '#491e30' : isLate ? '#4b361c' : '#12392f',
                borderRadius: '999px', color: isDnf ? '#ffc0cf' : isLate ? '#ffdf98' : '#9cf5d1',
                fontSize: 'clamp(7px, 1.5vw, 9px)', fontWeight: 850, letterSpacing: '.4px', whiteSpace: 'nowrap',
              }}>{status}</span>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '11px', textAlign: 'left',
            padding: '12px 14px', background: '#1a2239',
            borderRadius: '12px', border: '1px solid #3b496a', marginBottom: '17px',
          }}>
            <span style={{ color: isDnf ? '#fb7185' : isLate ? '#fbbf24' : '#81efc3', flex: '0 0 auto', marginTop: '1px' }}>
              {isLate || isDnf ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
            </span>
            <p style={{ fontSize: '12px', color: '#d6dff0', margin: 0, lineHeight: 1.6 }}>
              {isDnf ? 'Inspection passed 17 seconds. This solve will count as DNF, but you can still complete the round.' :
                isLate ? '15 seconds passed: starting now adds a +2-second penalty. Start before 17 seconds to avoid DNF.' :
                'Start before 15 seconds for no penalty. 15–17 seconds: +2. At 17 seconds: DNF.'}
            </p>
          </div>

          <div role="status" aria-live="polite" style={{
            margin:'0 0 14px', padding:'12px 14px', borderRadius:'12px',
            border:`1px solid ${holdArmed?'#39dca2':'#54467f'}`,
            background:holdArmed?'rgba(14,87,67,.27)':'#211c3b',
            boxShadow:holdArmed?'0 0 22px rgba(42,224,160,.2)':'none',
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'10px',marginBottom:'9px'}}>
              <strong style={{fontSize:'12px',color:holdArmed?'#8cf7ca':'#ece4ff'}}>
                {holdArmed?'● GREEN — READY TO RELEASE':holding?'HOLD STEADY…':holdTooShort?'TOO SHORT — TRY AGAIN':'HOLD TO ARM · 1.5 SECONDS'}
              </strong>
              <span style={{fontSize:'11px',fontVariantNumeric:'tabular-nums',color:'#c4b8e2'}}>{holding?`${(Math.min(1500, holdProgress*15)/1000).toFixed(1)} / 1.5s`:'SPACE / TOUCH'}</span>
            </div>
            <div aria-label="Arming progress" style={{height:'7px',borderRadius:'99px',overflow:'hidden',background:'#3c3555'}}>
              <div style={{height:'100%',width:`${holdProgress}%`,borderRadius:'99px',transition:'background .15s',background:holdArmed?'#3ee6ad':'linear-gradient(90deg,#7956ff,#c276ff)'}}/>
            </div>
          </div>

          <button
            type="button"
            ref={startButtonRef}
            onClick={(e)=>e.preventDefault()}
            aria-label="Hold for 1.5 seconds then release to start the race; you can also hold the Spacebar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', touchAction:'none',
              width: '100%', minHeight: '56px', boxSizing: 'border-box', padding: '12px 14px',
              border: '1px solid #c8a6ff', borderRadius: '12px',
              background:holdArmed?'linear-gradient(105deg, #117a5c, #0ab88c)':'linear-gradient(105deg, #5a52fb, #9435ed)', color: '#fff',
              fontFamily: 'inherit', fontSize: '15px', fontWeight: 850, letterSpacing: '.3px', cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(140,64,244,.4), inset 0 1px 0 rgba(255,255,255,.26)',
            }}>
            <Flag size={19} /> {holdArmed?'RELEASE TO START':holding?'KEEP HOLDING…':'HOLD TO START'}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 9px', borderRadius: '7px', border: '1px solid #ffffff88', background: '#18183988', fontSize: '11px', fontWeight: 850 }}><Keyboard size={14} /> SPACE</span>
          </button>

          <p style={{ margin: '12px 0 0', textAlign: 'center', color: '#99a5c0', fontSize: '11px', lineHeight: 1.5 }}>
            Inspection pauses while holding. Release after 1.5s to start; an early release resumes inspection. The original bar remains below the racers.
          </p>
        </div>
      </section>
    </div>,
    document.body,
  )
}
