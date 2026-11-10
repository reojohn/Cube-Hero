import playerAvatarPng from '../assets/player-avatar.png'
import './PlayerAvatar.css'

/** The local default player portrait, reused anywhere the player is identified.
 * This is a visual-only identity (Cube Hero has no account/profile upload yet).
 */
export default function PlayerAvatar({
  className = '',
  decorative = false,
}: { className?: string; decorative?: boolean }) {
  return <span
    className={`cube-player-avatar ${className}`.trim()}
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : 'Player profile picture'}
    aria-hidden={decorative ? true : undefined}
  >
    <img src={playerAvatarPng} alt="" width={512} height={512} decoding="async" loading="eager" draggable={false}/>
  </span>
}
