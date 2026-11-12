import { ShieldCheck } from 'lucide-react'
import ConfirmationModal from './ConfirmationModal'

type Props = {
  open: boolean
  qualifyingSolves: number
  duels: number
  onCancel: () => void
  onConfirm: () => void
}

/** Same premium confirmation as race navigation and other saved-data actions. */
export default function GhostResetModal({ open, qualifyingSolves, duels, onCancel, onConfirm }: Props) {
  return <ConfirmationModal
    open={open}
    eyebrow="GHOST RACE · RESET PROGRESS"
    title="Reset your Ghost Race?"
    message="Your qualifying solves, personal best and Ghost Race history saved on this device will be deleted. This cannot be undone."
    confirmLabel="Yes, reset progress"
    cancelLabel="Keep my progress"
    tone="danger"
    icon="reset"
    onCancel={onCancel}
    onConfirm={onConfirm}
    details={<>
      <div className="ch-confirm-metrics">
        <div className="ch-confirm-metric"><strong>{qualifyingSolves}</strong><span>QUALIFYING SOLVES</span></div>
        <div className="ch-confirm-metric"><strong>{duels}</strong><span>GHOST RACES</span></div>
      </div>
      <div className="ch-confirm-safe-note"><ShieldCheck size={17} aria-hidden="true"/> Your AI Race results and statistics will not be affected.</div>
    </>}
  />
}
