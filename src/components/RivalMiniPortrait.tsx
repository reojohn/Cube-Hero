import { memo, useState } from 'react'
import { BrainCircuit } from 'lucide-react'
import type { RivalProfile } from '../lib/rivals'
import { getRivalPortraitPngUrl, getRivalPortraitThumbnailUrl, getRivalPortraitUrl } from '../lib/rivalPortraits'

/** Small static rival portrait used in dense UI (leaderboards, compact cards).
 *  Uses the lightweight 160px thumbnail first to keep desktop and mobile lists
 *  fast, then falls back to the full WebP, PNG and finally a simple icon.
 */
const RivalMiniPortrait = memo(function RivalMiniPortrait({ rival, className = '' }: { rival: RivalProfile; className?: string }) {
  const [fallback, setFallback] = useState(0)
  const sources = [
    getRivalPortraitThumbnailUrl(rival.difficulty),
    getRivalPortraitUrl(rival.difficulty),
    getRivalPortraitPngUrl(rival.difficulty),
  ].filter((src): src is string => Boolean(src))
  return <span
    className={`rival-mini-portrait ${className}`.trim()}
    role="img"
    aria-label={`${rival.name} character portrait`}
    title={rival.name}
  >
    {sources[fallback]
      ? <img
          src={sources[fallback]}
          alt=""
          aria-hidden="true"
          width={160}
          height={160}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFallback(index => index + 1)}
        />
      : <BrainCircuit size={16} aria-hidden="true" />}
  </span>
})

export default RivalMiniPortrait
