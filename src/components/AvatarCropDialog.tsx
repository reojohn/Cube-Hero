import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Check, Image as ImageIcon, RotateCcw, X, ZoomIn } from 'lucide-react'
import { PLAYER_AVATAR_EXPORT_SIZE, playerAvatarCropGeometry } from '../lib/localPlayerAvatar'
import './AvatarCropDialog.css'

type Props = {file: File; onSave: (dataUrl: string) => boolean; onClose: () => void}
type Position = {x: number; y: number}

export default function AvatarCropDialog({ file, onSave, onClose }: Props) {
  const [sourceUrl, setSourceUrl] = useState('')
  const [dimensions, setDimensions] = useState<{width:number;height:number}|null>(null)
  const [size, setSize] = useState(280)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState<Position>({x:0,y:0})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dragging = useRef<{pointerId:number; startX:number; startY:number; origin:Position}|null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setSourceUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (event:KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => {document.body.style.overflow = previous;document.removeEventListener('keydown',onKey)}
  }, [onClose])
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const measure = () => setSize(viewport.getBoundingClientRect().width || 280)
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(viewport)
    return () => observer?.disconnect()
  }, [])
  const geometry = dimensions ? playerAvatarCropGeometry(dimensions.width, dimensions.height, size, zoom, position.x, position.y) : null
  const clamp = (next:Position, nextZoom=zoom):Position => {
    if (!dimensions) return {x:0,y:0}
    const result = playerAvatarCropGeometry(dimensions.width, dimensions.height, size, nextZoom, next.x, next.y)
    return {x:result.x,y:result.y}
  }
  const onPointerDown = (event:ReactPointerEvent<HTMLDivElement>) => {
    if (!dimensions || busy || dragging.current) return
    dragging.current = {pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,origin:{x:geometry?.x??0,y:geometry?.y??0}}
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event:ReactPointerEvent<HTMLDivElement>) => {
    const active = dragging.current
    if (!active || active.pointerId!==event.pointerId) return
    setPosition(clamp({x:active.origin.x+event.clientX-active.startX,y:active.origin.y+event.clientY-active.startY}))
  }
  const stopDrag = (event:ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current?.pointerId===event.pointerId) dragging.current=null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const changeZoom = (value:number) => {setZoom(value);setPosition(previous=>clamp(previous,value))}
  const save = () => {
    const image = imageRef.current
    if (!image || !dimensions || !geometry || busy) return
    setBusy(true);setError('')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = PLAYER_AVATAR_EXPORT_SIZE
      canvas.height = PLAYER_AVATAR_EXPORT_SIZE
      const context = canvas.getContext('2d')
      if (!context) throw new Error('The image editor is unavailable in this browser.')
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      // A subtle opaque background also handles PNGs with transparency.
      context.fillStyle = '#111827'
      context.fillRect(0,0,canvas.width,canvas.height)
      context.drawImage(image, geometry.sourceX, geometry.sourceY, geometry.sourceSize, geometry.sourceSize,0,0,canvas.width,canvas.height)
      const result = canvas.toDataURL('image/jpeg',.84)
      if (!onSave(result)) throw new Error('Unable to save this photo. Please free some browser storage and try again.')
      onClose()
    } catch (cause) {setError(cause instanceof Error?cause.message:'Could not crop this image. Try another photo.')}
    finally {setBusy(false)}
  }
  return <div className="cube-avatar-modal-backdrop" onPointerDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="cube-avatar-modal" role="dialog" aria-modal="true" aria-labelledby="cube-avatar-dialog-title" aria-describedby="cube-avatar-dialog-help">
      <header className="cube-avatar-modal-header"><div><span className="cube-avatar-kicker"><ImageIcon size={15}/> PLAYER CUSTOMIZATION</span><h2 id="cube-avatar-dialog-title">Crop your profile picture</h2><p id="cube-avatar-dialog-help">Move your photo and zoom in. Your avatar will be saved as a square.</p></div><button ref={closeRef} type="button" className="cube-avatar-close" onClick={onClose} aria-label="Cancel photo editing"><X size={20}/></button></header>
      <div className="cube-avatar-crop-viewport" ref={viewportRef} role="img" aria-label="Square crop preview. Drag the image to reposition it." onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
        {sourceUrl&&<img ref={imageRef} src={sourceUrl} alt="" draggable={false} onLoad={event=>{const image=event.currentTarget;setDimensions({width:image.naturalWidth,height:image.naturalHeight})}} onError={()=>setError('This image could not be opened. Try a PNG, JPG, or WebP photo.')} style={geometry?{width:geometry.displayWidth,height:geometry.displayHeight,transform:`translate(-50%, -50%) translate(${geometry.x}px, ${geometry.y}px)`}:{opacity:0}}/>}
        <span className="cube-avatar-crop-guide" aria-hidden="true"/>
      </div>
      <div className="cube-avatar-zoom"><label htmlFor="cube-avatar-zoom"><ZoomIn size={17}/> Zoom <strong>{zoom.toFixed(2)}×</strong></label><input id="cube-avatar-zoom" type="range" min="1" max="3" step="0.05" value={zoom} disabled={!dimensions||busy} onChange={event=>changeZoom(Number(event.target.value))}/></div>
      <div className="cube-avatar-modal-actions"><button type="button" className="btn btn-outline" onClick={()=>{setZoom(1);setPosition({x:0,y:0})}} disabled={busy}><RotateCcw size={16}/> Reset crop</button><button type="button" className="btn btn-primary" onClick={save} disabled={!dimensions||busy}><Check size={17}/>{busy?'Saving…':'Save picture'}</button></div>
      {error&&<p className="cube-avatar-error" role="alert">{error}</p>}
      <p className="cube-avatar-storage-note">Saved only on this device · 320 × 320 px · No upload to a server</p>
    </section>
  </div>
}
