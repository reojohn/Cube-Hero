import playerAvatarPng from '../assets/player-avatars/default-cube-keeper.webp'
import './PlayerAvatar.css'
import { useLocalPlayer } from './LocalPlayerProvider'

/** The local player portrait, with an uploaded square photo or default mascot. */
export default function PlayerAvatar({
  className = '',
  decorative = false,
}: { className?: string; decorative?: boolean }) {
  const {avatarUrl} = useLocalPlayer()
  return <span
    className={`cube-player-avatar ${className}`.trim()}
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : 'Player profile picture'}
    aria-hidden={decorative ? true : undefined}
  >
    <img src={avatarUrl || playerAvatarPng} alt="" width={512} height={512} decoding="async" loading="eager" draggable={false}/>
  </span>
}
