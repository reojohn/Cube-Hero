import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, ArrowRight, DoorOpen, RotateCcw, ShieldAlert, Trash2, X } from 'lucide-react'
import './ConfirmationModal.css'

export type ConfirmationTone = 'warning' | 'danger'
export type ConfirmationIcon = 'leave' | 'warning' | 'delete' | 'reset'

export type ConfirmationDetails = {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  tone?: ConfirmationTone
  icon?: ConfirmationIcon
  eyebrow?: string
  details?: ReactNode
}

type Props = ConfirmationDetails & {
  open?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Shared, accessible CubeHero confirmation for race navigation and data deletion.
 * Portaled above race UI and any mobile dock. Focus is contained and restored. */
export default function ConfirmationModal({
  open = true, title, message, confirmLabel, cancelLabel = 'Cancel',
  tone = 'warning', icon = 'warning', eyebrow = 'CUBEHERO · CONFIRM ACTION',
  details, onCancel, onConfirm,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const cancelCallback = useRef(onCancel)
  cancelCallback.current = onCancel

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      // Prevent Space/Enter on modal buttons from also controlling an active
      // Stackmat-style race timer behind the dialog.
      if ((event.code === 'Space' || event.key === 'Enter') && panelRef.current?.contains(document.activeElement)) {
        event.stopPropagation()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        cancelCallback.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const buttons = Array.from(panelRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
      if (!buttons.length) return
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown, true)
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [open])

  if (!open) return null
  const Icon = icon === 'delete' ? Trash2 : icon === 'reset' ? RotateCcw : icon === 'leave' ? DoorOpen : AlertTriangle
  return createPortal(
    <div className="ch-confirm-overlay" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <section ref={panelRef} role="alertdialog" aria-modal="true" aria-labelledby="ch-confirm-title" aria-describedby="ch-confirm-description"
        className={`ch-confirm-modal ch-confirm-${tone}`}>
        <div className="ch-confirm-orb" aria-hidden="true" />
        <div className="ch-confirm-heading">
          <div className="ch-confirm-kicker"><ShieldAlert size={14} aria-hidden="true" /> {eyebrow}</div>
          <button className="ch-confirm-close" type="button" onClick={onCancel} aria-label="Close confirmation"><X size={19}/></button>
        </div>
        <div className="ch-confirm-icon" aria-hidden="true"><Icon size={27}/></div>
        <div className="ch-confirm-copy">
          <h2 id="ch-confirm-title">{title}</h2>
          <p id="ch-confirm-description">{message}</p>
        </div>
        {details && <div className="ch-confirm-details">{details}</div>}
        <div className="ch-confirm-actions">
          <button ref={cancelRef} type="button" className="ch-confirm-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="ch-confirm-cta" onClick={onConfirm}>
            {confirmLabel} <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>, document.body,
  )
}
