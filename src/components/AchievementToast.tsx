import { useEffect, useRef } from 'react'
import {
  Award, BookOpen, Check, Crown, Flame, Flag, Ghost, GraduationCap,
  Medal, Rocket, ShieldCheck, Sparkles, Star, Swords, Timer, Trophy, X, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Achievement } from '../lib/heroJourney'
import { playGameSound } from '../lib/gameAudio'
import './AchievementToast.css'

const ICONS: Record<string, LucideIcon> = {
  timer: Timer, trophy: Trophy, zap: Zap, sparkles: Sparkles,
  rocket: Rocket, ghost: Ghost, medal: Medal, swords: Swords,
  layers: ShieldCheck, graduation: GraduationCap, book: BookOpen,
  flag: Flag, crown: Crown, star: Star, flame: Flame,
}

const DISPLAY_MS = 5000

type Props = {
  achievement: Achievement
  moreCount: number
  reducedMotion: boolean
  onDismiss: () => void
  onView: () => void
}

/** One-at-a-time toast, without continuously running React timers/animations.
 * All announcements originate from the game's existing achievement rules.
 */
export default function AchievementToast({ achievement, moreCount, reducedMotion, onDismiss, onView }: Props) {
  const playedSound = useRef(false)
  useEffect(() => {
    if (!playedSound.current) {
      playedSound.current = true
      playGameSound('achievement')
    }
    const timeout = window.setTimeout(onDismiss, DISPLAY_MS)
    return () => window.clearTimeout(timeout)
  }, [achievement.id, onDismiss])

  const Icon = ICONS[achievement.icon] ?? Award
  return (
    <aside className={`ch-achievement-toast${reducedMotion ? ' ch-achievement-toast--still' : ''}`}
      role="status" aria-live="polite" aria-atomic="true" aria-label={`Achievement unlocked: ${achievement.title}`}>
      <span className="ch-achievement-toast__accent" aria-hidden="true" />
      <div className="ch-achievement-toast__icon" aria-hidden="true"><Icon size={28} strokeWidth={1.85} /><Check className="ch-achievement-toast__check" size={12}/></div>
      <div className="ch-achievement-toast__copy">
        <div className="ch-achievement-toast__eyebrow"><Sparkles size={12} aria-hidden="true" /> ACHIEVEMENT UNLOCKED</div>
        <strong>{achievement.title}</strong>
        <p>{achievement.description}</p>
        <button type="button" className="ch-achievement-toast__view" onClick={onView}>View achievements <span aria-hidden="true">↗</span></button>
        {moreCount > 0 && <small className="ch-achievement-toast__queued">+{moreCount} more unlocked</small>}
      </div>
      <button type="button" className="ch-achievement-toast__close" aria-label="Dismiss achievement notification" onClick={onDismiss}><X size={16}/></button>
      <span className="ch-achievement-toast__timebar" aria-hidden="true" />
    </aside>
  )
}
